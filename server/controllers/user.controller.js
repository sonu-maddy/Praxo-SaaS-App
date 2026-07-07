import User from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};