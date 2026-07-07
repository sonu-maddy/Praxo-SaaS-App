'use client'
import { useState, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Home, CheckSquare, Inbox, Users, Settings, CreditCard,
  ChevronDown, ChevronRight, Plus, Search, Zap, LogOut,
  FolderOpen, Star, Clock, MoreHorizontal, Hash,
} from "lucide-react";
import { logoutUser } from "../features/userSlice";
import { setCurrentWorkspace, setWorkspaces } from "../features/workspaceSlice";
import api from "../utils/api";

const WS_COLORS = ["#6c5ce7","#0073ea","#00c875","#fdab3d","#e2445c","#a358df","#579bfc","#ff7575"];

export default function Sidebar() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const user      = useSelector((s) => s.user.user);
  const { workspaces, currentWorkspace } = useSelector((s) => s.workspace);
  const [projects, setProjects]   = useState([]);
  const [wsOpen,   setWsOpen]     = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  /* load workspaces */
  useEffect(() => {
    api.get("/workspace").then((r) => dispatch(setWorkspaces(r.data))).catch(() => {});
  }, []);

  /* load projects for current workspace */
  useEffect(() => {
    if (!currentWorkspace?._id) return;
    api.get(`/project/all-project?workspaceId=${currentWorkspace._id}`)
      .then((r) => setProjects(r.data)).catch(() => {});
  }, [currentWorkspace]);

  const handleLogout = async () => {
    try { await api.post("/auth/signout"); } catch {}
    localStorage.removeItem("token");
    dispatch(logoutUser());
    navigate("/signin");
  };

  const wsColor = WS_COLORS[workspaces.findIndex((w) => w._id === currentWorkspace?._id) % WS_COLORS.length] || "#6c5ce7";

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--sb-border)" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6c5ce7,#a29bfe)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Zap size={16} color="white" strokeWidth={2.5} />
        </div>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em" }}>SprintOS</span>
        {user?.orgRole && (
          <span className={`plan-badge plan-${user?.plan || "free"}`} style={{ marginLeft: "auto", fontSize: 10 }}>
            {(user?.plan || "free").toUpperCase()}
          </span>
        )}
      </div>

      {/* Top nav items */}
      <div style={{ padding: "8px 6px 4px" }}>
        {[
          { to: "/",        icon: Home,        label: "Home"    },
          { to: "/my-work", icon: CheckSquare, label: "My Work" },
          { to: "/inbox",   icon: Inbox,       label: "Inbox"   },
        ].map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === "/"}
            className={({ isActive }) => `sidebar-item${isActive ? " active" : ""}`}>
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      <div style={{ borderTop: "1px solid var(--sb-border)", margin: "4px 0" }} />

      {/* Workspace section */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }} className="no-scrollbar">
        <div style={{ padding: "4px 12px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--sb-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Workspace</span>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setSearchOpen((p) => !p)} style={{ background: "none", border: "none", cursor: "pointer", padding: 3, borderRadius: 4 }}>
              <Search size={13} color="var(--sb-text-muted)" />
            </button>
          </div>
        </div>

        {/* Workspace selector */}
        {workspaces.length > 0 && (
          <div style={{ margin: "4px 6px 2px" }}>
            {workspaces.map((ws, i) => (
              <div key={ws._id}>
                <div
                  onClick={() => { dispatch(setCurrentWorkspace(ws)); setWsOpen(true); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", cursor: "pointer",
                    borderRadius: 6, background: currentWorkspace?._id === ws._id ? "var(--sb-active)" : "transparent",
                    marginBottom: 2, transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (currentWorkspace?._id !== ws._id) e.currentTarget.style.background = "var(--sb-hover)"; }}
                  onMouseLeave={(e) => { if (currentWorkspace?._id !== ws._id) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: WS_COLORS[i % WS_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                    {ws.name?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ flex: 1, color: "#fff", fontSize: 13, fontWeight: 600, truncate: "true", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ws.name}</span>
                  <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setWsOpen((p) => !p); }}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 2, borderRadius: 4, color: "var(--sb-text-muted)" }}>
                      {wsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </button>
                  </div>
                </div>

                {/* Projects under workspace */}
                {currentWorkspace?._id === ws._id && wsOpen && (
                  <div style={{ marginLeft: 10, marginBottom: 4 }}>
                    {projects.map((p) => (
                      <NavLink key={p._id} to={`/board?id=${p._id}`}
                        className={({ isActive }) => `sidebar-item${isActive ? " active" : ""}`}
                        style={{ fontSize: 12, padding: "5px 8px", gap: 7 }}>
                        <span style={{ fontSize: 14 }}>{p.icon || "📋"}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{p.name}</span>
                        {p.isFavorite && <Star size={10} style={{ color: "#fdab3d", fill: "#fdab3d", flexShrink: 0 }} />}
                      </NavLink>
                    ))}
                    <NewBoardButton workspaceId={ws._id} onCreated={(p) => setProjects((prev) => [p, ...prev])} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add workspace */}
        {(user?.orgRole === "org_owner" || user?.role === "admin") && (
          <NewWorkspaceButton onCreated={(ws) => { dispatch(setWorkspaces([...workspaces, ws])); dispatch(setCurrentWorkspace(ws)); }} />
        )}

        <div style={{ borderTop: "1px solid var(--sb-border)", margin: "8px 0 4px" }} />

        {/* Bottom nav */}
        {[
          { to: "/team",     icon: Users,      label: "Team Members" },
          { to: "/settings", icon: Settings,   label: "Settings"     },
          { to: "/billing",  icon: CreditCard, label: "Plans & Billing"},
        ].map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-item${isActive ? " active" : ""}`} style={{ fontSize: 12 }}>
            <Icon size={14} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* User footer */}
      <div style={{ padding: "8px 10px", borderTop: "1px solid var(--sb-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8 }}
          className="sidebar-item" >
          <div className="avatar" style={{ background: `hsl(${(user?.name?.charCodeAt(0) || 0) * 7 % 360}, 65%, 55%)`, width: 28, height: 28, fontSize: 12 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "#fff", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
            <p style={{ color: "var(--sb-text-muted)", fontSize: 11 }}>{user?.orgRole || "member"}</p>
          </div>
          <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4 }} title="Logout">
            <LogOut size={14} color="var(--sb-text-muted)" />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ── Inline new board button ── */
function NewBoardButton({ workspaceId, onCreated }) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    const name = prompt("Board name:");
    if (!name) return;
    setLoading(true);
    try {
      const { data } = await api.post("/project/create-project", {
        name, workspaceId, status: "active", priority: "medium",
      });
      onCreated(data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create board");
    }
    setLoading(false);
  };
  return (
    <button onClick={handleClick} disabled={loading}
      style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", width: "100%", background: "none", border: "none", cursor: "pointer", color: "var(--sb-text-muted)", fontSize: 12, borderRadius: 6 }}
      onMouseEnter={(e) => e.currentTarget.style.background = "var(--sb-hover)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
      <Plus size={13} /> Add board
    </button>
  );
}

/* ── New workspace button ── */
function NewWorkspaceButton({ onCreated }) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    const name = prompt("Workspace name:");
    if (!name) return;
    setLoading(true);
    try {
      const { data } = await api.post("/workspace", { name });
      onCreated(data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
    setLoading(false);
  };
  return (
    <button onClick={handleClick} disabled={loading}
      style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 16px", width: "100%", background: "none", border: "none", cursor: "pointer", color: "var(--sb-text-muted)", fontSize: 12 }}
      onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
      onMouseLeave={(e) => e.currentTarget.style.color = "var(--sb-text-muted)"}>
      <Plus size={13} /> Add Workspace
    </button>
  );
}
