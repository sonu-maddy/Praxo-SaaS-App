import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true, trim: true },
    description:    { type: String },
    slug:           { type: String },
    image_url:      { type: String },
    color:          { type: String, default: "#6c5ce7" },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    members: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["admin","lead","member","viewer"], default: "member" },
    }],
    isFavorite: { type: Boolean, default: false },
    settings: {
      isPrivate: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Workspace", workspaceSchema);
