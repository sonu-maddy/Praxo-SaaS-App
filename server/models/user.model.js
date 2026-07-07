import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    googleId: { type: String },
    image:    { type: String },
    role:     { type: String, enum: ["admin", "user"], default: "user" },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    orgRole: {
      type: String,
      enum: ["org_owner","org_admin","workspace_lead","project_lead","member","viewer"],
      default: "member",
    },
    preferences: {
      theme: { type: String, enum: ["light","dark","system"], default: "light" },
    },
    lastLogin:  Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
