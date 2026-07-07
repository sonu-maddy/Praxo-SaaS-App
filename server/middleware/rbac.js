import Project from "../models/project.model.js";
import Workspace from "../models/workspace.model.js";

/* Role hierarchy */
const ROLE_LEVEL = {
  org_owner:      100,
  org_admin:      80,
  workspace_lead: 60,
  project_lead:   40,
  member:         20,
  viewer:         10,
  admin:          100, // platform admin
};

/* ── Check org role ── */
export const requireOrgRole = (...roles) => (req, res, next) => {
  const userRole = req.user?.orgRole || req.user?.role;
  const allowed  = roles.some(r => ROLE_LEVEL[userRole] >= ROLE_LEVEL[r]);
  if (!allowed) {
    return res.status(403).json({ message: `This action requires one of these roles: ${roles.join(", ")}` });
  }
  next();
};

/* ── Only org owner can create workspaces (unless setting allows it) ── */
export const onlyOrgOwner = (req, res, next) => {
  const role = req.user?.orgRole || req.user?.role;
  if (role !== "org_owner" && role !== "admin") {
    return res.status(403).json({ message: "Only the organization owner can perform this action." });
  }
  next();
};

/* ── Only project lead or above can create tasks ── */
export const canCreateTask = async (req, res, next) => {
  try {
    const userId    = req.user.id;
    const orgRole   = req.user?.orgRole || req.user?.role;
    const projectId = req.body.projectId || req.params.projectId;

    // Platform admin or org owner → always allowed
    if (orgRole === "admin" || orgRole === "org_owner" || orgRole === "org_admin") return next();

    // Check if user is project lead
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isLead = String(project.projectLead) === String(userId);
    if (!isLead) {
      return res.status(403).json({ message: "Only the project lead or admin can create tasks." });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Can update task (members can update their assigned tasks) ── */
export const canUpdateTask = async (req, res, next) => {
  try {
    const Task    = (await import("../models/task.model.js")).default;
    const userId  = req.user.id;
    const orgRole = req.user?.orgRole || req.user?.role;
    const taskId  = req.params.taskId;

    if (orgRole === "admin" || orgRole === "org_owner" || orgRole === "org_admin") return next();

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project   = await Project.findById(task.projectId);
    const isLead    = project && String(project.projectLead) === String(userId);
    const isAssignee = String(task.assignee) === String(userId);
    const isCreator  = String(task.createdBy) === String(userId);

    if (!isLead && !isAssignee && !isCreator) {
      return res.status(403).json({ message: "You can only update tasks assigned to you or that you created." });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
