import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import axios from "axios";
import { setUser } from "../features/userSlice";
import toast from "react-hot-toast";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function SignIn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API}/auth/signin`,
        form,
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

      toast.success("Welcome back!");

      navigate(
        data.user.organizationId
          ? "/"
          : "/org-setup"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "#ffffff",
      }}
    >
      {/* LEFT — BRANDING */}
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
        {/* Decorative circles */}
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
            bottom: "-10%",
            left: "-10%",
            width: "40%",
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
              fontSize: 36,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.2,
              marginBottom: 16,
              maxWidth: 450,
            }}
          >
            The Work OS for modern teams.
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.72)",
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: 340,
            }}
          >
            Manage projects, track tasks, run sprints —
            all in one beautiful workspace. Built for
            Indian startups.
          </p>

          {/* Features */}
          {[
            {
              icon: "⚡",
              text: "Setup in under 5 minutes",
            },
            {
              icon: "🎓",
              text: "Free for students & hackathons",
            },
            {
              icon: "🇮🇳",
              text: "India-first pricing in ₹",
            },
          ].map(({ icon, text }) => (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                }}
              >
                {icon}
              </span>

              <span
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                  fontWeight: 500,
                }}
              >
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — FORM */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 56px",
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
              fontSize: 28,
              fontWeight: 800,
              color: "#111111",
              marginBottom: 6,
            }}
          >
            Sign in
          </h2>

          <p
            style={{
              fontSize: 13,
              color: "#666666",
              marginBottom: 28,
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{
                color: "#000000",
                fontWeight: 700,
                textDecoration: "underline",
              }}
            >
              Sign up free
            </Link>
          </p>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: 16,
            }}
          >
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
                Email Address
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#333333",
                  }}
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: 12,
                    color: "#333333",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Forgot password?
                </Link>
              </div>

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
                  placeholder="••••••••"
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
                  onClick={() => setShow((prev) => !prev)}
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

            {/* SIGN IN BUTTON */}
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
                "Signing in..."
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* DIVIDER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "22px 0",
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: "#dddddd",
              }}
            />

            <span
              style={{
                fontSize: 12,
                color: "#888888",
                fontWeight: 600,
              }}
            >
              OR
            </span>

            <div
              style={{
                flex: 1,
                height: 1,
                background: "#dddddd",
              }}
            />
          </div>

          {/* GOOGLE */}
          <button
            onClick={() =>
              toast("Google sign-in coming soon!")
            }
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "11px 0",
              fontSize: 13,
              fontWeight: 600,
              color: "#222222",
              background: "#ffffff",
              border: "1px solid #d1d1d1",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="G"
              width={15}
              height={15}
            />

            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}