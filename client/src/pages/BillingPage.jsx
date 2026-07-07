import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Check, Zap, Star, Crown, Building2, ArrowRight } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

const PLANS = [
  {
    key: "free", name: "Free", price: 0, period: "forever",
    icon: Star, color: "#676879", bg: "#f5f6f8",
    desc: "Perfect for students & hackathons",
    badge: null,
    features: ["1 Workspace", "3 Boards", "5 Team Members", "Basic Kanban & Table views", "Task comments", "2 GB storage", "Community support"],
  },
  {
    key: "starter", name: "Starter", price: 499, period: "/ month",
    icon: Zap, color: "#0073ea", bg: "#e8f3ff",
    desc: "For small growing startups",
    badge: null,
    features: ["3 Workspaces", "10 Boards", "15 Members", "All board views", "Sprint planning", "Analytics dashboard", "File attachments (10 GB)", "Priority email support"],
  },
  {
    key: "pro", name: "Pro", price: 1499, period: "/ month",
    icon: Crown, color: "#6c5ce7", bg: "#f2f0ff",
    desc: "For scaling product teams",
    badge: "Most Popular",
    features: ["Unlimited Workspaces", "Unlimited Boards", "50 Members", "AI task suggestions", "Gantt / Timeline view", "Time tracking", "Automation rules (25/mo)", "Slack integration", "100 GB storage", "24/7 chat support"],
  },
  {
    key: "enterprise", name: "Enterprise", price: null, period: "",
    icon: Building2, color: "#f57c00", bg: "#fff3e0",
    desc: "For large organizations",
    badge: null,
    features: ["Unlimited everything", "SSO / SAML login", "Dedicated infrastructure", "Custom integrations & API", "White label option", "SLA 99.9% uptime", "Dedicated account manager", "On-premise deployment"],
  },
];

export default function BillingPage() {
  const user = useSelector((s) => s.user.user);
  const [org, setOrg] = useState(null);
  const [usage, setUsage] = useState(null);
  const [billing, setBilling] = useState("monthly");
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    api.get("/org/plan").then((r) => { setOrg(r.data); setUsage(r.data.usage); }).catch(() => { });
  }, []);

  // BillingPage.jsx ke andar, component ke top pe add karo:

  const downloadReceipt = async (h) => {
    try {
      const token = localStorage.getItem("token");

      // Backend se PDF fetch karo
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/org/payment/receipt/${h.razorpayPaymentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        toast.error("Receipt not found");
        return;
      }

      // Blob banao aur download karo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt_${h.razorpayPaymentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Receipt downloaded!");
    } catch (err) {
      toast.error("Download failed");
    }
  };

  const isOwner = user?.orgRole === "org_owner" || user?.role === "admin";

  const handleUpgrade = async (planKey) => {
    if (!isOwner) {
      toast.error("Only the organization owner can manage billing.");
      return;
    }
    if (planKey === "enterprise") {
      window.open("mailto:sales@sprintos.in?subject=Enterprise%20Inquiry");
      return;
    }
    if (planKey === "free") { toast("You're already on a plan above free."); return; }

    setPaying(planKey);
    try {
      const { data: order } = await api.post("/org/payment/order", { plan: planKey });

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: order.key,
          amount: order.amount,
          currency: "INR",
          name: "SprintOS",
          description: `${planKey.charAt(0).toUpperCase() + planKey.slice(1)} Plan`,
          order_id: order.id,
          handler: async (response) => {
            try {
              await api.post("/org/payment/verify", { ...response, plan: planKey });
              toast.success(`Upgraded to ${planKey} plan! 🎉`);
              api.get("/org/plan").then((r) => { setOrg(r.data); setUsage(r.data.usage); });
            } catch (err) { toast.error("Payment verification failed. Contact support."); }
          },
          prefill: { email: user?.email, name: user?.name },
          theme: { color: "#6c5ce7" },
        });
        rzp.open();
      };
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment initiation failed");
    }
    setPaying(null);
  };

  const UsageBar = ({ label, used, max }) => {
    const pct = max === Infinity ? 0 : Math.min((used / max) * 100, 100);
    const isNear = pct > 80;
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: isNear ? "#e2445c" : "var(--text-primary)" }}>
            {used} / {max === Infinity ? "∞" : max}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${max === Infinity ? 10 : pct}%`, background: isNear ? "#e2445c" : undefined }} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "15px 32px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>Plans & Billing</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          {org ? `${org.name || "Your org"} is on the ` : ""}
          <span style={{ fontWeight: 700, color: "var(--accent)" }}>{org?.plan?.toUpperCase() || "FREE"}</span> plan
        </p>
      </div>

      {/* ⬇ PDF button jo billing history mein har row mein hai */}
      <button
        onClick={() => downloadReceipt(h)}
        style={{
          fontSize: 11, fontWeight: 600,
          color: "var(--accent)",
          background: "var(--accent-light)",
          border: "none",
          padding: "5px 10px",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Download PDF
      </button>

      {/* Current usage */}
      {usage && (
        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: 12,
            padding: 10,
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--sd-bg)",
              marginBottom: 12,
            }}
          >
            Current Usage
          </h2>

          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1 }}>
              <UsageBar
                label="Workspaces"
                used={usage.workspaces?.used}
                max={usage.workspaces?.max}
              />
            </div>

            <div style={{ flex: 1 }}>
              <UsageBar
                label="Boards"
                used={usage.projects?.used}
                max={usage.projects?.max}
              />
            </div>

            <div style={{ flex: 1 }}>
              <UsageBar
                label="Members"
                used={usage.members?.used}
                max={usage.members?.max}
              />
            </div>
          </div>
        </div>
      )}

      {/* Billing toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Billing:</span>
        <div style={{ display: "flex", background: "var(--main-bg)", border: "1px solid var(--card-border)", borderRadius: 8, padding: 3, gap: 3 }}>
          {["monthly", "yearly"].map((b) => (
            <button key={b} onClick={() => setBilling(b)}
              style={{ padding: "5px 16px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, background: billing === b ? "var(--card-bg)" : "transparent", color: billing === b ? "var(--accent)" : "var(--text-secondary)", boxShadow: billing === b ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              {b.charAt(0).toUpperCase() + b.slice(1)} {b === "yearly" && <span style={{ color: "#00c875", fontSize: 11 }}>Save 20%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 16, maxWidth: 1000 }}>
        {PLANS.map((plan) => {
          const isCurrent = org?.plan === plan.key;
          const yearlyPrice = plan.price ? Math.round(plan.price * 0.8) : null;
          const displayPrice = billing === "yearly" && yearlyPrice ? yearlyPrice : plan.price;

          return (
            <div key={plan.key} style={{
              background: "var(--card-bg)", border: `2px solid ${isCurrent ? "var(--accent)" : "var(--card-border)"}`,
              borderRadius: 14, overflow: "hidden", position: "relative",
              boxShadow: plan.badge ? "0 8px 32px rgba(108,92,231,0.15)" : "none",
              transform: plan.badge ? "scale(1.02)" : "none",
            }}>
              {plan.badge && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, textAlign: "center", background: "var(--accent)", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 0", letterSpacing: "0.05em" }}>
                  ⭐ {plan.badge}
                </div>
              )}
              {isCurrent && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, textAlign: "center", background: "#00c875", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 0" }}>
                  ✓ Current Plan
                </div>
              )}

              <div style={{ padding: 20, paddingTop: (plan.badge || isCurrent) ? 32 : 20 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: plan.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <plan.icon size={18} color={plan.color} />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>{plan.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{plan.desc}</p>
                  </div>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 16 }}>
                  {plan.price === null ? (
                    <p style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>Custom</p>
                  ) : plan.price === 0 ? (
                    <div>
                      <span style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>₹0</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 4 }}>free forever</span>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>₹{displayPrice}</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 4 }}>/mo</span>
                      {billing === "yearly" && <div style={{ fontSize: 11, color: "#00c875", fontWeight: 600 }}>Save ₹{(plan.price - yearlyPrice) * 12}/yr</div>}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={() => !isCurrent && handleUpgrade(plan.key)}
                  disabled={isCurrent || paying === plan.key || !isOwner}
                  style={{
                    width: "100%", padding: "9px 0", borderRadius: 8, border: "none", cursor: isCurrent || !isOwner ? "default" : "pointer",
                    fontSize: 13, fontWeight: 700,
                    background: isCurrent ? "#e8ffe8" : plan.key === "pro" ? "var(--accent)" : plan.key === "enterprise" ? "#f57c00" : "var(--main-bg)",
                    color: isCurrent ? "#00c875" : plan.key === "pro" || plan.key === "enterprise" ? "white" : "var(--text-primary)",
                    border: isCurrent ? "1px solid #00c875" : plan.key === "pro" || plan.key === "enterprise" ? "none" : "1px solid var(--card-border)",
                    marginBottom: 16, opacity: paying && paying !== plan.key ? 0.6 : 1,
                  }}>
                  {paying === plan.key ? "Processing..." : isCurrent ? "Current Plan" : plan.price === null ? "Contact Sales" : plan.price === 0 ? "Downgrade to Free" : `Upgrade to ${plan.name}`}
                </button>

                {/* Features */}
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 7 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12 }}>
                      <Check size={13} style={{ color: "#00c875", flexShrink: 0, marginTop: 1 }} />
                      <span style={{ color: "var(--text-secondary)" }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student/Startup note */}
      <div style={{ marginTop: 28, padding: 18, background: "linear-gradient(135deg,#e8f3ff,#f2f0ff)", border: "1px solid rgba(108,92,231,0.2)", borderRadius: 12, maxWidth: 600 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>🎓 Student & Startup Program</p>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}>
          Are you a student or early-stage startup? Get <strong>Starter plan free for 6 months</strong> with a valid .edu email or startup registration.
        </p>
        <a href="mailto:startups@sprintos.in?subject=Student%20Startup%20Program" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}>
          Apply Now <ArrowRight size={13} />
        </a>
      </div>

      {/* Billing History Section */}
      {org?.subscription?.history?.length > 0 && (
        <div style={{ marginTop: 32, maxWidth: 700 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            🧾 Billing History
          </h2>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, overflow: "hidden" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 130px 130px 80px", padding: "10px 18px", background: "var(--main-bg)", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <span>Plan</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Purchase Date</span>
              <span>Valid Till</span>
              <span>Receipt</span>
            </div>

            {/* Rows */}
            {[...org.subscription.history].reverse().map((h, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 130px 130px 80px", padding: "14px 18px", borderTop: "1px solid var(--card-border)", alignItems: "center" }}>
                {/* Plan */}
                <div>
                  <span className={`plan-badge plan-${h.plan}`}>{h.plan?.toUpperCase()}</span>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
                    {h.razorpayPaymentId}
                  </p>
                </div>

                {/* Amount */}
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  ₹{h.amount}
                </span>

                {/* Status */}
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, width: "fit-content",
                  background: h.status === "paid" ? "#e3faf0" : "#fff1f2",
                  color: h.status === "paid" ? "#00c875" : "#e2445c",
                }}>
                  {h.status === "paid" ? "✓ Paid" : h.status}
                </span>

                {/* Purchase Date */}
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {new Date(h.purchaseDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>

                {/* Valid Till */}
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {h.periodEnd ? new Date(h.periodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </span>

                {/* Download Receipt button */}
                <button
                  onClick={() => downloadReceipt(h)}
                  style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", background: "var(--accent-light)", border: "none", padding: "5px 10px", borderRadius: 6, cursor: "pointer" }}
                >
                  ⬇ PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

  );
}
