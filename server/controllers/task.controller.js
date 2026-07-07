import Task from "../models/task.model.js";
import Project from "../models/project.model.js";

/* ================= CREATE TASK ================= */
export const createTask = async (req, res) => {
  try {
    const { title, description, type, status, priority, due_date, assigneeId, projectId } = req.body;

    const userId = req.user.id;
    const role = req.user.role?.toLowerCase();

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isAdmin = role === "admin";
    const isProjectLeader = String(project.projectLead) === String(userId);

    if (!isAdmin && !isProjectLeader) {
      return res.status(403).json({ message: "Only admin or project leader can create tasks" });
    }

    const task = await Task.create({
      title,
      description,
      type,
      status,
      priority,
      dueDate: due_date,
      assignee: assigneeId || null,
      projectId,
      createdBy: userId,
    });

    const populated = await Task.findById(task._id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email");

    res.status(201).json(populated);
  } catch (err) {
    console.log("CREATE TASK ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET TASKS BY PROJECT ================= */
export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await Task.find({ projectId })
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET TASKS BY WORKSPACE ================= */
export const getWorkspaceTasks = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Get all project IDs in this workspace
    const projects = await Project.find({ workspaceId }).select("_id");
    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({ projectId: { $in: projectIds } })
      .populate("assignee", "name email")
      .populate("projectId", "name")
      .sort({ updatedAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET TASK BY ID ================= */
export const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate("assignee", "name email image")
      .populate("projectId")
      .populate("createdBy", "name email");

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE TASK ================= */
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, type, status, priority, due_date, assigneeId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (due_date !== undefined) updateData.dueDate = due_date;
    if (assigneeId !== undefined) updateData.assignee = assigneeId || null;

    const updated = await Task.findByIdAndUpdate(taskId, updateData, { new: true })
      .populate("assignee", "name email")
      .populate("createdBy", "name email");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE TASK ================= */
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const userId = req.user.id;
    const role = req.user.role?.toLowerCase();
    const project = await Project.findById(task.projectId);

    const isAdmin = role === "admin";
    const isProjectLeader = project && String(project.projectLead) === String(userId);
    const isCreator = String(task.createdBy) === String(userId);

    if (!isAdmin && !isProjectLeader && !isCreator) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    await Task.findByIdAndDelete(taskId);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── ADD COMMENT ── */
export const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text }   = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Comment text required" });

    const task = await Task.findByIdAndUpdate(
      taskId,
      { $push: { comments: { user: req.user.id, text, createdAt: new Date() } } },
      { new: true }
    ).populate("assignee","name email").populate("createdBy","name email").populate("comments.user","name email");

    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
