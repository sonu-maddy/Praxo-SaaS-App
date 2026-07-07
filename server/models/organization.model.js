import mongoose from "mongoose";

/* ── Plan definitions ─────────────────────────────── */
export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    maxWorkspaces: 1,
    maxProjects: 3,
    maxMembers: 5,
    features: ["basic_kanban", "task_comments"],
    storage: "2GB",
  },
  starter: {
    name: "Starter",
    price: 499,
    maxWorkspaces: 3,
    maxProjects: 10,
    maxMembers: 15,
    features: [
      "basic_kanban",
      "task_comments",
      "sprint_planning",
      "analytics",
      "file_attachments",
    ],
    storage: "10GB",
  },
  pro: {
    name: "Pro",
    price: 1499,
    maxWorkspaces: Infinity,
    maxProjects: Infinity,
    maxMembers: 50,
    features: [
      "basic_kanban",
      "task_comments",
      "sprint_planning",
      "analytics",
      "file_attachments",
      "gantt",
      "time_tracking",
      "ai_assist",
      "slack_integration",
    ],
    storage: "100GB",
  },
  enterprise: {
    name: "Enterprise",
    price: 0,
    maxWorkspaces: Infinity,
    maxProjects: Infinity,
    maxMembers: Infinity,
    features: ["all"],
    storage: "Unlimited",
  },
};

const orgSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    logo: { type: String },
    industry: { type: String },
    size: { type: String, enum: ["1-5", "6-15", "16-50", "51-200", "200+"] },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    plan: {
      type: String,
      enum: ["free", "starter", "pro", "enterprise"],
      default: "free",
    },

    subscription: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySubscriptionId: String,
      status: {
        type: String,
        enum: ["active", "cancelled", "past_due", "trialing", "none"],
        default: "none",
      },
      currentPeriodEnd: Date,
      trialEndsAt: Date,
      history: [
        {
          plan: String,
          amount: Number,
          currency: { type: String, default: "INR" },
          razorpayOrderId: String,
          razorpayPaymentId: String,
          purchaseDate: { type: Date, default: Date.now },
          periodEnd: Date,
          status: { type: String, default: "paid" },
        },
      ],
    },

    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["org_owner", "org_admin", "member", "viewer"],
          default: "member",
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],

    settings: {
      allowMembersCreateWorkspace: { type: Boolean, default: false },
      allowMembersInvite: { type: Boolean, default: false },
      defaultRole: { type: String, default: "member" },
      twoFactorRequired: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

/* Virtual: get plan limits */
orgSchema.virtual("planLimits").get(function () {
  return PLANS[this.plan] || PLANS.free;
});

orgSchema.set("toJSON", { virtuals: true });
orgSchema.set("toObject", { virtuals: true });

export default mongoose.model("Organization", orgSchema);
