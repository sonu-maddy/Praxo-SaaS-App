import Organization, { PLANS } from "../models/organization.model.js";
import User from "../models/user.model.js";
import Workspace from "../models/workspace.model.js";
import Project from "../models/project.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import PDFDocument from "pdfkit";

/* ─── CREATE ORGANIZATION (Company Registration) ─── */
export const createOrganization = async (req, res) => {
  try {
    const { name, industry, size } = req.body;
    const userId = req.user.id;

    const existing = await Organization.findOne({ owner: userId });
    if (existing)
      return res
        .status(400)
        .json({ message: "You already have an organization." });

    // Create slug
    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-") +
      "-" +
      Date.now().toString(36);

    const org = await Organization.create({
      name,
      slug,
      industry,
      size,
      owner: userId,
      plan: "free",
      members: [{ user: userId, role: "org_owner" }],
    });

    // Update user with org info
    await User.findByIdAndUpdate(userId, {
      organizationId: org._id,
      orgRole: "org_owner",
    });

    res.status(201).json(org);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: "Organization name taken." });
    res.status(500).json({ message: err.message });
  }
};

/* ─── GET MY ORGANIZATION ─── */
export const getMyOrganization = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user?.organizationId)
      return res.status(404).json({ message: "No organization found." });

    const org = await Organization.findById(user.organizationId)
      .populate("owner", "name email image")
      .populate("members.user", "name email image orgRole");

    res.json({ ...org.toObject(), planDetails: PLANS[org.plan] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── UPDATE ORGANIZATION ─── */
export const updateOrganization = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user?.organizationId)
      return res.status(404).json({ message: "No organization." });
    if (user.orgRole !== "org_owner" && user.orgRole !== "org_admin") {
      return res.status(403).json({ message: "Insufficient permissions." });
    }

    const { name, industry, size, logo, settings } = req.body;
    const updated = await Organization.findByIdAndUpdate(
      user.organizationId,
      { name, industry, size, logo, settings },
      { new: true },
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── INVITE MEMBER TO ORG ─── */
export const inviteToOrganization = async (req, res) => {
  try {
    const { email, orgRole = "member" } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user?.organizationId)
      return res.status(404).json({ message: "No organization." });
    if (user.orgRole !== "org_owner" && user.orgRole !== "org_admin") {
      return res
        .status(403)
        .json({ message: "Only owner/admin can invite members." });
    }

    const org = await Organization.findById(user.organizationId);

    // Plan limit check
    const plan = PLANS[org.plan] || PLANS.free;
    if (plan.maxMembers !== Infinity && org.members.length >= plan.maxMembers) {
      return res.status(403).json({
        message: `Member limit (${plan.maxMembers}) reached for your ${plan.name} plan. Upgrade to add more.`,
        upgrade: true,
      });
    }

    const invitee = await User.findOne({ email: email.toLowerCase() });
    if (!invitee)
      return res
        .status(404)
        .json({ message: "User not found. They must sign up first." });

    const alreadyMember = org.members.some(
      (m) => m.user.toString() === invitee._id.toString(),
    );
    if (alreadyMember)
      return res.status(400).json({ message: "User is already a member." });

    org.members.push({ user: invitee._id, role: orgRole });
    await org.save();

    await User.findByIdAndUpdate(invitee._id, {
      organizationId: org._id,
      orgRole: orgRole,
    });

    const updated = await Organization.findById(org._id).populate(
      "members.user",
      "name email image",
    );
    res.json({ message: "Member added successfully.", org: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── REMOVE MEMBER ─── */
export const removeMember = async (req, res) => {
  try {
    const { userId: targetId } = req.params;
    const reqUserId = req.user.id;
    const reqUser = await User.findById(reqUserId);

    if (reqUser.orgRole !== "org_owner" && reqUser.orgRole !== "org_admin") {
      return res
        .status(403)
        .json({ message: "Only owner/admin can remove members." });
    }

    const org = await Organization.findById(reqUser.organizationId);
    org.members = org.members.filter((m) => m.user.toString() !== targetId);
    await org.save();

    await User.findByIdAndUpdate(targetId, {
      $unset: { organizationId: "", orgRole: "" },
    });
    res.json({ message: "Member removed." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── UPDATE MEMBER ROLE ─── */
export const updateMemberRole = async (req, res) => {
  try {
    const { userId: targetId } = req.params;
    const { orgRole } = req.body;
    const reqUser = await User.findById(req.user.id);

    if (reqUser.orgRole !== "org_owner") {
      return res.status(403).json({ message: "Only owner can change roles." });
    }

    const org = await Organization.findById(reqUser.organizationId);
    const member = org.members.find((m) => m.user.toString() === targetId);
    if (member) {
      member.role = orgRole;
      await org.save();
    }

    await User.findByIdAndUpdate(targetId, { orgRole });
    res.json({ message: "Role updated." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── GET PLAN INFO + USAGE ─── */
export const getPlanInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user?.organizationId)
      return res.status(404).json({ message: "No organization." });

    const org = await Organization.findById(user.organizationId);
    const plan = PLANS[org.plan] || PLANS.free;
    const workspaces = await Workspace.countDocuments({
      organizationId: org._id,
    });
    const projects = await Project.countDocuments({ organizationId: org._id });

    res.json({
      plan: org.plan,
      planDetails: plan,
      allPlans: PLANS,
      usage: {
        workspaces: { used: workspaces, max: plan.maxWorkspaces },
        projects: { used: projects, max: plan.maxProjects },
        members: { used: org.members.length, max: plan.maxMembers },
      },
      subscription: org.subscription,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
    throw new Error("RAZORPAY_KEY_ID or RAZORPAY_SECRET missing in .env");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });
}

/* ── Razorpay instance (singleton) ── */
// const razorpay = new Razorpay({
//   key_id:     process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

/* ─────────────────────────────────────────────────────
   CREATE ORDER
   POST /api/org/payment/order
   Body: { plan: "starter" | "pro" | "enterprise" }
───────────────────────────────────────────────────── */
export const createPaymentOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    /* Validate plan */
    const planDetails = PLANS[plan];
    if (!planDetails) {
      return res.status(400).json({ message: "Invalid plan." });
    }
    if (planDetails.price === 0) {
      return res
        .status(400)
        .json({ message: "Free plan does not need payment." });
    }
    if (plan === "enterprise") {
      return res
        .status(400)
        .json({ message: "Contact sales for enterprise pricing." });
    }

    const user = await User.findById(req.user.id);
    console.log("User info for payment:", {
      id: user._id,
      email: user.email,
      organizationId: user.organizationId,
    });

    /* Build Razorpay order */
    const options = {
      amount: planDetails.price * 100, // paise (₹1 = 100 paise)
      currency: "INR",
      receipt: `rcpt_sprintOs_${Date.now()}`,
      notes: {
        plan,
        userId: req.user.id,
        organizationId: user.organizationId?.toString(),
      },
    };

    console.log("Creating Razorpay order with options:", options);

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      plan,
      planName: planDetails.name,
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Payment initiation failed." });
  }
};

/* ─────────────────────────────────────────────────────
   VERIFY PAYMENT & UPGRADE
   POST /api/org/payment/verify
   Body: {
     razorpay_order_id, razorpay_payment_id,
     razorpay_signature, plan
   }
───────────────────────────────────────────────────── */
export const verifyPaymentAndUpgrade = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } =
      req.body;

    /* 1. Validate inputs */
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !plan
    ) {
      return res.status(400).json({ message: "Missing payment details." });
    }

    /* 2. Verify HMAC signature */
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ message: "Invalid payment signature. Payment not verified." });
    }

    /* 3. Fetch payment details from Razorpay to double-check amount */
    const razorpay = getRazorpay();
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.status !== "captured") {
      return res
        .status(400)
        .json({ message: `Payment not captured. Status: ${payment.status}` });
    }

    const expectedAmount = PLANS[plan]?.price * 100;
    if (payment.amount !== expectedAmount) {
      return res
        .status(400)
        .json({ message: "Payment amount mismatch. Contact support." });
    }

    /* 4. Upgrade organization plan */
    const user = await User.findById(req.user.id);
    if (!user?.organizationId) {
      return res.status(404).json({ message: "Organization not found." });
    }

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 month subscription

    const org = await Organization.findByIdAndUpdate(
      user.organizationId,
      {
        plan,
        "subscription.razorpayOrderId": razorpay_order_id,
        "subscription.razorpayPaymentId": razorpay_payment_id,
        "subscription.razorpaySignature": razorpay_signature,
        "subscription.status": "active",
        "subscription.currentPeriodEnd": periodEnd,

        $push: {
          "subscription.history": {
            plan,
            amount: PLANS[plan].price,
            currency: "INR",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            purchaseDate: new Date(),
            periodEnd,
            status: "paid",
          },
        },
      },
      { new: true },
    );

    /* 5. Log payment for audit */
    console.log(
      `✅ Payment verified — User: ${req.user.id} | Plan: ${plan} | Payment: ${razorpay_payment_id}`,
    );

    return res.json({
      message: `Successfully upgraded to ${PLANS[plan].name} plan!`,
      org,
      plan,
      nextBillingDate: periodEnd,
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Verification failed." });
  }
};

/* ─────────────────────────────────────────────────────
   WEBHOOK (Razorpay → Server)
   POST /api/org/payment/webhook
   Handle subscription renewals, failures etc.
───────────────────────────────────────────────────── */
export const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    /* Verify webhook signature */
    const expectedSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== expectedSig) {
      return res.status(400).json({ message: "Invalid webhook signature." });
    }

    const { event, payload } = req.body;
    const payment = payload?.payment?.entity;

    switch (event) {
      case "payment.captured": {
        console.log("✅ Webhook: payment.captured", payment?.id);
        break;
      }
      case "payment.failed": {
        console.log("❌ Webhook: payment.failed", payment?.id);
        /* Optionally mark subscription as past_due */
        const notes = payment?.notes || {};
        if (notes.organizationId) {
          await Organization.findByIdAndUpdate(notes.organizationId, {
            "subscription.status": "past_due",
          });
        }
        break;
      }
      case "subscription.charged": {
        console.log(
          "🔄 Webhook: subscription renewed",
          payload?.subscription?.entity?.id,
        );
        break;
      }
      case "subscription.cancelled": {
        console.log("🚫 Webhook: subscription.cancelled");
        const subEntity = payload?.subscription?.entity;
        if (subEntity?.notes?.organizationId) {
          await Organization.findByIdAndUpdate(subEntity.notes.organizationId, {
            "subscription.status": "cancelled",
            plan: "free",
          });
        }
        break;
      }
      default:
        console.log("Razorpay webhook event:", event);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────────────
   CANCEL SUBSCRIPTION
   POST /api/org/payment/cancel
───────────────────────────────────────────────────── */
export const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user?.organizationId)
      return res.status(404).json({ message: "Org not found" });
    if (user.orgRole !== "org_owner")
      return res.status(403).json({ message: "Only owner can cancel." });

    const org = await Organization.findByIdAndUpdate(
      user.organizationId,
      { "subscription.status": "cancelled", plan: "free" },
      { new: true },
    );

    return res.json({
      message: "Subscription cancelled. Downgraded to Free plan.",
      org,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/org/payment/receipt/:paymentId
export const downloadReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const user = await User.findById(req.user.id);
    const org  = await Organization.findById(user.organizationId);

    const record = org?.subscription?.history?.find(
      (h) => h.razorpayPaymentId === paymentId
    );

    if (!record) return res.status(404).json({ message: "Receipt not found" });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=receipt_${paymentId}.pdf`);
    doc.pipe(res);

    // ── Header ──
    doc.fontSize(22).font("Helvetica-Bold").text("Karyafy", 50, 50);
    doc.fontSize(10).font("Helvetica").fillColor("#666")
       .text("Work OS for Modern Teams", 50, 78);
    doc.fillColor("#6c5ce7")
       .rect(50, 95, 510, 2).fill();

    // ── Title ──
    doc.fillColor("#000").fontSize(18).font("Helvetica-Bold")
       .text("Payment Receipt", 50, 115);

    // ── Details ──
    const details = [
      ["Organization",   org.name],
      ["Plan",           record.plan?.toUpperCase() + " Plan"],
      ["Amount Paid",    `INR ${record.amount}.00`],
      ["Purchase Date",  new Date(record.purchaseDate).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })],
      ["Valid Till",     new Date(record.periodEnd).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })],
      ["Order ID",       record.razorpayOrderId],
      ["Payment ID",     record.razorpayPaymentId],
      ["Status",         "PAID"],
    ];

    let y = 155;
    doc.fontSize(10);
    details.forEach(([label, value]) => {
      doc.font("Helvetica-Bold").fillColor("#333").text(label, 50, y);
      doc.font("Helvetica").fillColor("#000").text(value, 220, y);
      doc.fillColor("#eee").rect(50, y + 14, 510, 1).fill();
      y += 28;
    });

    // ── Footer ──
    doc.fillColor("#6c5ce7").rect(50, y + 20, 510, 2).fill();
    doc.fillColor("#666").fontSize(9).font("Helvetica")
       .text("This is a computer-generated receipt. No signature required.", 50, y + 30)
       .text("Support: support@karyafy.io  |  www.karyafy.io", 50, y + 44);

    doc.end();

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
