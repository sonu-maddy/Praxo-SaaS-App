import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Search, Bell, HelpCircle, Sun, Moon, Monitor, Plus } from "lucide-react";
import { setTheme } from "../features/themeSlice";

export default function TopNav() {
  const user    = useSelector((s) => s.user.user);
  const theme   = useSelector((s) => s.theme?.mode || "light");
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");

  const themes = [
    { key: "light", Icon: Sun   },
    { key: "dark",  Icon: Moon  },
    { key: "system",Icon: Monitor},
  ];

  return (
    <header className="top-nav">
      {/* Search */}
      <div style={{ position: "relative", flex: 1, maxWidth: 440 }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks, boards, people..."
          style={{
            width: "100%", paddingLeft: 32, paddingRight: 12, height: 34,
            border: "1px solid var(--card-border)", borderRadius: 8,
            fontSize: 13, background: "var(--main-bg)", color: "var(--text-primary)",
            outline: "none", fontFamily: "inherit",
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(108,92,231,0.15)"; }}
          onBlur={(e)  => { e.target.style.borderColor = "var(--card-border)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
        {/* Theme toggle */}
        <div style={{ display: "flex", background: "var(--main-bg)", border: "1px solid var(--card-border)", borderRadius: 8, padding: 2, gap: 2 }}>
          {themes.map(({ key, Icon }) => (
            <button key={key} onClick={() => dispatch(setTheme(key))}
              title={key}
              style={{
                width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                background: theme === key ? "var(--card-bg)" : "transparent",
                color: theme === key ? "var(--accent)" : "var(--text-muted)",
                boxShadow: theme === key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s",
              }}>
              <Icon size={13} />
            </button>
          ))}
        </div>

        {[HelpCircle, Bell].map((Icon, i) => (
          <button key={i} style={{ width: 34, height: 34, border: "none", background: "transparent", cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--main-bg)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
            <Icon size={17} />
          </button>
        ))}

        {/* Avatar */}
        <div className="avatar" style={{ background: `hsl(${(user?.name?.charCodeAt(0) || 0) * 7 % 360},65%,55%)`, width: 32, height: 32, fontSize: 13, cursor: "pointer" }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}
