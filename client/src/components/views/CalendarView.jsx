import { useState } from "react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

/* ═══ CalendarView ═══════════════════════════════════ */
export function CalendarView({ tasks, onItemClick }) {
  const [month, setMonth] = useState(new Date());
  const today = new Date();
  const days  = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const offset = getDay(startOfMonth(month));

  const getTasksForDay = (day) => tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), day));

  const STATUS_COLOR = { TODO:"#c4c4c4", IN_PROGRESS:"#fdab3d", IN_REVIEW:"#a358df", DONE:"#00c875", BLOCKED:"#e2445c" };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "16px 24px" }}>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => setMonth(subMonths(month, 1))} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", minWidth: 140, textAlign: "center" }}>{format(month, "MMMM yyyy")}</span>
        <button onClick={() => setMonth(addMonths(month, 1))} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
          <ChevronRight size={14} />
        </button>
        <button onClick={() => setMonth(new Date())} style={{ background: "none", border: "1px solid var(--card-border)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "var(--text-secondary)" }}>
          Today
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
        {days.map((day) => {
          const dayTasks = getTasksForDay(day);
          const isToday  = isSameDay(day, today);
          return (
            <div key={day.toISOString()} style={{
              minHeight: 80, border: "1px solid var(--card-border)", borderRadius: 8, padding: "6px 8px",
              background: isToday ? "rgba(108,92,231,0.06)" : "var(--card-bg)",
              borderColor: isToday ? "var(--accent)" : "var(--card-border)",
            }}>
              <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 400, color: isToday ? "var(--accent)" : "var(--text-secondary)", marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>{format(day, "d")}</span>
                {dayTasks.length > 0 && <span style={{ fontSize: 10, background: "var(--accent)", color: "white", borderRadius: 10, padding: "1px 5px" }}>{dayTasks.length}</span>}
              </div>
              {dayTasks.slice(0, 3).map((task) => (
                <div key={task._id} onClick={() => onItemClick?.(task)}
                  style={{ fontSize: 10, fontWeight: 600, padding: "2px 5px", borderRadius: 3, marginBottom: 2, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", background: STATUS_COLOR[task.status] || "#c4c4c4", color: "#fff" }}>
                  {task.title}
                </div>
              ))}
              {dayTasks.length > 3 && <div style={{ fontSize: 10, color: "var(--text-muted)" }}>+{dayTasks.length - 3} more</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ ChartView ══════════════════════════════════════ */
const COLORS = ["#6c5ce7","#00c875","#fdab3d","#e2445c","#579bfc","#a358df"];

export function ChartView({ tasks, project }) {
  const statusData = [
    { name: "Not Started",  value: tasks.filter((t) => t.status === "TODO").length        },
    { name: "In Progress",  value: tasks.filter((t) => t.status === "IN_PROGRESS").length },
    { name: "In Review",    value: tasks.filter((t) => t.status === "IN_REVIEW").length   },
    { name: "Done",         value: tasks.filter((t) => t.status === "DONE").length        },
    { name: "Blocked",      value: tasks.filter((t) => t.status === "BLOCKED").length     },
  ];

  const priorityData = [
    { name: "Critical", value: tasks.filter((t) => t.priority === "CRITICAL").length },
    { name: "High",     value: tasks.filter((t) => t.priority === "HIGH").length     },
    { name: "Medium",   value: tasks.filter((t) => t.priority === "MEDIUM").length   },
    { name: "Low",      value: tasks.filter((t) => t.priority === "LOW").length      },
  ];

  const assigneeMap = {};
  tasks.forEach((t) => {
    if (t.assignee) {
      const name = t.assignee.name || "Unknown";
      assigneeMap[name] = (assigneeMap[name] || 0) + 1;
    }
  });
  const assigneeData = Object.entries(assigneeMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  const TT = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 8, padding: "8px 12px", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
        <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{label || payload[0]?.name}</p>
        <p style={{ color: "var(--accent)" }}>{payload[0]?.value} tasks</p>
      </div>
    );
  };

  const completion = tasks.length ? Math.round((tasks.filter((t) => t.status === "DONE").length / tasks.length) * 100) : 0;

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "24px" }}>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Items",  value: tasks.length,                                     color: "#6c5ce7" },
          { label: "Completion",   value: `${completion}%`,                                  color: "#00c875" },
          { label: "Overdue",      value: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE").length, color: "#e2445c" },
          { label: "Team Members", value: project?.teamMembers?.length || 0,                color: "#fdab3d" },
        ].map((c) => (
          <div key={c.label} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: "16px 20px" }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{c.label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Status bar chart */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 16 }}>Items by Status</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} cursor={{ fill: "rgba(108,92,231,0.06)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority pie chart */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 16 }}>Items by Priority</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={40} label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""}>
                {priorityData.map((_, i) => <Cell key={i} fill={["#e2445c","#fdab3d","#579bfc","#00c875"][i]} />)}
              </Pie>
              <Tooltip content={<TT />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assignee workload */}
      {assigneeData.length > 0 && (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 16 }}>Workload by Person</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={assigneeData} layout="vertical" barSize={18}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<TT />} cursor={{ fill: "rgba(108,92,231,0.06)" }} />
              <Bar dataKey="count" fill="#6c5ce7" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default CalendarView;
