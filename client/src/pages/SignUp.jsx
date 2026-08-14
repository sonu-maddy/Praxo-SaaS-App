// SignUp.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import axios from "axios";
import { setUser } from "../features/userSlice";
import toast from "react-hot-toast";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API}/auth/signup`,
        {
          name: form.name,
          email: form.email,
          password: form.password,
        },
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("token", data.token);

      dispatch(
        setUser({
          ...data.user,
          id: data.user._id?.toString() || data.user.id,
        })
      );

      toast.success("Account created! Let's set up your workspace 🚀");

      navigate("/org-setup");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const PERKS = [
    "Free forever — no credit card needed",
    "Unlimited tasks on free plan",
    "Invite up to 5 teammates",
    "All board views included",
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "#ffffff",
      }}
    >
      {/* ================= LEFT — BRANDING ================= */}

      <div
        style={{
          background:
            "linear-gradient(160deg, #000000 0%, #222222 50%, #555555 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 56px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circle */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-20%",
            width: "60%",
            aspectRatio: "1",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            left: "-10%",
            width: "45%",
            aspectRatio: "1",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 48,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 20,
                  color: "#000000",
                }}
              >
                S
              </span>
            </div>

            <span
              style={{
                fontWeight: 800,
                fontSize: 22,
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}
            >
              SprintOS
            </span>
          </div>

          {/* Heading */}

          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.2,
              marginBottom: 12,
              maxWidth: 430,
            }}
          >
            Start managing work the right way.
          </h1>

          {/* Description */}

          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.72)",
              lineHeight: 1.7,
              marginBottom: 32,
              maxWidth: 360,
            }}
          >
            Join 500+ teams — from solo students to
            growing startups.
          </p>

          {/* Perks */}

          {PERKS.map((perk) => (
            <div
              key={perk}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Check
                  size={13}
                  strokeWidth={3}
                  color="#000000"
                />
              </div>

              <span
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 500,
                }}
              >
                {perk}
              </span>
            </div>
          ))}

          {/* Testimonial */}

          <div
            style={{
              marginTop: 40,
              padding: "16px 20px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              maxWidth: 400,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.75)",
                fontStyle: "italic",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              "Replaced Jira + Trello in one afternoon.
              Our whole hackathon team was onboarded in
              10 minutes."
            </p>

            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.45)",
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              — Team Nexus, IIT Bombay Hackathon
            </p>
          </div>
        </div>
      </div>

      {/* ================= RIGHT — FORM ================= */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 56px",
          overflowY: "auto",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 380,
          }}
        >
          {/* Heading */}

          <h2
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#111111",
              marginBottom: 6,
            }}
          >
            Create your account
          </h2>

          <p
            style={{
              fontSize: 13,
              color: "#666666",
              marginBottom: 28,
            }}
          >
            Already have an account?{" "}
            <Link
              to="/signin"
              style={{
                color: "#000000",
                fontWeight: 700,
                textDecoration: "underline",
              }}
            >
              Sign in
            </Link>
          </p>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            {/* FULL NAME */}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#333333",
                  marginBottom: 6,
                }}
              >
                Full Name
              </label>

              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="Arjun Mehta"
                required
                autoFocus
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 13px",
                  borderRadius: 8,
                  border: "1px solid #d1d1d1",
                  background: "#ffffff",
                  color: "#111111",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            {/* EMAIL */}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#333333",
                  marginBottom: 6,
                }}
              >
                Work Email
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                placeholder="you@company.com"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 13px",
                  borderRadius: 8,
                  border: "1px solid #d1d1d1",
                  background: "#ffffff",
                  color: "#111111",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#333333",
                  marginBottom: 6,
                }}
              >
                Password
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <input
                  type={show ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  placeholder="Min. 6 characters"
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 42px 11px 13px",
                    borderRadius: 8,
                    border: "1px solid #d1d1d1",
                    background: "#ffffff",
                    color: "#111111",
                    fontSize: 13,
                    outline: "none",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShow((prev) => !prev)
                  }
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#555555",
                    padding: 0,
                  }}
                >
                  {show ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#333333",
                  marginBottom: 6,
                }}
              >
                Confirm Password
              </label>

              <input
                type="password"
                value={form.confirm}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirm: e.target.value,
                  })
                }
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 13px",
                  borderRadius: 8,
                  border: "1px solid #d1d1d1",
                  background: "#ffffff",
                  color: "#111111",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            {/* ERROR */}

            {error && (
              <p
                style={{
                  fontSize: 12,
                  color: "#000000",
                  background: "#f3f3f3",
                  border: "1px solid #cccccc",
                  borderRadius: 8,
                  padding: "9px 12px",
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}

            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "12px 0",
                fontSize: 14,
                fontWeight: 700,
                color: "#ffffff",
                background: "#000000",
                border: "none",
                borderRadius: 8,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* TERMS */}

          <p
            style={{
              fontSize: 11,
              color: "#888888",
              textAlign: "center",
              marginTop: 16,
              lineHeight: 1.6,
            }}
          >
            By signing up you agree to our{" "}
            <a
              href="#"
              style={{
                color: "#222222",
                textDecoration: "underline",
              }}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              style={{
                color: "#222222",
                textDecoration: "underline",
              }}
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}