import Workspace from "../models/workspace.model.js";
import User from "../models/user.model.js";

/* ============ CREATE WORKSPACE ============ */
const createWorkspace = async (req, res) => {
  try {
    const { name, description, image_url } = req.body;

    const newWorkspace = await Workspace.create({
      name,
      description,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      image_url,
      organizationId: req.user.organizationId, members: [{ user: req.user.id, role: "admin" }],
    });

    const populated = await Workspace.findById(newWorkspace._id)
      .populate("members.user", "name email");

    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Workspace name already exists" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

/* ============ GET ALL WORKSPACES ============ */
const getAllWorkspaces = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const workspaces = await Workspace.find().populate("members.user", "name email");
      return res.json(workspaces);
    }

    const workspaces = await Workspace.find({
      "members.user": req.user.id,
    }).populate("members.user", "name email");

    res.json(workspaces);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ============ GET WORKSPACE BY ID ============ */
const getWorkspaceById = async (req, res) => {
  try {
    const { id } = req.params;

    const workspace = await Workspace.findById(id).populate("members.user", "name email role");

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    if (req.user.role === "admin") return res.json(workspace);

    const isMember = workspace.members.some(
      (m) => m.user._id.toString() === req.user.id
    );

    if (!isMember) return res.status(403).json({ message: "Access denied" });

    res.json(workspace);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ============ UPDATE WORKSPACE ============ */
const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    if (req.user.role !== "admin") {
      const member = workspace.members.find(
        (m) => m.user.toString() === req.user.id
      );
      if (!member || member.role !== "admin") {
        return res.status(403).json({ message: "Only workspace admin can update" });
      }
    }

    const updated = await Workspace.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ============ DELETE WORKSPACE ============ */
const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    if (req.user.role !== "admin") {
      const member = workspace.members.find(
        (m) => m.user.toString() === req.user.id
      );
      if (!member || member.role !== "admin") {
        return res.status(403).json({ message: "Only workspace admin can delete" });
      }
    }

    await Workspace.findByIdAndDelete(id);
    res.json({ message: "Workspace deleted successfully" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ============ INVITE MEMBER ============ */
const inviteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role = "member" } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    // Only workspace admin or global admin can invite
    if (req.user.role !== "admin") {
      const member = workspace.members.find(
        (m) => m.user.toString() === req.user.id
      );
      if (!member || member.role !== "admin") {
        return res.status(403).json({ message: "Only workspace admin can invite members" });
      }
    }

    // Find the user by email
    const userToInvite = await User.findOne({ email: email.toLowerCase() });
    if (!userToInvite) {
      return res.status(404).json({ message: "No user found with that email. Ask them to sign up first." });
    }

    // Check if already a member
    const alreadyMember = workspace.members.some(
      (m) => m.user.toString() === userToInvite._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    workspace.members.push({ user: userToInvite._id, role });
    await workspace.save();

    const updated = await Workspace.findById(id).populate("members.user", "name email role");
    res.json({ message: "Member added successfully", workspace: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ============ REMOVE MEMBER ============ */
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    if (req.user.role !== "admin") {
      const member = workspace.members.find((m) => m.user.toString() === req.user.id);
      if (!member || member.role !== "admin") {
        return res.status(403).json({ message: "Only workspace admin can remove members" });
      }
    }

    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== userId
    );
    await workspace.save();

    res.json({ message: "Member removed successfully" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

export const workspaceController = {
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
};
