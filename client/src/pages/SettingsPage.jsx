import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Settings, Building2, Shield, Bell, Palette, Save } from "lucide-react";
import { setTheme } from "../features/themeSlice";
import api from "../utils/api";
import toast from "react-hot-toast";

const TABS = [
  { key:"general",  label:"General",       Icon:Building2 },
  { key:"rbac",     label:"Roles & Permissions", Icon:Shield  },
  { key:"theme",    label:"Appearance",    Icon:Palette   },
  { key:"notif",    label:"Notifications", Icon:Bell      },
];

export default function SettingsPage() {
  const dispatch = useDispatch();
  const user     = useSelector((s) => s.user.user);
  const theme    = useSelector((s) => s.theme?.mode || "light");
  const [tab,    setTab]    = useState("general");
  const [org,    setOrg]    = useState(null);
  const [form,   setForm]   = useState({ name:"", industry:"", size:"" });
  const [saving, setSaving] = useState(false);

  const isOwner = user?.orgRole === "org_owner" || user?.role === "admin";

  useEffect(() => {
    api.get("/org/me").then((r) => {
      setOrg(r.data);
      setForm({ name: r.data.name || "", industry: r.data.industry || "", size: r.data.size || "" });
    }).catch(() => {});
  }, []);

  const saveGeneral = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put("/org/me", form);
      toast.success("Settings saved!");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    setSaving(false);
  };

  return (
    <div style={{ padding:"28px 32px", maxWidth:860 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
        <Settings size={20} style={{ color:"var(--accent)" }} />
        <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-primary)" }}>Settings</h1>
      </div>

      <div style={{ display:"flex", gap:0, background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:12, overflow:"hidden" }}>
        {/* Sidebar */}
        <div style={{ width:200, flexShrink:0, borderRight:"1px solid var(--card-border)", padding:"8px 0" }}>
          {TABS.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 16px", border:"none", background:tab===key?"var(--accent-light)":"transparent", color:tab===key?"var(--accent)":"var(--text-secondary)", cursor:"pointer", fontSize:13, fontWeight:tab===key?700:500, textAlign:"left", borderLeft:`3px solid ${tab===key?"var(--accent)":"transparent"}` }}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex:1, padding:28 }}>
          {/* General */}
          {tab === "general" && (
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)", marginBottom:20 }}>Organization Settings</h2>
              <form onSubmit={saveGeneral}>
                <div style={{ display:"grid", gap:16, maxWidth:480 }}>
                  <div>
                    <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>Organization Name</label>
                    <input value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} className="input" disabled={!isOwner} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>Industry</label>
                    <select value={form.industry} onChange={(e) => setForm({...form,industry:e.target.value})} className="input" disabled={!isOwner}>
                      <option value="">Select industry</option>
                      {["Technology","Startup","Agency","Healthcare","Education","E-commerce","Finance","Marketing","HR","Other"].map((i) => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>Company Size</label>
                    <select value={form.size} onChange={(e) => setForm({...form,size:e.target.value})} className="input" disabled={!isOwner}>
                      <option value="">Select size</option>
                      {["1-5","6-15","16-50","51-200","200+"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  {isOwner && (
                    <button type="submit" disabled={saving} className="btn btn-primary" style={{ width:"fit-content" }}>
                      <Save size={14} />{saving ? "Saving..." : "Save Changes"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* RBAC */}
          {tab === "rbac" && (
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)", marginBottom:6 }}>Roles & Permissions</h2>
              <p style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:20 }}>Control what each role can do in your organization.</p>
              <div style={{ display:"grid", gap:12 }}>
                {[
                  { role:"org_owner",       color:"#e2445c", desc:"Full access — create workspaces, manage billing, remove members, change settings." },
                  { role:"org_admin",       color:"#fdab3d", desc:"Manage workspaces and members. Cannot access billing or delete organization." },
                  { role:"workspace_lead",  color:"#a358df", desc:"Create and manage boards within assigned workspace. Can invite members to workspace." },
                  { role:"project_lead",    color:"#579bfc", desc:"Create and manage tasks within assigned board. Can assign tasks to team members." },
                  { role:"member",          color:"#00c875", desc:"Update status of assigned tasks. Can add comments and attachments." },
                  { role:"viewer",          color:"#c4c4c4", desc:"Read-only access. Cannot create, edit or delete anything." },
                ].map(({ role, color, desc }) => (
                  <div key={role} style={{ padding:"14px 16px", border:"1px solid var(--card-border)", borderRadius:10, borderLeft:`4px solid ${color}` }}>
                    <p style={{ fontSize:13, fontWeight:700, color, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.04em" }}>{role.replace("_"," ")}</p>
                    <p style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.5 }}>{desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:20, padding:14, background:"#fff8e6", border:"1px solid #ffe0a3", borderRadius:10, fontSize:12, color:"#b45309" }}>
                💡 <strong>Pro tip:</strong> Assign <code>project_lead</code> role to developers who lead specific boards. They can create tasks and manage the sprint. Use <code>member</code> for everyone else.
              </div>
            </div>
          )}

          {/* Theme */}
          {tab === "theme" && (
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)", marginBottom:20 }}>Appearance</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, maxWidth:440 }}>
                {[
                  { key:"light",  label:"Light",  preview:"☀️" },
                  { key:"dark",   label:"Dark",   preview:"🌙" },
                  { key:"system", label:"System", preview:"💻" },
                ].map(({ key, label, preview }) => (
                  <button key={key} onClick={() => dispatch(setTheme(key))}
                    style={{ padding:"20px 16px", border:`2px solid ${theme===key?"var(--accent)":"var(--card-border)"}`, borderRadius:12, background:theme===key?"var(--accent-light)":"transparent", cursor:"pointer", textAlign:"center" }}>
                    <p style={{ fontSize:28, marginBottom:8 }}>{preview}</p>
                    <p style={{ fontSize:13, fontWeight:700, color:theme===key?"var(--accent)":"var(--text-primary)" }}>{label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {tab === "notif" && (
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)", marginBottom:20 }}>Notification Preferences</h2>
              <div style={{ display:"grid", gap:14, maxWidth:480 }}>
                {[
                  { label:"Task assigned to me",      sub:"When someone assigns a task to you" },
                  { label:"Task status changed",      sub:"When a task you own changes status" },
                  { label:"Comment on my task",       sub:"When someone comments on your task" },
                  { label:"Due date reminders",       sub:"24h before a task is due" },
                  { label:"New member joined",        sub:"When someone joins your org" },
                  { label:"Weekly digest",            sub:"Sunday summary of your week" },
                ].map(({ label, sub }, i) => (
                  <div key={label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", border:"1px solid var(--card-border)", borderRadius:10 }}>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)", marginBottom:2 }}>{label}</p>
                      <p style={{ fontSize:11, color:"var(--text-muted)" }}>{sub}</p>
                    </div>
                    <label style={{ position:"relative", display:"inline-block", width:40, height:22, flexShrink:0 }}>
                      <input type="checkbox" defaultChecked={i < 4} style={{ display:"none" }} onChange={() => {}} />
                      <span style={{ position:"absolute", inset:0, background:"#00c875", borderRadius:22, cursor:"pointer" }} />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
