import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
  LineChart, Line, AreaChart, Area,
} from "recharts";

/* ── Color palette ── */
const COLORS   = ["#6c5ce7","#00c875","#fdab3d","#e2445c","#579bfc","#a358df"];
const S_COLORS = {
  TODO:"#c4c4c4", IN_PROGRESS:"#fdab3d",
  IN_REVIEW:"#a358df", DONE:"#00c875",
  BLOCKED:"#e2445c", CANCELLED:"#808080",
};
const P_COLORS = {
  CRITICAL:"#e2445c", HIGH:"#fdab3d", MEDIUM:"#579bfc", LOW:"#00c875",
};

/* ── Shared custom tooltip ── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:"var(--card-bg)", border:"1px solid var(--card-border)",
      borderRadius:10, padding:"10px 14px",
      boxShadow:"0 8px 24px rgba(0,0,0,0.12)",
    }}>
      {label && <p style={{ fontSize:12, fontWeight:700, color:"var(--text-primary)", marginBottom:4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize:12, color:p.color || "var(--accent)", fontWeight:600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

/* ── Metric card ── */
function MetricCard({ label, value, color, sub }) {
  return (
    <div style={{
      background:"var(--card-bg)", border:"1px solid var(--card-border)",
      borderRadius:12, padding:"16px 20px",
    }}>
      <p style={{ fontSize:12, color:"var(--text-muted)", fontWeight:600, marginBottom:6 }}>{label}</p>
      <p style={{ fontSize:28, fontWeight:800, color, lineHeight:1 }}>{value}</p>
      {sub && <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>{sub}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function ChartView({ tasks = [], project }) {
  const stats = useMemo(() => {
    const now = new Date();
    const total     = tasks.length;
    const done      = tasks.filter((t) => t.status === "DONE").length;
    const inProg    = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const blocked   = tasks.filter((t) => t.status === "BLOCKED").length;
    const overdue   = tasks.filter((t) =>
      t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE"
    ).length;
    const rate = total ? Math.round((done / total) * 100) : 0;

    /* Status distribution */
    const statusData = Object.entries(
      tasks.reduce((acc, t) => {
        const key = t.status || "TODO";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    ).map(([k, v]) => ({
      name:  k.replace("_", " "),
      value: v,
      fill:  S_COLORS[k] || "#c4c4c4",
    }));

    /* Priority distribution */
    const priorityData = ["CRITICAL","HIGH","MEDIUM","LOW"].map((p) => ({
      name:  p,
      value: tasks.filter((t) => t.priority === p).length,
      fill:  P_COLORS[p],
    }));

    /* Type distribution */
    const typeMap = tasks.reduce((acc, t) => {
      acc[t.type || "TASK"] = (acc[t.type || "TASK"] || 0) + 1;
      return acc;
    }, {});
    const typeData = Object.entries(typeMap)
      .map(([k, v]) => ({ name: k, value: v }))
      .sort((a, b) => b.value - a.value);

    /* Assignee workload */
    const workloadMap = {};
    tasks.forEach((t) => {
      if (t.assignee) {
        const name = t.assignee.name || "Unknown";
        if (!workloadMap[name]) workloadMap[name] = { total:0, done:0, inProg:0 };
        workloadMap[name].total++;
        if (t.status === "DONE")        workloadMap[name].done++;
        if (t.status === "IN_PROGRESS") workloadMap[name].inProg++;
      }
    });
    const workloadData = Object.entries(workloadMap)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    /* Weekly trend (mock last 6 weeks based on createdAt) */
    const weekMap = {};
    tasks.forEach((t) => {
      const d = new Date(t.createdAt);
      const week = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString("default",{month:"short"})}`;
      if (!weekMap[week]) weekMap[week] = { created:0, done:0 };
      weekMap[week].created++;
      if (t.status === "DONE") weekMap[week].done++;
    });
    const trendData = Object.entries(weekMap)
      .slice(-6)
      .map(([week, d]) => ({ week, ...d }));

    return { total, done, inProg, blocked, overdue, rate, statusData, priorityData, typeData, workloadData, trendData };
  }, [tasks]);

  const axisStyle = { fontSize:11, fill:"var(--text-muted)" };

  return (
    <div style={{ height:"100%", overflowY:"auto", padding:"20px 24px" }}>

      {/* ── Metric cards ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px,1fr))", gap:12, marginBottom:24 }}>
        <MetricCard label="Total Items"     value={stats.total}         color="var(--text-primary)" />
        <MetricCard label="Completion Rate" value={`${stats.rate}%`}   color="#00c875" sub={`${stats.done} done`} />
        <MetricCard label="In Progress"     value={stats.inProg}        color="#fdab3d" />
        <MetricCard label="Overdue"         value={stats.overdue}       color="#e2445c" />
        <MetricCard label="Blocked"         value={stats.blocked}       color="#a358df" />
        <MetricCard label="Team Size"       value={project?.teamMembers?.length || 0} color="#579bfc" />
      </div>

      {/* ── Progress bar ── */}
      <div style={{ background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:12, padding:"16px 20px", marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>Overall Completion</span>
          <span style={{ fontSize:13, fontWeight:800, color:"#00c875" }}>{stats.rate}%</span>
        </div>
        <div style={{ height:10, background:"var(--main-bg)", borderRadius:10, overflow:"hidden", border:"1px solid var(--card-border)" }}>
          <div style={{
            height:"100%", borderRadius:10,
            width:`${stats.rate}%`,
            background:"linear-gradient(90deg,#6c5ce7,#00c875)",
            transition:"width 0.8s ease",
          }} />
        </div>
        <div style={{ display:"flex", gap:16, marginTop:10 }}>
          {[
            { label:"Done",        value:stats.done,       color:"#00c875" },
            { label:"In Progress", value:stats.inProg,     color:"#fdab3d" },
            { label:"Blocked",     value:stats.blocked,    color:"#e2445c" },
            { label:"Remaining",   value:stats.total - stats.done - stats.inProg - stats.blocked, color:"#c4c4c4" },
          ].map((i) => (
            <div key={i.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:8, height:8, borderRadius:2, background:i.color, flexShrink:0 }} />
              <span style={{ fontSize:11, color:"var(--text-muted)" }}>{i.label}: <strong style={{ color:"var(--text-primary)" }}>{i.value}</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 1: Status bar + Priority pie ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>

        {/* Status distribution */}
        <div style={{ background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:12, padding:"18px 20px" }}>
          <p style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:16 }}>Items by Status</p>
          {stats.statusData.length === 0 ? (
            <div style={{ height:200, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-muted)", fontSize:12 }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.statusData} barSize={32} layout="vertical">
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill:"rgba(108,92,231,0.05)" }} />
                <Bar dataKey="value" radius={[0,6,6,0]}>
                  {stats.statusData.map((s, i) => <Cell key={i} fill={s.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Priority pie */}
        <div style={{ background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:12, padding:"18px 20px" }}>
          <p style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:16 }}>Items by Priority</p>
          {stats.priorityData.every((d) => d.value === 0) ? (
            <div style={{ height:220, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-muted)", fontSize:12 }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.priorityData.filter((d) => d.value > 0)} dataKey="value" cx="50%" cy="50%"
                  outerRadius={85} innerRadius={40}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}>
                  {stats.priorityData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ fontSize:11, color:"var(--text-secondary)" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Row 2: Type distribution + Weekly trend ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>

        {/* Type */}
        <div style={{ background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:12, padding:"18px 20px" }}>
          <p style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:16 }}>Items by Type</p>
          {stats.typeData.length === 0 ? (
            <div style={{ height:200, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-muted)", fontSize:12 }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.typeData} barSize={28}>
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill:"rgba(108,92,231,0.05)" }} />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {stats.typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Trend */}
        <div style={{ background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:12, padding:"18px 20px" }}>
          <p style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:16 }}>Creation vs Completion Trend</p>
          {stats.trendData.length === 0 ? (
            <div style={{ height:200, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-muted)", fontSize:12 }}>No trend data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.trendData}>
                <defs>
                  <linearGradient id="gCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6c5ce7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gDone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00c875" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00c875" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                <Area type="monotone" dataKey="created" name="Created" stroke="#6c5ce7" fill="url(#gCreated)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="done"    name="Completed" stroke="#00c875" fill="url(#gDone)"    strokeWidth={2} dot={false} />
                <Legend formatter={(v) => <span style={{ fontSize:11, color:"var(--text-secondary)" }}>{v}</span>} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Row 3: Workload by person ── */}
      {stats.workloadData.length > 0 && (
        <div style={{ background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:12, padding:"18px 20px" }}>
          <p style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:16 }}>Team Workload</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.workloadData} layout="vertical" barSize={16} barGap={2}>
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} width={100} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill:"rgba(108,92,231,0.05)" }} />
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" horizontal={false} />
              <Bar dataKey="done"   name="Done"        fill="#00c875" radius={[0,4,4,0]} stackId="a" />
              <Bar dataKey="inProg" name="In Progress" fill="#fdab3d" radius={[0,4,4,0]} stackId="a" />
              <Bar dataKey="total"  name="Total"       fill="rgba(108,92,231,0.15)" radius={[0,4,4,0]} />
              <Legend formatter={(v) => <span style={{ fontSize:11, color:"var(--text-secondary)" }}>{v}</span>} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}