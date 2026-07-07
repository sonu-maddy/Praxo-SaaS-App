import express from "express";
import {
  createTask, getProjectTasks, getWorkspaceTasks,
  getTaskById, updateTask, deleteTask, addComment,
} from "../controllers/task.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { canCreateTask, canUpdateTask } from "../middleware/rbac.js";

const router = express.Router();

router.post("/create-task",           authMiddleware, canCreateTask, createTask);
router.get("/workspace/:workspaceId", authMiddleware, getWorkspaceTasks);
router.get("/details/:taskId",        authMiddleware, getTaskById);
router.put("/:taskId",                authMiddleware, canUpdateTask, updateTask);
router.delete("/:taskId",             authMiddleware, deleteTask);
router.post("/:taskId/comment",       authMiddleware, addComment);
router.get("/:projectId",             authMiddleware, getProjectTasks);  // LAST

export default router;
