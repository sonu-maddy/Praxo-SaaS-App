import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Zap, ArrowLeft } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(1);
  const [email,   setEmail]   = useState("");
  const [otp,     setOtp]     = useState("");
  const [pwd,     setPwd]     = useState("");
  const [conf,    setConf]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const sendOtp = async () => {
    if (!email) { setError("Enter your email"); return; }
    setLoading(true); setError("");
    try {
      const { data } = await axios.post(`${API}/auth/send-otp`, { email });
      toast.success(data.message);
      if (data.otp) toast(`Dev OTP: ${data.otp}`, { icon:"🔑", duration:20000 });
      setStep(2);
    } catch (err) { setError(err.response?.data?.message || "Failed to send OTP"); }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    setLoading(true); setError("");
    try {
      await axios.post(`${API}/auth/verify-otp`, { email, otp });
      setStep(3);
    } catch (err) { setError(err.response?.data?.message || "Invalid OTP"); }
    setLoading(false);
  };

  const resetPwd = async () => {
    if (!pwd || pwd !== conf) { setError("Passwords don't match"); return; }
    if (pwd.length < 6) { setError("Min 6 characters"); return; }
    setLoading(true); setError("");
    try {
      await axios.post(`${API}/auth/reset-password`, { email, otp, newPassword: pwd });
      toast.success("Password reset successfully!");
      navigate("/signin");
    } catch (err) { setError(err.response?.data?.message || "Reset failed"); }
    setLoading(false);
  };

  const STEP_INFO = [
    { title:"Forgot password?",       sub:"Enter your email and we'll send a 6-digit code."  },
    { title:"Check your inbox",       sub:`We sent a 6-digit OTP to ${email || "your email"}` },
    { title:"Create new password",    sub:"Almost there! Set a new secure password."          },
  ];

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--main-bg)", padding:24 }}>
      <div style={{ width:"100%", maxWidth:420, background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:20, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.07)" }}>
        {/* Header */}
        <div style={{ padding:"28px 32px 20px", background:"linear-gradient(135deg,#f2f0ff,#e8f3ff)", borderBottom:"1px solid var(--card-border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Zap size={16} color="white" />
            </div>
            <span style={{ fontWeight:800, fontSize:16, color:"var(--text-primary)" }}>SprintOS</span>
          </div>
          {/* Step dots */}
          <div style={{ display:"flex", gap:6, marginBottom:14 }}>
            {[1,2,3].map((s) => (
              <div key={s} style={{ height:4, flex:1, borderRadius:4, background:step>=s?"var(--accent)":"rgba(108,92,231,0.2)", transition:"background 0.3s" }} />
            ))}
          </div>
          <h1 style={{ fontSize:20, fontWeight:800, color:"var(--text-primary)", marginBottom:4 }}>{STEP_INFO[step-1].title}</h1>
          <p style={{ fontSize:13, color:"var(--text-secondary)" }}>{STEP_INFO[step-1].sub}</p>
        </div>

        <div style={{ padding:"28px 32px" }}>
          {/* Step 1 */}
          {step === 1 && (
            <div style={{ display:"grid", gap:14 }}>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="input" autoFocus
                  onKeyDown={(e) => e.key === "Enter" && sendOtp()} />
              </div>
              {error && <p style={{ fontSize:12, color:"#e2445c", background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:8, padding:"8px 12px" }}>{error}</p>}
              <button onClick={sendOtp} disabled={loading} className="btn btn-primary" style={{ justifyContent:"center", padding:"11px 0", fontSize:14 }}>
                {loading ? "Sending…" : <><span>Send OTP</span><ArrowRight size={14}/></>}
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div style={{ display:"grid", gap:14 }}>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>6-Digit OTP</label>
                <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
                  placeholder="0  0  0  0  0  0" maxLength={6} autoFocus
                  style={{ width:"100%", padding:"14px", border:"1px solid var(--card-border)", borderRadius:10, fontSize:24, fontWeight:800, letterSpacing:"0.5em", textAlign:"center", fontFamily:"monospace", background:"var(--card-bg)", color:"var(--text-primary)", outline:"none" }}
                  onFocus={(e) => e.target.style.borderColor="var(--accent)"}
                  onBlur={(e)  => e.target.style.borderColor="var(--card-border)"}
                  onKeyDown={(e) => e.key === "Enter" && verifyOtp()} />
              </div>
              {error && <p style={{ fontSize:12, color:"#e2445c", background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:8, padding:"8px 12px" }}>{error}</p>}
              <button onClick={verifyOtp} disabled={loading || otp.length !== 6} className="btn btn-primary" style={{ justifyContent:"center", padding:"11px 0", fontSize:14 }}>
                {loading ? "Verifying…" : <><span>Verify OTP</span><ArrowRight size={14}/></>}
              </button>
              <button onClick={() => { setStep(1); setOtp(""); setError(""); }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:"var(--text-muted)", display:"flex", alignItems:"center", gap:4, margin:"0 auto" }}>
                <ArrowLeft size={12} /> Use different email
              </button>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div style={{ display:"grid", gap:14 }}>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>New Password</label>
                <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Min. 6 characters" className="input" autoFocus />
              </div>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:5 }}>Confirm Password</label>
                <input type="password" value={conf} onChange={(e) => setConf(e.target.value)} placeholder="••••••••" className="input"
                  onKeyDown={(e) => e.key === "Enter" && resetPwd()} />
              </div>
              {error && <p style={{ fontSize:12, color:"#e2445c", background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:8, padding:"8px 12px" }}>{error}</p>}
              <button onClick={resetPwd} disabled={loading} className="btn btn-primary" style={{ justifyContent:"center", padding:"11px 0", fontSize:14 }}>
                {loading ? "Resetting…" : <><span>Reset Password</span><ArrowRight size={14}/></>}
              </button>
            </div>
          )}

          <p style={{ textAlign:"center", marginTop:16, fontSize:13 }}>
            <Link to="/signin" style={{ color:"#0073ea", textDecoration:"none", fontWeight:600, display:"inline-flex", alignItems:"center", gap:4 }}>
              <ArrowLeft size={12} /> Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
