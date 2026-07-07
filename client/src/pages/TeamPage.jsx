import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Users, UserPlus, Mail, Shield, X } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

const COLORS = ["#6c5ce7","#0073ea","#00c875","#fdab3d","#e2445c","#a358df","#579bfc"];
const ROLE_LABELS = { org_owner:"Owner", org_admin:"Admin", workspace_lead:"WS Lead", project_lead:"Project Lead", member:"Member", viewer:"Viewer" };
const ROLE_COLORS = { org_owner:"#e2445c", org_admin:"#fdab3d", workspace_lead:"#a358df", project_lead:"#579bfc", member:"#00c875", viewer:"#c4c4c4" };

export default function TeamPage() {
  const user = useSelector((s) => s.user.user);
  const [org, setOrg] = useState(null);
  const [invite, setInvite] = useState({ email:"", orgRole:"member" });
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = () => api.get("/org/me").then((r) => setOrg(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const isOwner = user?.orgRole === "org_owner" || user?.role === "admin";
  const isAdmin = isOwner || user?.orgRole === "org_admin";

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/org/invite", invite);
      toast.success("Member invited!");
      setShowInvite(false);
      setInvite({ email:"", orgRole:"member" });
      load();
    } catch (err) {
       toast.error(err.response?.data?.message || "Failed"); 
    }
    setLoading(false);
  };

  const handleRemove = async (userId) => {
    if (!confirm("Remove this member?")) return;
    try { await api.delete(`/org/members/${userId}`);
    toast.success("Removed");
    load(); }
    catch (err) {
       toast.error(err.response?.data?.message || "Failed");
   }
  };

  const handleRoleChange = async (userId, newRole) => {
    try { await api.put(`/org/members/${userId}/role`, { orgRole: newRole }); toast.success("Role updated"); load(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  return (
    <div style={{ padding:"28px 32px", maxWidth:900 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-primary)", marginBottom:2 }}>Team Members</h1>
          <p style={{ fontSize:13, color:"var(--text-secondary)" }}>{org?.name} · {org?.members?.length || 0} members</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowInvite(true)} className="btn btn-primary">
            <UserPlus size={14} /> Invite Member
          </button>
        )}
      </div>

      {/* Plan info bar */}
      {org && (
        <div style={{ background:"var(--accent-light)", border:"1px solid rgba(108,92,231,0.2)", borderRadius:10, padding:"10px 16px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:13, color:"var(--accent)", fontWeight:600 }}>
            {org.members?.length} / {org.planDetails?.maxMembers === Infinity ? "Unlimited" : org.planDetails?.maxMembers} members on <strong>{org.plan?.toUpperCase()}</strong> plan
          </span>
          {org.plan === "free" && <a href="/billing" style={{ fontSize:12, color:"var(--accent)", fontWeight:700 }}>Upgrade →</a>}
        </div>
      )}

      {/* Members grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:14 }}>
        {org?.members?.map((m, i) => (
          <div key={m.user?._id || i} style={{ background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:12, padding:18, position:"relative" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <div className="avatar" style={{ width:40, height:40, fontSize:16, background:COLORS[i%COLORS.length] }}>
                {m.user?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.user?.name || "Unknown"}</p>
                <p style={{ fontSize:12, color:"var(--text-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  <Mail size={10} style={{ display:"inline", marginRight:3 }} />{m.user?.email || "—"}
                </p>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              {isOwner && m.user?._id !== user?._id ? (
                <select value={m.role} onChange={(e) => handleRoleChange(m.user._id, e.target.value)}
                  style={{ fontSize:11, fontWeight:700, color:ROLE_COLORS[m.role]||"#999", background:"transparent", border:`1px solid ${ROLE_COLORS[m.role]||"#ccc"}22`, borderRadius:6, padding:"3px 8px", cursor:"pointer", outline:"none" }}>
                  {Object.entries(ROLE_LABELS).filter(([k]) => k !== "org_owner").map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              ) : (
                <span style={{ fontSize:11, fontWeight:700, color:ROLE_COLORS[m.role]||"#999", background:`${ROLE_COLORS[m.role]||"#ccc"}18`, padding:"3px 9px", borderRadius:6 }}>
                  {ROLE_LABELS[m.role] || m.role}
                </span>
              )}
              {isAdmin && m.user?._id !== user?._id && (
                <button onClick={() => handleRemove(m.user._id)} style={{ background:"none", border:"none", cursor:"pointer", padding:4, borderRadius:6, color:"var(--text-muted)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background="#fff0f1"; e.currentTarget.style.color="#e2445c"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background="none"; e.currentTarget.style.color="var(--text-muted)"; }}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="modal-overlay" onClick={(e) => e.target===e.currentTarget && setShowInvite(false)}>
          <div className="modal" style={{ maxWidth:400 }}>
            <div style={{ padding:"18px 20px", borderBottom:"1px solid var(--card-border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <h2 style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)" }}>Invite Team Member</h2>
              <button onClick={() => setShowInvite(false)} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={18} /></button>
            </div>
            <form onSubmit={handleInvite} style={{ padding:20 }}>
              <div style={{ background:"#fff8e6", border:"1px solid #ffe0a3", borderRadius:8, padding:"10px 12px", marginBottom:16, fontSize:12, color:"#b45309" }}>
                💡 The user must already have a SprintOS account.
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>Email Address</label>
                <input type="email" value={invite.email} onChange={(e) => setInvite({...invite,email:e.target.value})} className="input" placeholder="colleague@company.com" required />
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>Role</label>
                <select value={invite.orgRole} onChange={(e) => setInvite({...invite,orgRole:e.target.value})} className="input">
                  {Object.entries(ROLE_LABELS).filter(([k]) => k !== "org_owner").map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button type="button" onClick={() => setShowInvite(false)} className="btn btn-ghost">Cancel</button>
                <button disabled={loading} className="btn btn-primary">{loading ? "Inviting…" : "Send Invite"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
