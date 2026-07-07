import Organization, { PLANS } from "../models/organization.model.js";
import Workspace from "../models/workspace.model.js";
import Project from "../models/project.model.js";

/* ── Check workspace creation limit ── */
export const checkWorkspaceLimit = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user.organizationId) return next(); // superadmin bypass

    const org = await Organization.findById(user.organizationId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    const plan = PLANS[org.plan] || PLANS.free;
    if (plan.maxWorkspaces === Infinity) return next();

    const count = await Workspace.countDocuments({ organizationId: org._id });
    if (count >= plan.maxWorkspaces) {
      return res.status(403).json({
        message: `Your ${plan.name} plan allows max ${plan.maxWorkspaces} workspace(s). Upgrade to create more.`,
        code: "PLAN_LIMIT_WORKSPACE",
        upgrade: true,
      });
    }
    req.org = org;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Check project creation limit ── */
export const checkProjectLimit = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user.organizationId) return next();

    const org = await Organization.findById(user.organizationId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    const plan = PLANS[org.plan] || PLANS.free;
    if (plan.maxProjects === Infinity) return next();

    const count = await Project.countDocuments({ organizationId: org._id });
    if (count >= plan.maxProjects) {
      return res.status(403).json({
        message: `Your ${plan.name} plan allows max ${plan.maxProjects} project(s). Upgrade to create more.`,
        code: "PLAN_LIMIT_PROJECT",
        upgrade: true,
      });
    }
    req.org = org;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Check member limit ── */
export const checkMemberLimit = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user.organizationId) return next();

    const org = await Organization.findById(user.organizationId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    const plan = PLANS[org.plan] || PLANS.free;
    if (plan.maxMembers === Infinity) return next();

    const memberCount = org.members.length;
    if (memberCount >= plan.maxMembers) {
      return res.status(403).json({
        message: `Your ${plan.name} plan allows max ${plan.maxMembers} member(s). Upgrade to add more.`,
        code: "PLAN_LIMIT_MEMBER",
        upgrade: true,
      });
    }
    req.org = org;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Check feature access ── */
export const checkFeature = (featureName) => async (req, res, next) => {
  try {
    const user = req.user;
    if (!user.organizationId) return next();

    const org = await Organization.findById(user.organizationId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    const plan = PLANS[org.plan] || PLANS.free;
    if (plan.features.includes("all") || plan.features.includes(featureName)) {
      return next();
    }

    return res.status(403).json({
      message: `This feature (${featureName}) is not available in your ${plan.name} plan. Upgrade to access it.`,
      code: "PLAN_LIMIT_FEATURE",
      feature: featureName,
      upgrade: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
