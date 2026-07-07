// Inbox.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Bell, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "../utils/api";

export function Inbox() {
  const { workspaces } = useSelector((s) => s.workspace);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const all = [];
      for (const ws of workspaces || []) {
        try {
          const r = await api.get(`/task/workspace/${ws._id}`);
          all.push(...r.data.map((t) => ({ ...t, wsName: ws.name })));
        } catch {}
      }
      setActivities(all.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 30));
    };
    fetch();
  }, [workspaces]);

  const STATUS_COLOR = { TODO:"#c4c4c4", IN_PROGRESS:"#fdab3d", IN_REVIEW:"#a358df", DONE:"#00c875", BLOCKED:"#e2445c" };

  return (
    <div style={{ padding:"28px 32px", maxWidth:720 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
        <Bell size={20} style={{ color:"var(--accent)" }} />
        <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-primary)" }}>Inbox</h1>
        {activities.length > 0 && <span style={{ background:"#e2445c", color:"white", fontSize:11, fontWeight:700, padding:"2px 7px", borderRadius:20 }}>{activities.length}</span>}
      </div>
      {activities.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-muted)" }}>
          <Check size={40} style={{ margin:"0 auto 12px", opacity:0.3 }} />
          <p>All caught up! 🎉</p>
        </div>
      ) : (
        <div style={{ background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:12, overflow:"hidden" }}>
          {activities.map((task, i) => (
            <div key={task._id} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"14px 18px", borderBottom:i<activities.length-1?"1px solid var(--card-border)":"none" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:STATUS_COLOR[task.status]||"#c4c4c4", marginTop:5, flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)", marginBottom:2 }}>{task.title}</p>
                <p style={{ fontSize:11, color:"var(--text-muted)" }}>
                  {task.wsName} · {task.projectId?.name} · Updated {formatDistanceToNow(new Date(task.updatedAt), { addSuffix:true })}
                </p>
              </div>
              <div className="status-label" style={{ background:STATUS_COLOR[task.status]||"#c4c4c4", color:task.status==="TODO"?"#555":"#fff", fontSize:10, padding:"2px 7px", minWidth:80, flexShrink:0 }}>
                {task.status?.replace("_"," ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Inbox;
