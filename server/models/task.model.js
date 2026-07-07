import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  { user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, text: String, },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String },
    type:        { type: String, enum: ["TASK","BUG","FEATURE","IMPROVEMENT","EPIC","STORY","SUBTASK","OTHER"], default: "TASK" },
    status:      { type: String, enum: ["TODO","IN_PROGRESS","IN_REVIEW","DONE","BLOCKED","CANCELLED"], default: "TODO" },
    priority:    { type: String, enum: ["CRITICAL","HIGH","MEDIUM","LOW"], default: "MEDIUM" },
    dueDate:     Date,
    startDate:   Date,
    estimatedHours: { type: Number, default: 0 },
    loggedHours:    { type: Number, default: 0 },
    assignee:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    projectId:   { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    parentTask:  { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    subtasks:    [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    tags:        [String],
    comments:    [commentSchema],
    attachments: [{ name: String, url: String, uploadedAt: Date }],
    order:       { type: Number, default: 0 },
    completedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
