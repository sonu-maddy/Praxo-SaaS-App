// SignUp.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, ArrowRight, Zap, Check } from "lucide-react";
import axios from "axios";
import { setUser } from "../features/userSlice";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function SignUp() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const [form,    setForm]    = useState({ name:"", email:"", password:"", confirm:"" });
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/signup`, { name:form.name, email:form.email, password:form.password }, { withCredentials:true });
      localStorage.setItem("token", data.token);
      dispatch(setUser({ ...data.user, id: data.user._id?.toString() || data.user.id }));
      toast.success("Account created! Let's set up your workspace 🚀");
      navigate("/org-setup");
    } catch (err) { setError(err.response?.data?.message || err.response?.data || "Signup failed"); }
    setLoading(false);
  };

  const PERKS = [
    "Free forever — no credit card needed",
    "Unlimited tasks on free plan",
    "Invite up to 5 teammates",
    "All board views included",
  ];

  return (
    <div style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr", background:"#fff" }}>
      {/* Left */}
      <div style={{ background:"linear-gradient(160deg,#1c1f3b,#2d3170)", display:"flex", flexDirection:"column", justifyContent:"center", padding:"60px 56px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-20%", right:"-20%", width:"60%", aspectRatio:"1", borderRadius:"50%", background:"rgba(108,92,231,0.12)" }} />
        <div style={{ position:"relative" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:48 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#6c5ce7,#a29bfe)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Zap size={20} color="white" />
            </div>
            <span style={{ fontWeight:800, fontSize:22, color:"white" }}>SprintOS</span>
          </div>
          <h1 style={{ fontSize:34, fontWeight:800, color:"white", lineHeight:1.2, marginBottom:12 }}>
            Start managing work<br/>the right way.
          </h1>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.65)", marginBottom:32 }}>
            Join 500+ teams — from solo students to growing startups.
          </p>
          {PERKS.map((perk) => (
            <div key={perk} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:"#00c875", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Check size={12} color="white" strokeWidth={3} />
              </div>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.85)" }}>{perk}</span>
            </div>
          ))}
          <div style={{ marginTop:40, padding:"16px 20px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12 }}>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", fontStyle:"italic" }}>
              "Replaced Jira + Trello in one afternoon. Our whole hackathon team was onboarded in 10 minutes."
            </p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:6 }}>— Team Nexus, IIT Bombay Hackathon</p>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 56px", overflowY:"auto" }}>
        <div style={{ width:"100%", maxWidth:380 }}>
          <h2 style={{ fontSize:26, fontWeight:800, color:"var(--text-primary)", marginBottom:6 }}>Create your account</h2>
          <p style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:28 }}>
            Already have an account?{" "}
            <Link to="/signin" style={{ color:"#0073ea", fontWeight:700, textDecoration:"none" }}>Sign in</Link>
          </p>
          <form onSubmit={handleSubmit} style={{ display:"grid", gap:13 }}>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>Full Name</label>
              <input value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} placeholder="Arjun Mehta" className="input" required autoFocus />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>Work Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form,email:e.target.value})} placeholder="you@company.com" className="input" required />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>Password</label>
              <div style={{ position:"relative" }}>
                <input type={show?"text":"password"} value={form.password} onChange={(e) => setForm({...form,password:e.target.value})} placeholder="Min. 6 characters" className="input" style={{paddingRight:42}} required />
                <button type="button" onClick={() => setShow(p=>!p)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)" }}>
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>Confirm Password</label>
              <input type="password" value={form.confirm} onChange={(e) => setForm({...form,confirm:e.target.value})} placeholder="••••••••" className="input" required />
            </div>
            {error && <p style={{ fontSize:12, color:"#e2445c", background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:8, padding:"8px 12px" }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent:"center", padding:"11px 0", fontSize:14 }}>
              {loading ? "Creating account…" : <><span>Create Account</span><ArrowRight size={15}/></>}
            </button>
          </form>
          <p style={{ fontSize:11, color:"var(--text-muted)", textAlign:"center", marginTop:16, lineHeight:1.6 }}>
            By signing up you agree to our{" "}
            <a href="#" style={{ color:"#0073ea", textDecoration:"none" }}>Terms of Service</a> and{" "}
            <a href="#" style={{ color:"#0073ea", textDecoration:"none" }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
