import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import api from "../../utils/api";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  TODO: { bg: "#c4c4c4", label: "Not Started", text: "#555" },
  IN_PROGRESS: { bg: "#fdab3d", label: "Working on it", text: "#fff" },
  IN_REVIEW: { bg: "#a358df", label: "In Review", text: "#fff" },
  DONE: { bg: "#00c875", label: "Done", text: "#fff" },
  BLOCKED: { bg: "#e2445c", label: "Stuck", text: "#fff" },
  CANCELLED: { bg: "#808080", label: "Cancelled", text: "#fff" },
};

const PRIORITY_COLORS = {
  CRITICAL: "#e2445c", HIGH: "#fdab3d", MEDIUM: "#579bfc", LOW: "#00c875",
};

const GROUPS = [
  { key: "IN_PROGRESS", label: "Working on it", color: "#fdab3d" },
  { key: "TODO",        label: "Not Started",   color: "#c4c4c4" },
  { key: "IN_REVIEW",   label: "In Review",     color: "#a358df" },
  { key: "DONE",        label: "Done",          color: "#00c875" },
  { key: "BLOCKED",     label: "Stuck",         color: "#e2445c" },
];

export default function TableView({ tasks, project, onRowClick, onRefresh, canCreate }) {
  const [collapsed, setCollapsed]   = useState({});
  const [selected,  setSelected]    = useState([]);
  const [adding,    setAdding]      = useState(null); // group key
  const [newTitle,  setNewTitle]    = useState("");

  const toggleGroup = (key) => setCollapsed((p) => ({ ...p, [key]: !p[key] }));
  const toggleSelect = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/task/${taskId}`, { status });
      onRefresh?.();
    } catch { toast.error("Failed"); }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selected.length} item(s)?`)) return;
    try {
      await Promise.all(selected.map((id) => api.delete(`/task/${id}`)));
      setSelected([]); onRefresh?.();
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  };

  const handleAddItem = async (status) => {
    if (!newTitle.trim()) return;
    try {
      await api.post("/task/create-task", { title: newTitle, status, projectId: project._id, priority: "MEDIUM", type: "TASK" });
      setNewTitle(""); setAdding(null); onRefresh?.();
      toast.success("Item added");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const COL_STYLE = { padding: "0 12px", fontSize: 13, color: "var(--text-primary)", whiteSpace: "nowrap" };

  return (
    <div style={{ overflowY: "auto", height: "100%", background: "var(--main-bg)" }}>
      {/* Delete toolbar */}
      {selected.length > 0 && (
        <div style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", gap: 10, padding: "8px 24px", background: "#e2445c", color: "white" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.length} item(s) selected</span>
          <button onClick={handleDeleteSelected} className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: 12, padding: "4px 12px" }}>
            <Trash2 size={13} /> Delete
          </button>
          <button onClick={() => setSelected([])} className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: 12, padding: "4px 12px" }}>Cancel</button>
        </div>
      )}

      <div style={{ padding: "0 24px 40px" }}>
        <table className="board-table">
          {/* Column headers */}
          <thead>
            <tr>
              <th style={{ width: 32, padding: "10px 8px" }}></th>
              <th style={{ minWidth: 300, textAlign: "left" }}>Item</th>
              <th style={{ width: 130 }}>Status</th>
              <th style={{ width: 80 }}>Priority</th>
              <th style={{ width: 130 }}>Assignee</th>
              <th style={{ width: 110 }}>Due Date</th>
              <th style={{ width: 90 }}>Type</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>

          <tbody>
            {GROUPS.map(({ key, label, color }) => {
              const groupTasks = tasks.filter((t) => t.status === key);
              if (groupTasks.length === 0 && key !== "TODO") return null;
              const isCollapsed = collapsed[key];

              return (
                <>
                  {/* Group header row */}
                  <tr key={`gh-${key}`}>
                    <td colSpan={8} style={{ padding: 0 }}>
                      <div className="group-header" onClick={() => toggleGroup(key)}
                        style={{ borderLeft: `4px solid ${color}` }}>
                        {isCollapsed ? <ChevronRight size={14} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />}
                        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{label}</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 4 }}>{groupTasks.length}</span>
                      </div>
                    </td>
                  </tr>

                  {/* Task rows */}
                  {!isCollapsed && groupTasks.map((task) => (
                    <tr key={task._id} className="board-row" onClick={() => onRowClick?.(task)}>
                      <td style={{ padding: "0 8px", width: 32 }} onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.includes(task._id)} onChange={() => toggleSelect(task._id)} />
                      </td>
                      <td style={{ ...COL_STYLE, maxWidth: 320, padding: "10px 12px", cursor: "pointer" }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", fontWeight: 500 }}>
                          {task.title}
                        </span>
                        {task.tags?.length > 0 && (
                          <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                            {task.tags.map((tag) => <span key={tag} className="tag" style={{ fontSize: 10 }}>{tag}</span>)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "8px 12px" }} onClick={(e) => e.stopPropagation()}>
                        <StatusDropdown status={task.status} onChange={(s) => handleStatusChange(task._id, s)} />
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: PRIORITY_COLORS[task.priority] || "#999" }}>
                          {task.priority || "—"}
                        </span>
                      </td>
                      <td style={{ ...COL_STYLE, padding: "8px 12px" }}>
                        {task.assignee ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div className="avatar" style={{ width: 24, height: 24, fontSize: 10, background: `hsl(${(task.assignee.name?.charCodeAt(0) || 0) * 7 % 360},65%,55%)` }}>
                              {task.assignee.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{task.assignee.name}</span>
                          </div>
                        ) : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ ...COL_STYLE, padding: "8px 12px", color: "var(--text-secondary)", fontSize: 12 }}>
                        {task.dueDate ? (
                          <span style={{ color: new Date(task.dueDate) < new Date() && task.status !== "DONE" ? "#e2445c" : "var(--text-secondary)" }}>
                            {format(new Date(task.dueDate), "MMM d")}
                          </span>
                        ) : "—"}
                      </td>
                      <td style={{ ...COL_STYLE, padding: "8px 12px" }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--main-bg)", padding: "2px 6px", borderRadius: 4 }}>{task.type}</span>
                      </td>
                      <td style={{ padding: "8px 4px" }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4, opacity: 0.5 }} onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Add item row */}
                  {!isCollapsed && canCreate && (
                    <tr key={`add-${key}`}>
                      <td colSpan={8} style={{ padding: 0 }}>
                        {adding === key ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 40px", borderBottom: "1px solid var(--card-border)" }}>
                            <input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") handleAddItem(key); if (e.key === "Escape") setAdding(null); }}
                              placeholder="Item title..." className="input" style={{ maxWidth: 300, padding: "5px 10px", fontSize: 13 }} />
                            <button onClick={() => handleAddItem(key)} className="btn btn-primary" style={{ padding: "5px 12px", fontSize: 12 }}>Add</button>
                            <button onClick={() => setAdding(null)} className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }}>Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => { setAdding(key); setNewTitle(""); }}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 40px", width: "100%", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, borderBottom: "1px solid var(--card-border)" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "var(--card-hover)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
                            <Plus size={13} /> Add item
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MoreHorizontal({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
    </svg>
  );
}

function StatusDropdown({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const s = STATUS_COLORS[status] || STATUS_COLORS.TODO;
  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setOpen((p) => !p)}
        className="status-label"
        style={{ background: s.bg, color: s.text, cursor: "pointer", minWidth: 100 }}>
        {s.label}
      </div>
      {open && (
        <div style={{ position: "absolute", top: "110%", left: 0, zIndex: 50, background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", padding: 6, minWidth: 160 }}
          onMouseLeave={() => setOpen(false)}>
          {Object.entries(STATUS_COLORS).map(([key, val]) => (
            <div key={key} onClick={() => { onChange(key); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", cursor: "pointer", borderRadius: 6 }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--main-bg)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: val.bg }} />
              <span style={{ fontSize: 12, color: "var(--text-primary)" }}>{val.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
