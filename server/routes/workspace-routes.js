import { Router } from "express";
import { workspaceController } from "../controllers/workspace.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkWorkspaceLimit } from "../middleware/planLimits.js";
import { onlyOrgOwner } from "../middleware/rbac.js";

const router = Router();

router.post("/",                     authMiddleware, checkWorkspaceLimit, workspaceController.createWorkspace);
router.get("/",                      authMiddleware, workspaceController.getAllWorkspaces);
router.get("/:id",                   authMiddleware, workspaceController.getWorkspaceById);
router.put("/:id",                   authMiddleware, workspaceController.updateWorkspace);
router.delete("/:id",                authMiddleware, workspaceController.deleteWorkspace);
router.post("/:id/members",          authMiddleware, workspaceController.inviteMember);
router.delete("/:id/members/:userId",authMiddleware, workspaceController.removeMember);

export default router;
