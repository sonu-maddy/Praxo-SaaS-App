import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../features/userSlice";
import { Building2, ArrowRight, Zap } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

const INDUSTRIES = ["Technology","Startup","Agency","Healthcare","Education","E-commerce","Finance","Marketing","HR","Media","Consulting","Other"];
const SIZES = ["1-5 (Solo / Duo)","6-15 (Small team)","16-50 (Growing startup)","51-200 (Scale-up)","200+ (Enterprise)"];
const USE_CASES = [
  { icon:"🚀", label:"Product Development" },
  { icon:"🐛", label:"Bug & Issue Tracking" },
  { icon:"📣", label:"Marketing Campaigns" },
  { icon:"👥", label:"HR & Recruitment"    },
  { icon:"🤖", label:"AI / Data Projects"  },
  { icon:"🎓", label:"Student / Hackathon" },
  { icon:"🏢", label:"Agency Client Work"  },
  { icon:"💼", label:"Sales Pipeline"      },
];

export default function OrgSetup() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const user      = useSelector((s) => s.user.user);
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState({ name:"", industry:"", size:"", useCase:[] });

  const toggleUseCase = (label) => setForm((p) => ({
    ...p, useCase: p.useCase.includes(label) ? p.useCase.filter((x) => x !== label) : [...p.useCase, label],
  }));

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error("Enter your company name"); return; }
    setLoading(true);
    try {
      await api.post("/org", { name: form.name, industry: form.industry, size: form.size.split(" ")[0] });
      const { data } = await api.get("/auth/cookie-user");
      dispatch(setUser({ ...data, id: data._id?.toString() || data.id }));
      toast.success("Welcome to SprintOS! 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create organization");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--main-bg)", padding:24 }}>
      <div style={{ width:"100%", maxWidth:520, background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:20, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.08)" }}>
        {/* Header */}
        <div style={{ padding:"28px 32px 20px", borderBottom:"1px solid var(--card-border)", background:"linear-gradient(135deg,#f2f0ff,#e8f3ff)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Zap size={18} color="white" />
            </div>
            <span style={{ fontWeight:800, fontSize:18, color:"var(--text-primary)" }}>SprintOS</span>
          </div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-primary)", marginBottom:4 }}>
            {step === 1 ? "Set up your workspace" : step === 2 ? "Tell us about your team" : "How will you use SprintOS?"}
          </h1>
          <p style={{ fontSize:13, color:"var(--text-secondary)" }}>
            {step === 1 ? `Welcome, ${user?.name?.split(" ")[0]}! Let's get you set up.` : step === 2 ? "Help us tailor your experience." : "Select all that apply."}
          </p>
          {/* Step indicator */}
          <div style={{ display:"flex", gap:6, marginTop:14 }}>
            {[1,2,3].map((s) => (
              <div key={s} style={{ height:4, flex:1, borderRadius:4, background:step >= s ? "var(--accent)" : "rgba(108,92,231,0.2)", transition:"background 0.3s" }} />
            ))}
          </div>
        </div>

        <div style={{ padding:"28px 32px" }}>
          {/* Step 1 — Company name */}
          {step === 1 && (
            <div style={{ display:"grid", gap:16 }}>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>Company / Team Name *</label>
                <div style={{ display:"flex", alignItems:"center", gap:10, border:"1px solid var(--card-border)", borderRadius:10, padding:"0 14px", background:"var(--card-bg)" }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                  onBlur={(e)  => e.currentTarget.style.borderColor = "var(--card-border)"}>
                  <Building2 size={16} style={{ color:"var(--text-muted)", flexShrink:0 }} />
                  <input value={form.name} onChange={(e) => setForm({...form,name:e.target.value})}
                    placeholder="e.g. Acme Technologies, BITS Pilani Team..." autoFocus
                    style={{ border:"none", outline:"none", flex:1, padding:"11px 0", fontSize:14, background:"transparent", color:"var(--text-primary)", fontFamily:"inherit" }} />
                </div>
              </div>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>Industry</label>
                <select value={form.industry} onChange={(e) => setForm({...form,industry:e.target.value})} className="input">
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 2 — Team size */}
          {step === 2 && (
            <div style={{ display:"grid", gap:10 }}>
              {SIZES.map((s) => (
                <button key={s} onClick={() => setForm({...form,size:s})}
                  style={{ padding:"12px 16px", border:`2px solid ${form.size===s?"var(--accent)":"var(--card-border)"}`, borderRadius:10, background:form.size===s?"var(--accent-light)":"transparent", cursor:"pointer", textAlign:"left", fontSize:13, fontWeight:600, color:form.size===s?"var(--accent)":"var(--text-primary)", transition:"all 0.15s" }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Step 3 — Use cases */}
          {step === 3 && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {USE_CASES.map(({ icon, label }) => (
                <button key={label} onClick={() => toggleUseCase(label)}
                  style={{ padding:"12px 14px", border:`2px solid ${form.useCase.includes(label)?"var(--accent)":"var(--card-border)"}`, borderRadius:10, background:form.useCase.includes(label)?"var(--accent-light)":"transparent", cursor:"pointer", display:"flex", alignItems:"center", gap:10, fontSize:13, fontWeight:600, color:form.useCase.includes(label)?"var(--accent)":"var(--text-primary)", transition:"all 0.15s" }}>
                  <span style={{ fontSize:20 }}>{icon}</span>{label}
                </button>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display:"flex", gap:10, marginTop:24, justifyContent:"space-between" }}>
            {step > 1 ? (
              <button onClick={() => setStep(step-1)} className="btn btn-ghost">← Back</button>
            ) : <div />}
            <button
              onClick={() => step < 3 ? setStep(step+1) : handleCreate()}
              disabled={loading || (step===1 && !form.name.trim())}
              className="btn btn-primary">
              {loading ? "Creating..." : step < 3 ? <><span>Continue</span><ArrowRight size={14}/></> : <><Zap size={14}/> Create Workspace</>}
            </button>
          </div>

          {step === 3 && (
            <p style={{ textAlign:"center", marginTop:12, fontSize:12, color:"var(--text-muted)" }}>
              You can change these settings later
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
