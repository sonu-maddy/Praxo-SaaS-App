// ═══ MyWork.jsx ══════════════════════════════════════
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { CheckSquare, Clock, AlertTriangle, Calendar } from "lucide-react";
import { format } from "date-fns";
import api from "../utils/api";

export function MyWork() {
  const user = useSelector((s) => s.user.user);
  const { workspaces } = useSelector((s) => s.workspace);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const allTasks = [];
        for (const ws of workspaces) {
          const r = await api.get(`/task/workspace/${ws._id}`);
          allTasks.push(...r.data);
        }
        const uid = String(user?._id || user?.id || "");
        setTasks(allTasks.filter((t) => t.assignee && String(t.assignee._id) === uid));
      } catch {}
      setLoading(false);
    };
    if (workspaces?.length) fetchAll();
  }, [workspaces, user]);

  const now = new Date();
  const overdue   = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE");
  const dueToday  = tasks.filter((t) => t.dueDate && format(new Date(t.dueDate),"yyyy-MM-dd") === format(now,"yyyy-MM-dd") && t.status !== "DONE");
  const upcoming  = tasks.filter((t) => t.dueDate && new Date(t.dueDate) > now && t.status !== "DONE");
  const noDate    = tasks.filter((t) => !t.dueDate && t.status !== "DONE");

  const TABS = [
    { key:"all",     label:"All",         count: tasks.length       },
    { key:"overdue", label:"Overdue",     count: overdue.length,  color:"#e2445c" },
    { key:"today",   label:"Due Today",   count: dueToday.length, color:"#fdab3d" },
    { key:"upcoming",label:"Upcoming",    count: upcoming.length  },
  ];

  const displayed = tab === "all" ? tasks.filter((t) => t.status !== "DONE") : tab === "overdue" ? overdue : tab === "today" ? dueToday : upcoming;

  const STATUS_BG = { TODO:"#c4c4c4", IN_PROGRESS:"#fdab3d", IN_REVIEW:"#a358df", DONE:"#00c875", BLOCKED:"#e2445c" };
  const STATUS_LBL = { TODO:"Not Started", IN_PROGRESS:"Working on it", IN_REVIEW:"In Review", DONE:"Done", BLOCKED:"Stuck" };

  return (
    <div style={{ padding:"28px 32px", maxWidth:900 }}>
      <h1 style={{ fontSize:24, fontWeight:800, color:"var(--text-primary)", marginBottom:4 }}>My Work</h1>
      <p style={{ color:"var(--text-secondary)", fontSize:13, marginBottom:24 }}>Tasks assigned to you across all boards</p>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:20, borderBottom:"1px solid var(--card-border)" }}>
        {TABS.map(({ key, label, count, color }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding:"8px 16px", border:"none", background:"none", cursor:"pointer", fontSize:13, fontWeight:600, borderBottom:`2px solid ${tab===key?"var(--accent)":"transparent"}`, color:tab===key?"var(--accent)":"var(--text-secondary)", transition:"all 0.15s" }}>
            {label} {count > 0 && <span style={{ marginLeft:4, padding:"1px 7px", borderRadius:20, fontSize:11, background:tab===key?"var(--accent-light)":"var(--main-bg)", color:color||"var(--text-muted)" }}>{count}</span>}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign:"center", color:"var(--text-muted)", padding:"40px 0" }}>Loading...</div> :
       displayed.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-muted)" }}>
          <CheckSquare size={40} style={{ margin:"0 auto 12px", opacity:0.3 }} />
          <p>{tab === "all" ? "No tasks assigned to you 🎉" : `No ${tab} tasks`}</p>
        </div>
       ) : (
        <div style={{ background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:12, overflow:"hidden" }}>
          {displayed.map((task, i) => (
            <Link key={task._id} to={`/task/${task._id}`} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 18px", borderBottom: i < displayed.length-1 ? "1px solid var(--card-border)" : "none", textDecoration:"none" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--main-bg)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <input type="checkbox" checked={task.status === "DONE"} onChange={() => {}} onClick={(e) => e.preventDefault()} />
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{task.title}</p>
                <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:1 }}>{task.projectId?.name}</p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                <div className="status-label" style={{ background:STATUS_BG[task.status]||"#c4c4c4", color:task.status==="TODO"?"#555":"#fff", fontSize:10, padding:"2px 8px", minWidth:80 }}>
                  {STATUS_LBL[task.status]||task.status}
                </div>
                {task.dueDate && (
                  <span style={{ fontSize:12, color:new Date(task.dueDate)<now&&task.status!=="DONE"?"#e2445c":"var(--text-muted)" }}>
                    <Calendar size={11} style={{ display:"inline", marginRight:3 }} />{format(new Date(task.dueDate),"MMM d")}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
       )}
    </div>
  );
}

export default MyWork;
