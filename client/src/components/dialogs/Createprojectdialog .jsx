import { useState } from "react";
import { X, FolderOpen } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { addProject } from "../../features/projectSlice";
import api from "../../utils/api";
import toast from "react-hot-toast";

const ICONS = ["📋","🚀","🐛","✨","🎯","📊","🏗️","⚡","🔥","🌟","💡","🎨","📱","🛒","🤖","🎓"];

export default function CreateProjectDialog({ isOpen, onClose, onCreated }) {
  const dispatch          = useDispatch();
  const currentWorkspace  = useSelector((s) => s.workspace.currentWorkspace);

  const [form, setForm] = useState({
    name: "", description: "", icon: "📋",
    status: "active", priority: "medium", boardType: "scrum",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentWorkspace?._id) {
      toast.error("Select a workspace first");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/project/create-project", {
        name:        form.name,
        description: form.description,
        icon:        form.icon,
        status:      form.status,
        priority:    form.priority,
        boardType:   form.boardType,
        workspaceId: currentWorkspace._id,
      });
      dispatch(addProject(data));
      toast.success("Board created!");
      onCreated?.(data);
      onClose();
      setForm({ name:"", description:"", icon:"📋", status:"active", priority:"medium", boardType:"scrum" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create board");
    }
    setLoading(false);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 460 }}>

        {/* Header */}
        <div style={{
          padding: "18px 20px",
          borderBottom: "1px solid var(--card-border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:32, height:32, borderRadius:8,
              background:"#f0edff",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <FolderOpen size={16} color="#6c5ce7" />
            </div>
            <h2 style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)" }}>
              New Board
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
        <form onSubmit={handleSubmit} style={{ padding:20, display:"grid", gap:16 }}>

          {/* Icon picker */}
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:8 }}>
              Board Icon
            </label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  style={{
                    width:36, height:36, fontSize:18,
                    border: `2px solid ${form.icon === icon ? "var(--accent)" : "var(--card-border)"}`,
                    borderRadius:8, cursor:"pointer",
                    background: form.icon === icon ? "var(--accent-light)" : "var(--card-bg)",
                    transition:"all 0.15s",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Board name */}
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>
              Board Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Marketing Campaign, Sprint Q2..."
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
              rows={2}
              placeholder="What is this board for?"
              className="input"
              style={{ resize:"none" }}
            />
          </div>

          {/* Board type / Priority */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>
                Board Type
              </label>
              <select
                value={form.boardType}
                onChange={(e) => setForm({ ...form, boardType: e.target.value })}
                className="input"
                style={{ fontSize:12, padding:"7px 10px" }}
              >
                <option value="scrum">Scrum</option>
                <option value="kanban">Kanban</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="input"
                style={{ fontSize:12, padding:"7px 10px" }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Workspace info */}
          {currentWorkspace && (
            <div style={{
              padding:"8px 12px", background:"var(--main-bg)",
              border:"1px solid var(--card-border)", borderRadius:8,
              fontSize:12, color:"var(--text-muted)",
            }}>
              📁 Will be created in: <strong style={{ color:"var(--text-primary)" }}>{currentWorkspace.name}</strong>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Creating…" : "Create Board"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}