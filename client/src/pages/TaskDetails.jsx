// TaskDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../utils/api";
import ItemPanel from "../components/ItemPanel";

export function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);

  useEffect(() => {
    api.get(`/task/details/${id}`).then((r) => setTask(r.data)).catch(() => navigate(-1));
  }, [id]);

  if (!task) return <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",color:"var(--text-muted)",fontSize:14 }}>Loading...</div>;

  return (
    <div style={{ position:"relative", height:"calc(100vh - 50px)", overflow:"hidden" }}>
      <div style={{ padding:"16px 24px", borderBottom:"1px solid var(--card-border)", background:"var(--card-bg)", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={() => navigate(-1)} style={{ display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontSize:13,color:"var(--text-secondary)",padding:"5px 8px",borderRadius:6 }}
          onMouseEnter={(e) => e.currentTarget.style.background="var(--main-bg)"}
          onMouseLeave={(e) => e.currentTarget.style.background="none"}>
          <ArrowLeft size={14} /> Back
        </button>
        <span style={{ fontSize:13,color:"var(--text-muted)" }}>/ {task.projectId?.name} / {task.title?.slice(0,40)}</span>
      </div>
      <div style={{ display:"flex", height:"calc(100% - 53px)", overflow:"hidden" }}>
        <div style={{ flex:1, overflowY:"auto", padding:"32px 40px" }}>
          <h1 style={{ fontSize:22,fontWeight:800,color:"var(--text-primary)",marginBottom:8 }}>{task.title}</h1>
          <p style={{ fontSize:14,color:"var(--text-secondary)",lineHeight:1.6 }}>{task.description || "No description added."}</p>
        </div>
        <ItemPanel task={task} onClose={() => navigate(-1)} onUpdate={setTask} />
      </div>
    </div>
  );
}

export default TaskDetails;
