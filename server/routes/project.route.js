import express from "express";
import {
  createProject, getProjects, getProjectById,
  updateProject, deleteProject, addMemberToProject, removeMemberFromProject,
} from "../controllers/project.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkProjectLimit } from "../middleware/planLimits.js";

const router = express.Router();

router.post("/create-project",            authMiddleware, checkProjectLimit, createProject);
router.get("/all-project",                authMiddleware, getProjects);
router.get("/:id",                        authMiddleware, getProjectById);
router.put("/:id",                        authMiddleware, updateProject);
router.delete("/:id",                     authMiddleware, deleteProject);
router.post("/:id/members",               authMiddleware, addMemberToProject);
router.delete("/:id/members/:userId",     authMiddleware, removeMemberFromProject);

export default router;
