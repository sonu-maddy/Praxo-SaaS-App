// ═══ KanbanView ═══════════════════════════════════════
import { useState } from "react";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import api from "../../utils/api";
import toast from "react-hot-toast";

const COLS = [
  { key: "TODO",        label: "Not Started",  color: "#c4c4c4" },
  { key: "IN_PROGRESS", label: "Working on it",color: "#fdab3d" },
  { key: "IN_REVIEW",   label: "In Review",    color: "#a358df" },
  { key: "DONE",        label: "Done",         color: "#00c875" },
  { key: "BLOCKED",     label: "Stuck",        color: "#e2445c" },
];

export function KanbanView({ tasks, project, onCardClick, onRefresh }) {
  const [adding, setAdding]     = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const handleAdd = async (status) => {
    if (!newTitle.trim()) return;
    try {
      await api.post("/task/create-task", { title: newTitle, status, projectId: project._id, type: "TASK", priority: "MEDIUM" });
      setNewTitle(""); setAdding(null); onRefresh?.();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleStatusDrop = async (taskId, newStatus) => {
    try { await api.put(`/task/${taskId}`, { status: newStatus }); onRefresh?.(); }
    catch { toast.error("Failed to update"); }
  };

  return (
    <div className="kanban-board" style={{ padding: "16px 24px", overflowX: "auto", height: "100%" }}>
      {COLS.map(({ key, label, color }) => {
        const colTasks = tasks.filter((t) => t.status === key);
        return (
          <div key={key} className="kanban-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { const taskId = e.dataTransfer.getData("taskId"); handleStatusDrop(taskId, key); }}>
            {/* Column header */}
            <div className="kanban-col-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: color, flexShrink: 0 }} />
                <span style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700 }}>{label}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--main-bg)", padding: "1px 7px", borderRadius: 20 }}>{colTasks.length}</span>
              </div>
              <button onClick={() => { setAdding(key); setNewTitle(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 3, borderRadius: 4, color: "var(--text-muted)" }}>
                <Plus size={14} />
              </button>
            </div>

            {/* Cards */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, paddingBottom: 8 }}>
              {colTasks.map((task) => (
                <KanbanCard key={task._id} task={task} onClick={onCardClick} />
              ))}

              {/* Add card inline */}
              {adding === key && (
                <div style={{ background: "var(--card-bg)", border: "2px solid var(--accent)", borderRadius: 8, padding: 10 }}>
                  <input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdd(key); if (e.key === "Escape") setAdding(null); }}
                    placeholder="Item title..." className="input" style={{ fontSize: 13, padding: "6px 8px", marginBottom: 8 }} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => handleAdd(key)} className="btn btn-primary" style={{ fontSize: 11, padding: "4px 10px" }}>Add</button>
                    <button onClick={() => setAdding(null)} className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ task, onClick }) {
  return (
    <div className="kanban-card"
      draggable
      onDragStart={(e) => e.dataTransfer.setData("taskId", task._id)}
      onClick={() => onClick?.(task)}>
      {task.tags?.length > 0 && (
        <div style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
          {task.tags.map((tag) => <span key={tag} className="tag" style={{ fontSize: 10 }}>{tag}</span>)}
        </div>
      )}
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.4 }}>{task.title}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color:
          task.priority === "HIGH" || task.priority === "CRITICAL" ? "#e2445c" :
          task.priority === "MEDIUM" ? "#579bfc" : "#00c875" }}>
          {task.priority}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {task.dueDate && <span style={{ fontSize: 11, color: new Date(task.dueDate) < new Date() ? "#e2445c" : "var(--text-muted)" }}>{format(new Date(task.dueDate),"MMM d")}</span>}
          {task.assignee && (
            <div className="avatar" style={{ width: 22, height: 22, fontSize: 10, background: `hsl(${(task.assignee.name?.charCodeAt(0)||0)*7%360},65%,55%)` }}>
              {task.assignee.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default KanbanView;
