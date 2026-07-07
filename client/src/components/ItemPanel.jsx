import { useState } from "react";
import { X, Calendar, User, Tag, Clock, MessageSquare, Paperclip, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import api from "../utils/api";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  TODO:"#c4c4c4", IN_PROGRESS:"#fdab3d", IN_REVIEW:"#a358df",
  DONE:"#00c875", BLOCKED:"#e2445c", CANCELLED:"#808080",
};
const STATUS_LABELS = {
  TODO:"Not Started", IN_PROGRESS:"Working on it", IN_REVIEW:"In Review",
  DONE:"Done", BLOCKED:"Stuck", CANCELLED:"Cancelled",
};

export default function ItemPanel({ task, onClose, onUpdate }) {
  const [editing, setEditing] = useState({});
  const [comment, setComment] = useState("");
  const [saving,  setSaving]  = useState(false);

  const update = async (field, value) => {
    setSaving(true);
    try {
      const { data } = await api.put(`/task/${task._id}`, { [field]: value });
      onUpdate?.(data);
      toast.success("Updated");
    } catch { toast.error("Failed"); }
    setSaving(false);
    setEditing({});
  };

  const postComment = async () => {
    if (!comment.trim()) return;
    try {
      const { data } = await api.post(`/task/${task._id}/comment`, { text: comment });
      onUpdate?.(data); setComment("");
    } catch { toast.error("Failed to post comment"); }
  };

  return (
    <div className="item-panel">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--card-border)", position: "sticky", top: 0, background: "var(--card-bg)", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge status={task.status} onChange={(s) => update("status", s)} />
          {saving && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Saving...</span>}
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, color: "var(--text-muted)" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--main-bg)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
          <X size={18} />
        </button>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Title */}
        {editing.title ? (
          <textarea defaultValue={task.title} autoFocus rows={2}
            style={{ width: "100%", fontSize: 20, fontWeight: 800, border: "2px solid var(--accent)", borderRadius: 8, padding: "8px 12px", fontFamily: "inherit", resize: "none", color: "var(--text-primary)", background: "var(--card-bg)", outline: "none", marginBottom: 16 }}
            onBlur={(e) => update("title", e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") setEditing({}); }} />
        ) : (
          <h2 onClick={() => setEditing({ title: true })} style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, cursor: "pointer", lineHeight: 1.3, padding: "4px 0" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--main-bg)"; e.currentTarget.style.borderRadius = "6px"; e.currentTarget.style.padding = "4px 6px"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.padding = "4px 0"; }}>
            {task.title}
          </h2>
        )}

        {/* Properties grid */}
        <div style={{ display: "grid", gap: 1, marginBottom: 20, background: "var(--card-border)", border: "1px solid var(--card-border)", borderRadius: 10, overflow: "hidden" }}>
          {[
            {
              label: "Assignee",
              icon: User,
              content: (
                <span style={{ fontSize: 13, color: task.assignee ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {task.assignee ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div className="avatar" style={{ width: 22, height: 22, fontSize: 10, background: `hsl(${(task.assignee.name?.charCodeAt(0)||0)*7%360},65%,55%)` }}>
                        {task.assignee.name?.[0]?.toUpperCase()}
                      </div>
                      {task.assignee.name}
                    </div>
                  ) : "No assignee"}
                </span>
              ),
            },
            {
              label: "Due Date",
              icon: Calendar,
              content: editing.dueDate ? (
                <input type="date" defaultValue={task.dueDate?.slice(0,10)} autoFocus className="input" style={{ fontSize: 12, padding: "3px 8px", width: 140 }}
                  onBlur={(e) => update("due_date", e.target.value)} onKeyDown={(e) => { if (e.key==="Escape") setEditing({}); }} />
              ) : (
                <span onClick={() => setEditing({ dueDate: true })} style={{ fontSize: 13, cursor: "pointer", color: task.dueDate ? (new Date(task.dueDate) < new Date() && task.status !== "DONE" ? "#e2445c" : "var(--text-primary)") : "var(--text-muted)" }}>
                  {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "Set due date"}
                </span>
              ),
            },
            {
              label: "Priority",
              icon: Tag,
              content: (
                <select defaultValue={task.priority} onChange={(e) => update("priority", e.target.value)}
                  style={{ border: "none", background: "transparent", fontSize: 13, cursor: "pointer", color: { CRITICAL:"#e2445c", HIGH:"#fdab3d", MEDIUM:"#579bfc", LOW:"#00c875" }[task.priority] || "var(--text-primary)", fontWeight: 700, outline: "none", fontFamily: "inherit" }}>
                  {["CRITICAL","HIGH","MEDIUM","LOW"].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              ),
            },
            {
              label: "Type",
              icon: Tag,
              content: (
                <select defaultValue={task.type} onChange={(e) => update("type", e.target.value)}
                  style={{ border: "none", background: "transparent", fontSize: 13, cursor: "pointer", color: "var(--text-primary)", outline: "none", fontFamily: "inherit" }}>
                  {["TASK","BUG","FEATURE","IMPROVEMENT","EPIC","STORY","OTHER"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              ),
            },
            {
              label: "Created",
              icon: Clock,
              content: <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{format(new Date(task.createdAt), "MMM d, yyyy")}</span>,
            },
          ].map(({ label, icon: Icon, content }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--card-bg)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, width: 110, flexShrink: 0 }}>
                <Icon size={13} style={{ color: "var(--text-muted)" }} />
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
              </div>
              {content}
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Description</p>
          {editing.description ? (
            <textarea defaultValue={task.description} autoFocus rows={4}
              style={{ width: "100%", border: "2px solid var(--accent)", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", color: "var(--text-primary)", background: "var(--card-bg)", outline: "none", lineHeight: 1.6 }}
              onBlur={(e) => update("description", e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") setEditing({}); }} />
          ) : (
            <div onClick={() => setEditing({ description: true })}
              style={{ fontSize: 13, color: task.description ? "var(--text-primary)" : "var(--text-muted)", cursor: "pointer", padding: "10px 12px", borderRadius: 8, lineHeight: 1.6, minHeight: 60, border: "1px dashed var(--card-border)" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--card-border)"}>
              {task.description || "Add a description..."}
            </div>
          )}
        </div>

        {/* Comments */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            <MessageSquare size={13} style={{ display: "inline", marginRight: 5 }} />
            Updates ({task.comments?.length || 0})
          </p>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div className="avatar" style={{ background: "#6c5ce7", width: 28, height: 28, fontSize: 12, flexShrink: 0 }}>U</div>
            <div style={{ flex: 1 }}>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Write an update..."
                style={{ width: "100%", border: "1px solid var(--card-border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", resize: "none", color: "var(--text-primary)", background: "var(--card-bg)", outline: "none" }}
                onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                onBlur={(e)  => e.target.style.borderColor = "var(--card-border)"} />
              {comment && (
                <button onClick={postComment} className="btn btn-primary" style={{ marginTop: 6, fontSize: 12, padding: "5px 14px" }}>Post</button>
              )}
            </div>
          </div>
          {task.comments?.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div className="avatar" style={{ background: `hsl(${(c.user?.name?.charCodeAt(0)||0)*7%360},65%,55%)`, width: 28, height: 28, fontSize: 11, flexShrink: 0 }}>
                {c.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{c.user?.name || "User"}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{format(new Date(c.createdAt), "MMM d, h:mm a")}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const color = STATUS_COLORS[status] || "#c4c4c4";
  const label = STATUS_LABELS[status] || status;
  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setOpen((p) => !p)} className="status-label"
        style={{ background: color, color: status === "TODO" ? "#555" : "#fff", cursor: "pointer", padding: "5px 14px", fontSize: 12 }}>
        {label} <ChevronDown size={11} style={{ display: "inline", marginLeft: 4 }} />
      </div>
      {open && (
        <div style={{ position: "absolute", top: "110%", left: 0, zIndex: 99, background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", padding: 6, minWidth: 170 }}
          onMouseLeave={() => setOpen(false)}>
          {Object.entries(STATUS_LABELS).map(([key, lbl]) => (
            <div key={key} onClick={() => { onChange(key); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", cursor: "pointer", borderRadius: 6 }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--main-bg)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: STATUS_COLORS[key] }} />
              <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{lbl}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
