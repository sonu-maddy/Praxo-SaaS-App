import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { LayoutList, Columns, Calendar, BarChart2, Plus, Filter, Star, MoreHorizontal, Settings } from "lucide-react";
import api from "../utils/api";
import TableView    from "../components/views/TableView";
import KanbanView   from "../components/views/KanbanView";
import CalendarView from "../components/views/CalendarView";
import ChartView    from "../components/views/ChartView";
import ItemPanel    from "../components/ItemPanel";
import CreateTaskDialog    from "../components/dialogs/CreateTaskDialog";
import CreateProjectDialog from "../components/dialogs/Createprojectdialog ";

const VIEWS = [
  { key: "table",    label: "Main Table", Icon: LayoutList },
  { key: "kanban",   label: "Kanban",     Icon: Columns    },
  { key: "calendar", label: "Calendar",   Icon: Calendar   },
  { key: "chart",    label: "Chart",      Icon: BarChart2  },
];

export default function BoardPage() {
  const [sp] = useSearchParams();
  const projectId = sp.get("id");
  const navigate  = useNavigate();
  const user = useSelector((s) => s.user.user);
  const { currentWorkspace } = useSelector((s) => s.workspace);

  const [project,   setProject]   = useState(null);
  const [tasks,     setTasks]     = useState([]);
  const [view,      setView]      = useState("table");
  const [loading,   setLoading]   = useState(false);
  const [openItem,  setOpenItem]  = useState(null);   // task detail panel
  const [showCreate, setShowCreate] = useState(false);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  /* load project */
  useEffect(() => {
    if (!projectId) { setProject(null); return; }
    api.get(`/project/${projectId}`).then((r) => setProject(r.data)).catch(() => {});
  }, [projectId]);

  /* load tasks */
  const loadTasks = useCallback(() => {
    if (!projectId) return;
    setLoading(true);
    api.get(`/task/${projectId}`).then((r) => setTasks(r.data)).finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const uid    = String(user?._id || user?.id || "");
  const leadId = String(project?.projectLead?._id || project?.projectLead || "");
  const isLead  = uid && leadId && uid === leadId;
  const isAdmin = user?.role === "admin" || user?.orgRole === "org_owner" || user?.orgRole === "org_admin";
  const canCreate = isLead || isAdmin;

  const filtered = filterStatus === "all" ? tasks : tasks.filter((t) => t.status === filterStatus);

  /* No project selected — show all boards */
  if (!projectId) {
    return (
      <div style={{ padding: "28px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>All Boards</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 2 }}>{currentWorkspace?.name}</p>
          </div>
          <button onClick={() => setShowNewBoard(true)} className="btn btn-primary">
            <Plus size={15} /> New Board
          </button>
        </div>
        <AllBoardsView workspaceId={currentWorkspace?._id} />
        {showNewBoard && <CreateProjectDialog isOpen={showNewBoard} onClose={() => setShowNewBoard(false)} onCreated={(p) => navigate(`/board?id=${p._id}`)} />}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 50px)", overflow: "hidden" }}>
      {/* Board header */}
      <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--card-border)", background: "var(--card-bg)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{project?.icon || "📋"}</span>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{project?.name || "Loading..."}</h1>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <Star size={15} style={{ color: project?.isFavorite ? "#fdab3d" : "var(--text-muted)", fill: project?.isFavorite ? "#fdab3d" : "none" }} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {canCreate && (
              <button onClick={() => setShowCreate(true)} className="btn btn-primary">
                <Plus size={14} /> New Item
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => navigate(`/board?id=${projectId}&view=settings`)}>
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* View switcher + filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 2, background: "var(--main-bg)", padding: 3, borderRadius: 8, border: "1px solid var(--card-border)" }}>
            {VIEWS.map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setView(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", border: "none", cursor: "pointer", borderRadius: 6, fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                  background: view === key ? "var(--card-bg)" : "transparent",
                  color: view === key ? "var(--accent)" : "var(--text-secondary)",
                  boxShadow: view === key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                }}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 24, background: "var(--card-border)" }} />

          {/* Status filter */}
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            style={{ border: "1px solid var(--card-border)", borderRadius: 6, padding: "5px 10px", fontSize: 12, background: "var(--card-bg)", color: "var(--text-secondary)", cursor: "pointer", outline: "none" }}>
            <option value="all">All Status</option>
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>{filtered.length} items</span>
          </div>
        </div>
      </div>

      {/* Board content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: 13 }}>
            Loading...
          </div>
        ) : (
          <>
            {view === "table"    && <TableView    tasks={filtered} project={project} onRowClick={setOpenItem} onRefresh={loadTasks} canCreate={canCreate} />}
            {view === "kanban"   && <KanbanView   tasks={filtered} project={project} onCardClick={setOpenItem} onRefresh={loadTasks} />}
            {view === "calendar" && <CalendarView tasks={filtered} onItemClick={setOpenItem} />}
            {view === "chart"    && <ChartView    tasks={tasks} project={project} />}
          </>
        )}

        {/* Item detail side panel */}
        {openItem && (
          <ItemPanel task={openItem} onClose={() => setOpenItem(null)} onUpdate={(updated) => {
            setTasks((prev) => prev.map((t) => t._id === updated._id ? updated : t));
            setOpenItem(updated);
          }} />
        )}
      </div>

      {showCreate && (
        <CreateTaskDialog isOpen={showCreate} onClose={() => setShowCreate(false)} projectId={projectId} onCreated={() => { loadTasks(); setShowCreate(false); }} />
      )}
    </div>
  );
}

/* ── All Boards Grid ── */
function AllBoardsView({ workspaceId }) {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const COLORS = ["#6c5ce7","#0073ea","#00c875","#fdab3d","#e2445c","#a358df"];

  useEffect(() => {
    if (!workspaceId) return;
    api.get(`/project/all-project?workspaceId=${workspaceId}`).then((r) => setProjects(r.data)).catch(() => {});
  }, [workspaceId]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 16 }}>
      {projects.map((p, i) => (
        <div key={p._id} className="board-card" onClick={() => navigate(`/board?id=${p._id}`)}>
          <div style={{ height: 80, background: `linear-gradient(135deg, ${COLORS[i%COLORS.length]}22, ${COLORS[i%COLORS.length]}10)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
            {p.icon || "📋"}
          </div>
          <div style={{ padding: "10px 14px" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 2 }}>{p.name}</p>
            <div style={{ display: "flex", gap: 6 }}>
              <span className={`status-label status-${p.status?.toUpperCase().replace(" ","_")}`} style={{ fontSize: 10, padding: "2px 6px" }}>{p.status}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
