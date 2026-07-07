import { useState, useEffect } from "react";
import { X, CheckSquare } from "lucide-react";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import toast from "react-hot-toast";

export default function CreateTaskDialog({ isOpen, onClose, projectId, onCreated }) {
  const [form, setForm] = useState({
    title: "", description: "", type: "TASK",
    status: "TODO", priority: "MEDIUM",
    due_date: "", assigneeId: "",
  });
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get("/users").then((r) => setUsers(r.data)).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) { toast.error("No board selected"); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/task/create-task", {
        title:      form.title,
        description:form.description,
        type:       form.type,
        status:     form.status,
        priority:   form.priority,
        due_date:   form.due_date || undefined,
        assigneeId: form.assigneeId || undefined,
        projectId,
      });
      toast.success("Item created!");
      onCreated?.(data);
      onClose();
      setForm({ title:"", description:"", type:"TASK", status:"TODO", priority:"MEDIUM", due_date:"", assigneeId:"" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create item");
    }
    setLoading(false);
  };

  const SELECTS = [
    { key:"type",     label:"Type",
      opts:["TASK","BUG","FEATURE","IMPROVEMENT","EPIC","STORY","OTHER"] },
    { key:"status",   label:"Status",
      opts:["TODO","IN_PROGRESS","IN_REVIEW","DONE","BLOCKED","CANCELLED"] },
    { key:"priority", label:"Priority",
      opts:["CRITICAL","HIGH","MEDIUM","LOW"] },
  ];

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 480 }}>

        {/* Header */}
        <div style={{
          padding: "18px 20px",
          borderBottom: "1px solid var(--card-border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:32, height:32, borderRadius:8,
              background:"#e3f8ee",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <CheckSquare size={16} color="#00c875" />
            </div>
            <h2 style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)" }}>
              Create Item
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background:"none", border:"none", cursor:"pointer", padding:4, borderRadius:6, color:"var(--text-muted)" }}
            onMouseEnter={(e) => e.currentTarget.style.background="var(--main-bg)"}
            onMouseLeave={(e) => e.currentTarget.style.background="none"}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding:20, display:"grid", gap:14 }}>

          {/* Title */}
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>
              Item Name *
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Fix navigation bug on mobile"
              className="input"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Add more details about this item..."
              className="input"
              style={{ resize:"none" }}
            />
          </div>

          {/* Type / Status / Priority */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {SELECTS.map(({ key, label, opts }) => (
              <div key={key}>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>
                  {label}
                </label>
                <select
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="input"
                  style={{ fontSize:12, padding:"7px 10px" }}
                >
                  {opts.map((o) => (
                    <option key={o} value={o}>{o.replace(/_/g," ")}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Due Date / Assignee */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>
                Due Date
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="input"
                style={{ fontSize:12 }}
              />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>
                Assignee
              </label>
              <select
                value={form.assigneeId}
                onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                className="input"
                style={{ fontSize:12, padding:"7px 10px" }}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:4 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Creating…" : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}