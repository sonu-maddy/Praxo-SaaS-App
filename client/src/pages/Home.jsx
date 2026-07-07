import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Star, Clock, Search, Zap, ArrowRight, Plus, Layout } from "lucide-react";
import api from "../utils/api";

/* Board thumbnail preview */
function BoardPreview({ color = "#6c5ce7" }) {
  const rows = [
    [80, "#00c875"], [60, "#fdab3d"], [90, "#579bfc"],
    [50, "#e2445c"], [70, "#a358df"],
  ];
  return (
    <div className="board-preview" style={{ background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)` }}>
      <div style={{ marginBottom: 8, height: 4, width: 60, borderRadius: 4, background: `${color}60` }} />
      {rows.map(([w, c], i) => (
        <div key={i} className="board-preview-row">
          <div className="preview-line" style={{ maxWidth: `${w}%` }} />
          <div className="preview-chip" style={{ background: c, opacity: 0.8 }} />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const user = useSelector((s) => s.user.user);
  const { currentWorkspace } = useSelector((s) => s.workspace);
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [org, setOrg] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    api.get("/org/me").then((r) => setOrg(r.data)).catch(() => { });
  }, []);

  useEffect(() => {
    if (!currentWorkspace?._id) return;
    api.get(`/project/all-project?workspaceId=${currentWorkspace._id}`)
      .then((r) => {
        setProjects(r.data.slice(0, 6));
        setAllProjects(r.data);
      }).catch(() => { });
  }, [currentWorkspace]);


  const toggleFavorite = (id) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id
          ? { ...project, isFavorite: !project.isFavorite }
          : project
      )
    );
  };

  const COLORS = ["#6c5ce7", "#0073ea", "#00c875", "#fdab3d", "#e2445c", "#a358df"];

  const QuickLinks = [
    { label: "View all boards", icon: Layout, to: "/" },
    { label: "My work", icon: Clock, to: "/my-work" },
    { label: "Invite members", icon: Plus, to: "/team" },
    { label: "Upgrade plan", icon: Zap, to: "/billing" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", height: "calc(100vh - 50px)", overflow: "hidden" }}>

      {/* Main */}
      <div style={{ overflowY: "auto", padding: "28px 32px" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            {greeting}, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Quickly access your recent boards, Inbox and workspaces
          </p>
          <hr style={{ "color": "var(--card-border)" }} />
        </div>


        {/* Recently visited */}
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Clock size={15} style={{ color: "var(--text-muted)" }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Recently visited</h2>
          </div>

          {projects.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, color: "var(--text-muted)" }}>
              <Layout size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <p style={{ fontSize: 14 }}>No boards yet — create your first board!</p>
              <button onClick={() => navigate("/board")} className="btn btn-primary" style={{ marginTop: 16 }}>
                <Plus size={14} /> Create Board
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {projects.map((p, i) => (
                <Link key={p._id} to={`/board?id=${p._id}`} style={{ textDecoration: "none" }}>
                  <div className="board-card">
                    <BoardPreview color={COLORS[i % COLORS.length]} />
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                        <button onClick={(e) => { e.preventDefault(); toggleFavorite(p.id); }}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                          <Star size={14} style={{ color: p.isFavorite ? "#fdab3d" : "var(--text-muted)", fill: p.isFavorite ? "#fdab3d" : "none" }} />
                        </button>
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {org?.name} › {currentWorkspace?.name}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Create new board card */}
              <Link to="/board" style={{ textDecoration: "none" }}>
                <div className="board-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 160, gap: 8, background: "var(--main-bg)", borderStyle: "dashed", color: "var(--text-muted)" }}>
                  <Plus size={24} style={{ opacity: 0.5 }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>New Board</span>
                </div>
              </Link>
            </div>
          )}
        </section>

        {/* Favorites */}
        {allProjects.filter((p) => p.isFavorite).length > 0 && (
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Star size={15} style={{ color: "#fdab3d" }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Favorites</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 16 }}>
              {allProjects.filter((p) => p.isFavorite).map((p, i) => (
                <Link key={p._id} to={`/board?id=${p._id}`} style={{ textDecoration: "none" }}>
                  <div className="board-card">
                    <BoardPreview color={COLORS[i % COLORS.length]} />
                    <div style={{ padding: "12px 14px" }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{p.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Right sidebar */}
      <div style={{ borderLeft: "1px solid var(--card-border)", overflowY: "auto", padding: 20, background: "var(--card-bg)" }}>
        {/* Plan widget */}
        {org && (
          <div style={{ background: "var(--accent-light)", border: "1px solid rgba(108,92,231,0.2)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={16} color="white" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{org.name}</p>
                <span className={`plan-badge plan-${org.plan}`}>{org.plan?.toUpperCase()}</span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>
              {org.plan === "free" ? "Upgrade to unlock unlimited boards and team features." : `Active ${org.plan} plan`}
            </p>
            {org.plan === "free" && (
              <Link to="/billing" className="btn btn-accent" style={{ display: "flex", textDecoration: "none", fontSize: 12, padding: "6px 12px", width: "100%", justifyContent: "center" }}>
                Upgrade Plan <ArrowRight size={13} />
              </Link>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Quick Access</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {QuickLinks.map(({ label, icon: Icon, to }) => (
              <Link key={to} to={to} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, textDecoration: "none", color: "var(--text-secondary)", fontSize: 13, fontWeight: 500 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--card-hover)"; e.currentTarget.style.color = "var(--accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                <Icon size={15} /> {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Overview</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Boards", value: allProjects.length, color: "#6c5ce7" },
              { label: "Members", value: org?.members?.length || 0, color: "#0073ea" },
              { label: "Done", value: allProjects.filter((p) => p.status === "completed").length, color: "#00c875" },
              { label: "Active", value: allProjects.filter((p) => p.status === "active").length, color: "#fdab3d" },
            ].map((s) => (
              <div key={s.label} style={{ padding: "12px", background: "var(--main-bg)", border: "1px solid var(--card-border)", borderRadius: 10, textAlign: "center" }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
