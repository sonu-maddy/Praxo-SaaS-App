import express from "express";
import {
  createOrganization, getMyOrganization, updateOrganization,
  inviteToOrganization, removeMember, updateMemberRole,
  getPlanInfo,createPaymentOrder,
  verifyPaymentAndUpgrade,
  razorpayWebhook,
  cancelSubscription,
  downloadReceipt
} from "../controllers/organization.controller.js";



import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ── Org CRUD ── */
router.post("/",                    authMiddleware, createOrganization);
router.get("/me",                   authMiddleware, getMyOrganization);
router.put("/me",                   authMiddleware, updateOrganization);

/* ── Members ── */
router.post("/invite",              authMiddleware, inviteToOrganization);
router.delete("/members/:userId",   authMiddleware, removeMember);
router.put("/members/:userId/role", authMiddleware, updateMemberRole);

/* ── Plan & Billing ── */
router.get("/plan",                 authMiddleware, getPlanInfo);
router.post("/payment/order",       authMiddleware, createPaymentOrder);
router.post("/payment/verify",      authMiddleware, verifyPaymentAndUpgrade);
router.post("/payment/cancel",      authMiddleware, cancelSubscription);
router.get("/payment/receipt/:paymentId", authMiddleware, downloadReceipt);

/* ── Razorpay Webhook (no auth — Razorpay calls this) ── */
router.post("/payment/webhook",     express.raw({ type: "application/json" }), razorpayWebhook);



export default router;