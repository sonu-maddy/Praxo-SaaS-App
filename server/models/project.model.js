import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String },
    icon:        { type: String, default: "📋" },
    color:       { type: String, default: "#6c5ce7" },
    status:      { type: String, enum: ["planning","active","completed","on_hold","cancelled"], default: "planning" },
    priority:    { type: String, enum: ["low","medium","high","critical"], default: "medium" },
    progress:    { type: Number, default: 0, min: 0, max: 100 },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    owner:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectLead: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    assignedUsers:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    startDate:   Date,
    endDate:     Date,
    isFavorite:  { type: Boolean, default: false },
    lastVisited: { type: Date, default: Date.now },
    boardType:   { type: String, enum: ["scrum","kanban","custom"], default: "scrum" },
    tags:        [String],
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
