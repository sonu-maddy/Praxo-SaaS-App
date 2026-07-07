import User from "../models/user.model.js";
import { generateToken } from "../service/jwt.service.js";
import bcryptjs from "bcryptjs";

// In-memory OTP store (use Redis in production)
const otpStore = new Map(); // email → { otp, expires }

/* ============ SIGN UP ============ */
const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).send("All fields required");
    if (password.length < 6) return res.status(400).send("Password too short");
    if (!/\S+@\S+\.\S+/.test(email))
      return res.status(400).send("Invalid email");

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcryptjs.hash(password, 10);

    const role =
      process.env.ADMIN_EMAIL &&
      email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
        ? "admin"
        : "user";

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = generateToken(newUser);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: newUser._id,
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

/* ============ SIGN IN ============ */
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcryptjs.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId || null,
        orgRole: user.orgRole || null,
      },
    });
  } catch (err) {
    console.error("SignIn error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ============ GOOGLE SIGN IN ============ */
const googleSignIn = async (req, res) => {
  try {
    const { name, email, googleId } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      const role =
        process.env.ADMIN_EMAIL &&
        email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
          ? "admin"
          : "user";
      user = await User.create({ name, email, googleId, role });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============ SIGN OUT ============ */
const signOut = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "Sign out successful" });
};

/* ============ SESSION USER ============ */
const sessionUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.sendStatus(404);

    res.json({
      ...user.toObject(),
      id: user._id.toString(),
    });
  } catch (err) {
    console.error("Session user error:", err);
    res.status(500).send("Server error");
  }
};

/* ============ FORGOT PASSWORD - SEND OTP ============ */
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res
        .status(404)
        .json({ message: "No account found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email.toLowerCase(), { otp, expires });

    // TODO: Replace console.log with actual email service (nodemailer / SendGrid)
    console.log(`🔑 OTP for ${email}: ${otp}`);

    res.json({
      message: "OTP sent to your email",
      // ⚠️ Remove 'otp' from response in production!
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============ VERIFY OTP ============ */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    const stored = otpStore.get(email.toLowerCase());
    if (!stored)
      return res
        .status(400)
        .json({ message: "OTP not found. Request a new one." });
    if (Date.now() > stored.expires) {
      otpStore.delete(email.toLowerCase());
      return res
        .status(400)
        .json({ message: "OTP expired. Request a new one." });
    }
    if (stored.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    // Mark as verified (keep for reset step)
    otpStore.set(email.toLowerCase(), { ...stored, verified: true });

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============ RESET PASSWORD ============ */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }
    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password too short" });

    const stored = otpStore.get(email.toLowerCase());
    if (!stored || !stored.verified || stored.otp !== otp) {
      return res.status(400).json({ message: "Invalid or unverified OTP" });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword },
    );

    otpStore.delete(email.toLowerCase());

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const authController = {
  signUp,
  signIn,
  googleSignIn,
  sessionUser,
  signOut,
  sendOtp,
  verifyOtp,
  resetPassword,
};
