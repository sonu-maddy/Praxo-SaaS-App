import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/signin", authLimiter, authController.signIn);
router.post("/signup", authLimiter, authController.signUp);
router.post("/signout", authController.signOut);
router.post("/google-signin", authController.googleSignIn);

router.get("/cookie-user", authMiddleware, authController.sessionUser);

// Forgot Password flow
router.post("/send-otp", authLimiter, authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/reset-password", authController.resetPassword);

export default router;
