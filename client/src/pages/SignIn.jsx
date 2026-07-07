import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, ArrowRight, Zap } from "lucide-react";
import axios from "axios";
import { setUser } from "../features/userSlice";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function SignIn() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const [form,    setForm]    = useState({ email:"", password:"" });
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/signin`, form, { withCredentials:true });
      localStorage.setItem("token", data.token);
      dispatch(setUser({ ...data.user, id: data.user._id?.toString() || data.user.id }));
      toast.success("Welcome back!");
      navigate(data.user.organizationId ? "/" : "/org-setup");
    } catch (err) { setError(err.response?.data?.message || "Invalid credentials"); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr", background:"#fff" }}>
      {/* Left — branding */}
      <div style={{ background:"linear-gradient(160deg,#1c1f3b 0%,#2d3170 100%)", display:"flex", flexDirection:"column", justifyContent:"center", padding:"60px 56px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-20%", right:"-20%", width:"60%", aspectRatio:"1", borderRadius:"50%", background:"rgba(108,92,231,0.15)" }} />
        <div style={{ position:"absolute", bottom:"-10%", left:"-10%", width:"40%", aspectRatio:"1", borderRadius:"50%", background:"rgba(0,115,234,0.1)" }} />
        <div style={{ position:"relative" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:48 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#6c5ce7,#a29bfe)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Zap size={20} color="white" />
            </div>
            <span style={{ fontWeight:800, fontSize:22, color:"white", letterSpacing:"-0.02em" }}>SprintOS</span>
          </div>
          <h1 style={{ fontSize:36, fontWeight:800, color:"white", lineHeight:1.2, marginBottom:16 }}>
            The Work OS<br/>for modern teams.
          </h1>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.65)", lineHeight:1.7, marginBottom:40, maxWidth:340 }}>
            Manage projects, track tasks, run sprints — all in one beautiful workspace. Built for Indian startups.
          </p>
          {[
            { icon:"⚡", text:"Setup in under 5 minutes" },
            { icon:"🎓", text:"Free for students & hackathons" },
            { icon:"🇮🇳", text:"India-first pricing in ₹" },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <span style={{ fontSize:16 }}>{icon}</span>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.8)", fontWeight:500 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 56px" }}>
        <div style={{ width:"100%", maxWidth:380 }}>
          <h2 style={{ fontSize:26, fontWeight:800, color:"var(--text-primary)", marginBottom:6 }}>Sign in</h2>
          <p style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:28 }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color:"#0073ea", fontWeight:700, textDecoration:"none" }}>Sign up free</Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display:"grid", gap:14 }}>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>Email Address</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form,email:e.target.value})} placeholder="you@company.com" className="input" required />
            </div>
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <label style={{ fontSize:12, fontWeight:700, color:"var(--text-secondary)" }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize:12, color:"#0073ea", textDecoration:"none" }}>Forgot password?</Link>
              </div>
              <div style={{ position:"relative" }}>
                <input type={show?"text":"password"} value={form.password} onChange={(e) => setForm({...form,password:e.target.value})} placeholder="••••••••" className="input" style={{paddingRight:42}} required />
                <button type="button" onClick={() => setShow(p=>!p)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)" }}>
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>
            {error && <p style={{ fontSize:12, color:"#e2445c", background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:8, padding:"8px 12px" }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent:"center", padding:"11px 0", fontSize:14 }}>
              {loading ? "Signing in…" : <><span>Sign In</span><ArrowRight size={15}/></>}
            </button>
          </form>

          <div style={{ display:"flex", alignItems:"center", gap:10, margin:"20px 0" }}>
            <div style={{ flex:1, height:1, background:"var(--card-border)" }} />
            <span style={{ fontSize:12, color:"var(--text-muted)", fontWeight:600 }}>OR</span>
            <div style={{ flex:1, height:1, background:"var(--card-border)" }} />
          </div>

          <button onClick={() => toast("Google sign-in coming soon!")} className="btn btn-ghost" style={{ width:"100%", justifyContent:"center", fontSize:13 }}>
            <img src="https://www.google.com/favicon.ico" alt="G" width={15} height={15} />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
