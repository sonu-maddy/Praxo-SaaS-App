import mongoose from "mongoose";
import Project from "../models/project.model.js";
import Workspace from "../models/workspace.model.js";
import User from "../models/user.model.js";

/* ============ CREATE PROJECT ============ */
export const createProject = async (req, res) => {
  try {
    const { name, description, workspaceId, projectLead, teamMembers, status, priority, startDate, endDate } = req.body;

    const assignedUsers = [req.user.id, projectLead, ...(teamMembers || [])].filter(Boolean);

    const project = await Project.create({
      name,
      description,
      workspaceId, organizationId: req.user.organizationId,
      owner: req.user.id,
      projectLead: projectLead || req.user.id,
      teamMembers: teamMembers || [],
      assignedUsers: [...new Set(assignedUsers.map(String))],
      status: status || "planning",
      priority: priority || "medium",
      startDate,
      endDate,
    });

    const populated = await Project.findById(project._id)
      .populate("projectLead", "name email")
      .populate("teamMembers", "name email");

    res.status(201).json(populated);
  } catch (error) {
    console.log("CREATE PROJECT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============ GET ALL PROJECTS ============ */
export const getProjects = async (req, res) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) return res.status(400).json({ message: "workspaceId required" });

    const role = req.user.role?.toLowerCase();
    const userId = new mongoose.Types.ObjectId(req.user.id);

    let filter = { workspaceId: new mongoose.Types.ObjectId(workspaceId) };
    if (role !== "admin") filter.assignedUsers = userId;

    const projects = await Project.find(filter)
      .populate("projectLead", "name email")
      .populate("teamMembers", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============ GET PROJECT BY ID ============ */
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user.role?.toLowerCase();
    const userId = req.user.id;

    const project = await Project.findById(id)
      .populate("projectLead", "name email")
      .populate("teamMembers", "name email")
      .populate("owner", "name email");

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (role !== "admin" && !project.assignedUsers.map(String).includes(String(userId))) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(project);
  } catch (error) {
    console.error("GET PROJECT BY ID ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============ UPDATE PROJECT ============ */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role?.toLowerCase();

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isAdmin = role === "admin";
    const isOwner = String(project.owner) === String(userId);
    const isLead = String(project.projectLead) === String(userId);

    if (!isAdmin && !isOwner && !isLead) {
      return res.status(403).json({ message: "Not authorized to update this project" });
    }

    const { name, description, status, priority, startDate, endDate, progress } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status.toLowerCase();
    if (priority !== undefined) updateData.priority = priority.toLowerCase();
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (progress !== undefined) updateData.progress = progress;

    const updated = await Project.findByIdAndUpdate(id, updateData, { new: true })
      .populate("projectLead", "name email")
      .populate("teamMembers", "name email");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============ DELETE PROJECT ============ */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role?.toLowerCase();

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isAdmin = role === "admin";
    const isOwner = String(project.owner) === String(userId);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Only owner or admin can delete project" });
    }

    await Project.findByIdAndDelete(id);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============ ADD MEMBER TO PROJECT ============ */
export const addMemberToProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const userId = req.user.id;
    const role = req.user.role?.toLowerCase();

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isAdmin = role === "admin";
    const isLead = String(project.projectLead) === String(userId);

    if (!isAdmin && !isLead) {
      return res.status(403).json({ message: "Only admin or project lead can add members" });
    }

    const userToAdd = await User.findOne({ email: email.toLowerCase() });
    if (!userToAdd) return res.status(404).json({ message: "User not found" });

    // Verify user is workspace member
    const workspace = await Workspace.findById(project.workspaceId);
    const isWorkspaceMember = workspace?.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );
    if (!isWorkspaceMember) {
      return res.status(400).json({ message: "User must be a workspace member first" });
    }

    // Check if already a project member
    if (project.teamMembers.map(String).includes(userToAdd._id.toString())) {
      return res.status(400).json({ message: "User is already a project member" });
    }

    project.teamMembers.push(userToAdd._id);
    if (!project.assignedUsers.map(String).includes(userToAdd._id.toString())) {
      project.assignedUsers.push(userToAdd._id);
    }
    await project.save();

    const updated = await Project.findById(id)
      .populate("projectLead", "name email")
      .populate("teamMembers", "name email");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============ REMOVE MEMBER FROM PROJECT ============ */
export const removeMemberFromProject = async (req, res) => {
  try {
    const { id, userId: targetUserId } = req.params;
    const reqUserId = req.user.id;
    const role = req.user.role?.toLowerCase();

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isAdmin = role === "admin";
    const isLead = String(project.projectLead) === String(reqUserId);

    if (!isAdmin && !isLead) {
      return res.status(403).json({ message: "Only admin or project lead can remove members" });
    }

    project.teamMembers = project.teamMembers.filter(
      (m) => m.toString() !== targetUserId
    );
    project.assignedUsers = project.assignedUsers.filter(
      (u) => u.toString() !== targetUserId
    );
    await project.save();

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// organizationId auto-added from user
