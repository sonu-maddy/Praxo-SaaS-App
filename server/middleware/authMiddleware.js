import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; 

export const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.headers?.authorization?.replace("Bearer ", "");

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ← YAHAN DB SE USER FETCH KARO taaki organizationId mile
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = {
      id:             user._id.toString(),
      email:          user.email,
      role:           user.role,
      orgRole:        user.orgRole,
      organizationId: user.organizationId,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};