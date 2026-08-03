"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity, BarChart3, BookMarked, Brain, CalendarCheck,
  CheckSquare, Code2, Dumbbell, Flame, Gauge, Target,
  Timer, User, ChevronRight, LogOut, Moon, Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge, color: "#22c55e" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, color: "#6366f1" },
  { href: "/routine", label: "Routine", icon: CalendarCheck, color: "#14b8a6" },
  { href: "/habits", label: "Habits", icon: Flame, color: "#f59e0b" },
  { href: "/goals", label: "Goals", icon: Target, color: "#ef4444" },
  { href: "/timer", label: "Focus Timer", icon: Timer, color: "#8b5cf6" },
  { href: "/dsa", label: "DSA Revision", icon: Code2, color: "#06b6d4" },
  { href: "/study-vault", label: "Study Vault", icon: BookMarked, color: "#f97316" },
  { href: "/activity", label: "Activity", icon: Activity, color: "#ec4899" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, color: "#a78bfa" },
  { href: "/ai-insights", label: "AI Insights", icon: Brain, color: "#34d399" },
  { href: "/profile", label: "Profile", icon: User, color: "#64748b" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<{ name?: string; avatarUrl?: string }>({});
  const [mounted, setMounted] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/profile")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setProfile({ name: d.name, avatarUrl: d.avatarUrl }); })
      .catch(() => { });
  }, []);

  const displayName = profile.name ?? "User";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <aside className="sb-root">
        {/* ── Logo ── */}
        <Link href="/dashboard" className="sb-logo">
          <div className="sb-logo-icon">
            <Dumbbell size={20} strokeWidth={2.5} />
          </div>
          <div className="sb-logo-text">
            <span className="sb-logo-name">DevTrack <span className="sb-logo-ai">AI</span></span>
            <span className="sb-logo-sub">Personal discipline OS</span>
          </div>
        </Link>

        {/* ── Section label ── */}
        <p className="sb-section-label">MAIN MENU</p>

        {/* ── Nav items ── */}
        <nav className="sb-nav">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const hovered = hoveredHref === item.href;
            const isProfile = item.href === "/profile";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-item ${active ? "sb-item-active" : ""}`}
                onMouseEnter={() => setHoveredHref(item.href)}
                onMouseLeave={() => setHoveredHref(null)}
                style={{ "--item-color": item.color } as React.CSSProperties}
              >
                {active && <span className="sb-active-bar" style={{ background: item.color }} />}

                {/* Profile nav item — show user's actual avatar */}
                {isProfile ? (
                  <div className="sb-item-icon" style={{
                    background: "transparent", padding: 0,
                    overflow: "hidden", borderRadius: "50%",
                    border: active ? `2px solid ${item.color}` : hovered ? `2px solid ${item.color}60` : "2px solid var(--sb-border)",
                  }}>
                    {profile.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatarUrl} alt={displayName} referrerPolicy="no-referrer"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "50%" }} />
                    ) : (
                      <div style={{
                        width: "100%", height: "100%", borderRadius: "50%",
                        background: "linear-gradient(135deg,#16614f,#5ec4a8)",
                        display: "grid", placeItems: "center",
                        fontSize: ".68rem", fontWeight: 800, color: "#fff",
                      }}>
                        {initials || "U"}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="sb-item-icon" style={{
                    background: active ? `${item.color}20` : hovered ? `${item.color}15` : "transparent",
                    color: active || hovered ? item.color : "var(--sb-muted)",
                  }}>
                    <item.icon size={17} strokeWidth={active ? 2.5 : 2} />
                  </div>
                )}

                <span className="sb-item-label" style={{
                  color: active ? "var(--sb-fg)" : hovered ? "var(--sb-fg)" : "var(--sb-muted)",
                  fontWeight: active ? 700 : 500,
                }}>
                  {item.label}
                </span>

                {active && (
                  <ChevronRight size={14} className="sb-item-chevron" style={{ color: item.color }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Spacer ── */}
        <div style={{ flex: 1 }} />

        {/* ── Theme toggle ── */}
        {mounted && (
          <button
            className="sb-theme-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark"
              ? <><Sun size={15} /> <span>Light Mode</span></>
              : <><Moon size={15} /> <span>Dark Mode</span></>
            }
          </button>
        )}

        {/* ── Profile footer ── */}
        <div className="sb-footer">
          <Link href="/profile" className="sb-profile">
            <div className="sb-avatar">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  style={{ borderRadius: "50%", objectFit: "cover", width: "100%", height: "100%", display: "block" }}
                />
              ) : (
                <span className="sb-avatar-initials">{initials || "U"}</span>
              )}
            </div>
            <div className="sb-profile-info">
              <span className="sb-profile-name">{displayName}</span>
              <span className="sb-profile-role">View Profile →</span>
            </div>
          </Link>

          <form action="/api/auth/logout" method="post">
            <button type="submit" className="sb-logout-btn" title="Logout">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </aside>

      <style>{`
        :root {
          --sb-bg: #ffffff;
          --sb-border: rgba(0,0,0,0.07);
          --sb-fg: #0f1710;
          --sb-muted: #7a8a80;
          --sb-hover: rgba(0,0,0,0.04);
          --sb-section: #a0ada5;
          --sb-logo-bg: #16614f;
          --sb-footer-bg: rgba(0,0,0,0.025);
          --sb-shadow: 0 0 40px rgba(0,0,0,0.06);
        }
        .dark {
          --sb-bg: #0d1410;
          --sb-border: rgba(255,255,255,0.07);
          --sb-fg: #edf2ef;
          --sb-muted: #5a6e62;
          --sb-hover: rgba(255,255,255,0.05);
          --sb-section: #3a4e42;
          --sb-logo-bg: #16614f;
          --sb-footer-bg: rgba(255,255,255,0.03);
          --sb-shadow: 0 0 40px rgba(0,0,0,0.4);
        }

        .sb-root {
          position: fixed;
          inset-y: 0;
          left: 0;
          width: 260px;
          background: var(--sb-bg);
          border-right: 1px solid var(--sb-border);
          box-shadow: var(--sb-shadow);
          display: flex;
          flex-direction: column;
          padding: 0;
          z-index: 40;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .sb-root::-webkit-scrollbar { display: none; }

        /* ── Logo ── */
        .sb-logo {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 22px 18px 16px;
          text-decoration: none;
          border-bottom: 1px solid var(--sb-border);
          margin-bottom: 8px;
          transition: opacity .15s;
        }
        .sb-logo:hover { opacity: .85; }
        .sb-logo-icon {
          width: 38px; height: 38px;
          border-radius: 11px;
          background: var(--sb-logo-bg);
          color: #fff;
          display: grid; place-items: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(22,97,79,.4);
        }
        .sb-logo-text { display: flex; flex-direction: column; gap: 1px; }
        .sb-logo-name {
          font-size: .95rem; font-weight: 800;
          color: var(--sb-fg); line-height: 1.1;
        }
        .sb-logo-ai { color: #16614f; }
        .sb-logo-sub {
          font-size: .65rem; color: var(--sb-muted);
          font-weight: 500; letter-spacing: .01em;
        }

        /* ── Section label ── */
        .sb-section-label {
          font-size: .62rem; font-weight: 800;
          letter-spacing: .1em;
          color: var(--sb-section);
          padding: 0 20px 6px;
        }

        /* ── Nav ── */
        .sb-nav {
          display: flex; flex-direction: column;
          gap: 2px; padding: 0 10px;
        }

        .sb-item {
          position: relative;
          display: flex; align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 11px;
          text-decoration: none;
          transition: background .15s, transform .1s;
          cursor: pointer;
          overflow: hidden;
        }
        .sb-item:hover {
          background: var(--sb-hover);
        }
        .sb-item-active {
          background: linear-gradient(90deg, rgba(22,97,79,.1), rgba(22,97,79,.04)) !important;
        }
        .sb-item:active { transform: scale(.98); }

        /* left active bar */
        .sb-active-bar {
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px; border-radius: 0 3px 3px 0;
        }

        .sb-item-icon {
          width: 32px; height: 32px;
          border-radius: 9px;
          display: grid; place-items: center;
          flex-shrink: 0;
          transition: background .15s, color .15s;
        }

        .sb-item-label {
          flex: 1;
          font-size: .83rem;
          transition: color .15s, font-weight .1s;
          white-space: nowrap;
        }

        .sb-item-chevron {
          opacity: .7;
          flex-shrink: 0;
        }

        /* ── Theme toggle ── */
        .sb-theme-btn {
          display: flex; align-items: center; gap: 8px;
          margin: 4px 10px 6px;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid var(--sb-border);
          background: var(--sb-hover);
          color: var(--sb-muted);
          font-size: .78rem; font-weight: 600;
          cursor: pointer;
          transition: background .15s, color .15s;
          width: calc(100% - 20px);
        }
        .sb-theme-btn:hover {
          background: rgba(22,97,79,.1);
          color: #16614f;
          border-color: rgba(22,97,79,.2);
        }

        /* ── Footer ── */
        .sb-footer {
          display: flex; align-items: center;
          gap: 8px;
          padding: 12px 10px;
          border-top: 1px solid var(--sb-border);
          background: var(--sb-footer-bg);
        }

        .sb-profile {
          display: flex; align-items: center;
          gap: 9px; flex: 1;
          text-decoration: none;
          border-radius: 11px;
          padding: 6px 8px;
          transition: background .15s;
          min-width: 0;
        }
        .sb-profile:hover { background: var(--sb-hover); }

        .sb-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #16614f, #5ec4a8);
          display: grid; place-items: center;
          flex-shrink: 0;
          overflow: hidden;
          border: 2px solid rgba(22,97,79,.3);
        }
        .sb-avatar-initials {
          font-size: .78rem; font-weight: 800;
          color: #fff;
        }

        .sb-profile-info {
          display: flex; flex-direction: column;
          gap: 1px; min-width: 0;
        }
        .sb-profile-name {
          font-size: .8rem; font-weight: 700;
          color: var(--sb-fg);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-profile-role {
          font-size: .65rem; color: #16614f;
          font-weight: 600;
        }

        .sb-logout-btn {
          width: 34px; height: 34px;
          border-radius: 9px;
          border: 1px solid var(--sb-border);
          background: transparent;
          color: var(--sb-muted);
          display: grid; place-items: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background .15s, color .15s, border-color .15s;
        }
        .sb-logout-btn:hover {
          background: rgba(239,68,68,.1);
          color: #ef4444;
          border-color: rgba(239,68,68,.2);
        }

        /* ── Mobile: hidden sidebar, show bottom nav ── */
        @media (max-width: 1023px) {
          .sb-root { display: none; }
        }
      `}</style>
    </>
  );
}
