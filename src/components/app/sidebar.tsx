"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Activity, BarChart3, BookMarked, Brain, CalendarCheck,
  CheckSquare, Code2, Dumbbell, Flame, Gauge, Target,
  Timer, User, LogOut, Moon, Sun, Menu, X, ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";

/* ─── Nav config ───────────────────────────────────────────── */
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

/* Bottom nav shows only the 5 most-used items */
const BOTTOM_NAV = [
  { href: "/dashboard", label: "Home", icon: Gauge, color: "#22c55e" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, color: "#6366f1" },
  { href: "/habits", label: "Habits", icon: Flame, color: "#f59e0b" },
  { href: "/study-vault", label: "Vault", icon: BookMarked, color: "#f97316" },
  { href: "/ai-insights", label: "AI", icon: Brain, color: "#34d399" },
];

/* ─── Shared avatar helper ────────────────────────────────── */
function Avatar({
  avatarUrl, initials, size = 36, border,
}: {
  avatarUrl?: string; initials: string; size?: number; border?: string;
}) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
      background: "linear-gradient(135deg,#16614f,#5ec4a8)",
      display: "grid", placeItems: "center",
      border: border ?? "2px solid rgba(22,97,79,.3)",
    }}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={initials} referrerPolicy="no-referrer"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <span style={{ fontSize: size * 0.28 + "px", fontWeight: 800, color: "#fff" }}>
          {initials || "U"}
        </span>
      )}
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────── */
export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<{ name?: string; avatarUrl?: string }>({});
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const displayName = profile.name ?? "User";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
    fetch("/api/profile")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setProfile({ name: d.name, avatarUrl: d.avatarUrl }); })
      .catch(() => { });
  }, []);

  /* Close drawer on outside click */
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [drawerOpen]);

  /* Close drawer on route change */
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  /* Prevent body scroll when drawer open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      {/* ══════════════════════════════════════════════════
          DESKTOP SIDEBAR  (≥ 1024px)
      ══════════════════════════════════════════════════ */}
      <aside className="sb-root">
        {/* Logo */}
        <Link href="/dashboard" className="sb-logo">
          <div className="sb-logo-icon">
            <Dumbbell size={19} strokeWidth={2.5} />
          </div>
          <div className="sb-logo-text">
            <span className="sb-logo-name">DevTrack <span className="sb-logo-ai">AI</span></span>
            <span className="sb-logo-sub">Personal discipline OS</span>
          </div>
        </Link>

        <p className="sb-section-label">MAIN MENU</p>

        <nav className="sb-nav">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const isProfile = item.href === "/profile";
            return (
              <Link key={item.href} href={item.href}
                className={`sb-item ${active ? "sb-item-active" : ""}`}
                style={{ "--ic": item.color } as React.CSSProperties}>
                {active && <span className="sb-active-bar" style={{ background: item.color }} />}

                {isProfile ? (
                  <div className="sb-item-icon sb-item-icon-avatar" style={{
                    border: active ? `2px solid ${item.color}` : "2px solid var(--sb-border)",
                  }}>
                    <Avatar avatarUrl={profile.avatarUrl} initials={initials} size={28} border="none" />
                  </div>
                ) : (
                  <div className="sb-item-icon" style={{
                    background: active ? `${item.color}20` : "transparent",
                    color: active ? item.color : "var(--sb-muted)",
                  }}>
                    <item.icon size={16} strokeWidth={active ? 2.5 : 2} />
                  </div>
                )}

                <span className="sb-item-label" style={{
                  color: active ? "var(--sb-fg)" : "var(--sb-muted)",
                  fontWeight: active ? 700 : 500,
                }}>{item.label}</span>

                {active && <ChevronRight size={13} style={{ color: item.color, opacity: 0.7, flexShrink: 0 }} />}
              </Link>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Theme toggle */}
        {mounted && (
          <button className="sb-theme-btn" onClick={() => setTheme(isDark ? "light" : "dark")}>
            {isDark ? <><Sun size={14} /><span>Light Mode</span></> : <><Moon size={14} /><span>Dark Mode</span></>}
          </button>
        )}

        {/* Footer */}
        <div className="sb-footer">
          <Link href="/profile" className="sb-profile">
            <Avatar avatarUrl={profile.avatarUrl} initials={initials} size={34} />
            <div className="sb-profile-info">
              <span className="sb-profile-name">{displayName}</span>
              <span className="sb-profile-role">View Profile →</span>
            </div>
          </Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="sb-logout-btn" title="Logout">
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════
          MOBILE TOP HEADER  (< 1024px)
      ══════════════════════════════════════════════════ */}
      <header className="mob-header">
        <div className="mob-header-inner">
          {/* Hamburger */}
          <button className="mob-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link href="/dashboard" className="mob-logo">
            <div className="mob-logo-icon"><Dumbbell size={15} strokeWidth={2.5} /></div>
            <span className="mob-logo-text">DevTrack <span style={{ color: "var(--primary)" }}>AI</span></span>
          </Link>

          {/* Right: theme + avatar */}
          <div className="mob-header-right">
            {mounted && (
              <button className="mob-icon-btn" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Toggle theme">
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}
            <Link href="/profile" className="mob-avatar-btn">
              <Avatar avatarUrl={profile.avatarUrl} initials={initials} size={30} border="2px solid var(--border)" />
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════
          MOBILE DRAWER OVERLAY
      ══════════════════════════════════════════════════ */}
      {drawerOpen && <div className="mob-backdrop" onClick={() => setDrawerOpen(false)} />}

      <div ref={drawerRef} className={`mob-drawer ${drawerOpen ? "mob-drawer-open" : ""}`}>
        {/* Drawer header */}
        <div className="mob-drawer-hd">
          <div className="mob-drawer-logo">
            <div className="sb-logo-icon" style={{ width: 32, height: 32 }}>
              <Dumbbell size={16} strokeWidth={2.5} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: ".88rem", fontWeight: 800, color: "var(--sb-fg)" }}>
                DevTrack <span style={{ color: "#16614f" }}>AI</span>
              </p>
              <p style={{ margin: 0, fontSize: ".62rem", color: "var(--sb-muted)" }}>Personal discipline OS</p>
            </div>
          </div>
          <button className="mob-close-btn" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        {/* User card */}
        <div className="mob-drawer-user">
          <Avatar avatarUrl={profile.avatarUrl} initials={initials} size={44} />
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: ".9rem", fontWeight: 800, color: "var(--sb-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </p>
            <p style={{ margin: 0, fontSize: ".7rem", color: "#16614f", fontWeight: 600 }}>View Profile →</p>
          </div>
        </div>

        <p className="sb-section-label" style={{ paddingLeft: 16, paddingRight: 16, marginTop: 8 }}>MENU</p>

        {/* Drawer nav */}
        <nav className="mob-drawer-nav">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`mob-drawer-item ${active ? "mob-drawer-item-active" : ""}`}
                style={{ "--ic": item.color } as React.CSSProperties}>
                <div className="mob-drawer-icon" style={{
                  background: active ? `${item.color}20` : `${item.color}10`,
                  color: active ? item.color : "var(--sb-muted)",
                }}>
                  <item.icon size={17} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span style={{
                  flex: 1, fontSize: ".86rem",
                  color: active ? "var(--sb-fg)" : "var(--sb-muted)",
                  fontWeight: active ? 700 : 500,
                }}>{item.label}</span>
                {active && <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: item.color, flexShrink: 0,
                }} />}
              </Link>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Drawer footer */}
        <div className="mob-drawer-footer">
          {mounted && (
            <button className="mob-drawer-theme-btn" onClick={() => setTheme(isDark ? "light" : "dark")}>
              {isDark ? <><Sun size={15} /><span>Switch to Light</span></> : <><Moon size={15} /><span>Switch to Dark</span></>}
            </button>
          )}
          <form action="/api/auth/logout" method="post" style={{ width: "100%" }}>
            <button type="submit" className="mob-drawer-logout-btn">
              <LogOut size={15} /><span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MOBILE BOTTOM NAV  (< 1024px)
      ══════════════════════════════════════════════════ */}
      <nav className="mob-bottom-nav">
        {BOTTOM_NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`mob-bn-item ${active ? "mob-bn-active" : ""}`}
              style={{ "--ic": item.color } as React.CSSProperties}>
              {active && <span className="mob-bn-pill" style={{ background: `${item.color}18` }} />}
              <div className="mob-bn-icon" style={{
                color: active ? item.color : "var(--sb-muted)",
                transform: active ? "translateY(-1px) scale(1.15)" : "scale(1)",
              }}>
                <item.icon size={21} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className="mob-bn-label" style={{
                color: active ? item.color : "var(--sb-muted)",
                fontWeight: active ? 700 : 500,
                opacity: active ? 1 : 0.7,
              }}>{item.label}</span>
            </Link>
          );
        })}

        {/* More button — opens drawer */}
        <button className="mob-bn-item" onClick={() => setDrawerOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <div className="mob-bn-icon" style={{ color: "var(--sb-muted)" }}>
            <Menu size={21} strokeWidth={1.8} />
          </div>
          <span className="mob-bn-label" style={{ color: "var(--sb-muted)", fontWeight: 500, opacity: 0.7 }}>More</span>
        </button>
      </nav>

      {/* ══════════════════════════════════════════════════
          STYLES
      ══════════════════════════════════════════════════ */}
      <style>{`
        /* ── Sidebar CSS vars ── */
        :root {
          --sb-bg:         #ffffff;
          --sb-border:     rgba(0,0,0,0.07);
          --sb-fg:         #0f1710;
          --sb-muted:      #7a8a80;
          --sb-hover:      rgba(0,0,0,0.04);
          --sb-section:    #a0ada5;
          --sb-logo-bg:    #16614f;
          --sb-footer-bg:  rgba(0,0,0,0.025);
          --sb-shadow:     4px 0 24px rgba(0,0,0,0.06);
        }
        .dark {
          --sb-bg:         #0f1410;
          --sb-border:     rgba(255,255,255,0.07);
          --sb-fg:         #edf2ef;
          --sb-muted:      #5a6e62;
          --sb-hover:      rgba(255,255,255,0.05);
          --sb-section:    #3a4e42;
          --sb-logo-bg:    #16614f;
          --sb-footer-bg:  rgba(255,255,255,0.03);
          --sb-shadow:     4px 0 32px rgba(0,0,0,0.5);
        }

        /* ────────────────────────────────────
           DESKTOP SIDEBAR
        ──────────────────────────────────── */
        .sb-root {
          position: fixed; inset-y: 0; left: 0;
          width: 260px;
          background: var(--sb-bg);
          border-right: 1px solid var(--sb-border);
          box-shadow: var(--sb-shadow);
          display: flex; flex-direction: column;
          z-index: 40;
          overflow-y: auto; scrollbar-width: none;
        }
        .sb-root::-webkit-scrollbar { display: none; }
        @media (max-width: 1023px) { .sb-root { display: none; } }

        /* Logo */
        .sb-logo {
          display: flex; align-items: center; gap: 11px;
          padding: 20px 16px 14px;
          text-decoration: none;
          border-bottom: 1px solid var(--sb-border);
          margin-bottom: 8px;
          transition: opacity .15s;
        }
        .sb-logo:hover { opacity: .85; }
        .sb-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--sb-logo-bg); color: #fff;
          display: grid; place-items: center; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(22,97,79,.35);
        }
        .sb-logo-text { display: flex; flex-direction: column; gap: 1px; }
        .sb-logo-name { font-size: .92rem; font-weight: 800; color: var(--sb-fg); line-height: 1.1; }
        .sb-logo-ai   { color: #16614f; }
        .sb-logo-sub  { font-size: .62rem; color: var(--sb-muted); font-weight: 500; }

        .sb-section-label {
          font-size: .6rem; font-weight: 800; letter-spacing: .1em;
          color: var(--sb-section); padding: 0 18px 6px;
        }

        /* Nav */
        .sb-nav { display: flex; flex-direction: column; gap: 1px; padding: 0 8px; }
        .sb-item {
          position: relative; display: flex; align-items: center; gap: 9px;
          padding: 6px 9px; border-radius: 12px; text-decoration: none;
          transition: background .15s, transform .1s; overflow: hidden;
        }
        .sb-item:hover { background: var(--sb-hover); }
        .sb-item-active { background: linear-gradient(90deg,rgba(22,97,79,.12),rgba(22,97,79,.04)) !important; }
        .sb-item:active { transform: scale(.97); }
        .sb-active-bar {
          position: absolute; left: 0; top: 18%; bottom: 18%;
          width: 3px; border-radius: 0 3px 3px 0;
        }
        .sb-item-icon {
          width: 30px; height: 30px; border-radius: 8px;
          display: grid; place-items: center; flex-shrink: 0;
          transition: background .15s, color .15s;
        }
        .sb-item-icon-avatar {
          background: transparent !important; padding: 0;
          overflow: hidden; border-radius: 50% !important;
        }
        .sb-item-label { flex: 1; font-size: .81rem; white-space: nowrap; transition: color .15s; }

        /* Theme + footer */
        .sb-theme-btn {
          display: flex; align-items: center; gap: 7px;
          margin: 4px 8px 5px; padding: 8px 11px;
          border-radius: 10px; border: 1px solid var(--sb-border);
          background: var(--sb-hover); color: var(--sb-muted);
          font-size: .76rem; font-weight: 600; cursor: pointer;
          width: calc(100% - 16px);
        }
        .sb-theme-btn:hover {
          background: rgba(22,97,79,.1); color: #16614f;
          border-color: rgba(22,97,79,.2);
        }
        .sb-footer {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 8px; border-top: 1px solid var(--sb-border);
          background: var(--sb-footer-bg);
        }
        .sb-profile {
          display: flex; align-items: center; gap: 8px; flex: 1;
          text-decoration: none; border-radius: 10px; padding: 5px 7px;
          transition: background .15s; min-width: 0;
        }
        .sb-profile:hover { background: var(--sb-hover); }
        .sb-profile-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .sb-profile-name {
          font-size: .78rem; font-weight: 700; color: var(--sb-fg);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-profile-role { font-size: .63rem; color: #16614f; font-weight: 600; }
        .sb-logout-btn {
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid var(--sb-border); background: transparent;
          color: var(--sb-muted); display: grid; place-items: center;
          cursor: pointer; flex-shrink: 0;
        }
        .sb-logout-btn:hover {
          background: rgba(239,68,68,.1); color: #ef4444;
          border-color: rgba(239,68,68,.2);
        }

        /* ────────────────────────────────────
           MOBILE TOP HEADER
        ──────────────────────────────────── */
        .mob-header {
          display: none;
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          padding-top: var(--safe-top);
        }
        @media (max-width: 1023px) { .mob-header { display: block; } }

        .mob-header-inner {
          display: flex; align-items: center; gap: 10px;
          height: 56px; padding: 0 14px;
          background: var(--sb-bg);
          border-bottom: 1px solid var(--sb-border);
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .dark .mob-header-inner { box-shadow: 0 2px 16px rgba(0,0,0,0.4); }

        .mob-hamburger {
          width: 38px; height: 38px; border-radius: 11px;
          border: 1px solid var(--sb-border); background: var(--sb-hover);
          display: grid; place-items: center; cursor: pointer;
          color: var(--sb-fg); flex-shrink: 0;
          box-shadow: 2px 2px 6px var(--neu-shadow-dark), -2px -2px 6px var(--neu-shadow-light);
        }
        .mob-hamburger:hover { background: rgba(22,97,79,.1); color: #16614f; }
        .mob-hamburger:active { transform: scale(.93); }

        .mob-logo {
          display: flex; align-items: center; gap: 8px;
          text-decoration: none; flex: 1; min-width: 0;
        }
        .mob-logo-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: #16614f; color: #fff;
          display: grid; place-items: center; flex-shrink: 0;
          box-shadow: 0 3px 8px rgba(22,97,79,.4);
        }
        .mob-logo-text {
          font-size: .9rem; font-weight: 800; color: var(--sb-fg); white-space: nowrap;
        }
        .mob-header-right { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
        .mob-icon-btn {
          width: 34px; height: 34px; border-radius: 9px;
          border: 1px solid var(--sb-border); background: var(--sb-hover);
          display: grid; place-items: center; cursor: pointer; color: var(--sb-muted);
        }
        .mob-icon-btn:hover { background: rgba(22,97,79,.1); color: #16614f; }
        .mob-icon-btn:active { transform: scale(.9); }
        .mob-avatar-btn {
          display: block; border-radius: 50%; text-decoration: none;
          transition: transform .15s, box-shadow .15s;
        }
        .mob-avatar-btn:hover { transform: scale(1.06); }
        .mob-avatar-btn:active { transform: scale(.94); }

        /* ────────────────────────────────────
           MOBILE DRAWER
        ──────────────────────────────────── */
        .mob-backdrop {
          display: none; position: fixed; inset: 0; z-index: 55;
          background: rgba(0,0,0,.45); backdrop-filter: blur(3px);
          animation: fadeIn .2s ease both;
        }
        @media (max-width: 1023px) { .mob-backdrop { display: block; } }

        .mob-drawer {
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 60;
          width: min(82vw, 300px);
          background: var(--sb-bg);
          border-right: 1px solid var(--sb-border);
          box-shadow: 6px 0 32px rgba(0,0,0,.18);
          display: flex; flex-direction: column;
          transform: translateX(-100%);
          transition: transform .28s cubic-bezier(.32,1,.64,1);
          overflow-y: auto; scrollbar-width: none;
          padding-top: var(--safe-top);
          padding-bottom: var(--safe-bottom);
        }
        .mob-drawer::-webkit-scrollbar { display: none; }
        .mob-drawer-open { transform: translateX(0) !important; }
        @media (min-width: 1024px) { .mob-drawer { display: none; } }

        .mob-drawer-hd {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 14px 12px;
          border-bottom: 1px solid var(--sb-border);
        }
        .mob-drawer-logo { display: flex; align-items: center; gap: 10px; }
        .mob-close-btn {
          width: 34px; height: 34px; border-radius: 9px;
          border: 1px solid var(--sb-border); background: var(--sb-hover);
          display: grid; place-items: center; cursor: pointer; color: var(--sb-muted);
        }
        .mob-close-btn:hover { background: rgba(239,68,68,.1); color: #ef4444; }
        .mob-close-btn:active { transform: scale(.9); }

        .mob-drawer-user {
          display: flex; align-items: center; gap: 11px;
          margin: 12px 12px 4px;
          padding: 12px 14px;
          border-radius: 14px;
          background: linear-gradient(135deg,rgba(22,97,79,.08),rgba(22,97,79,.03));
          border: 1px solid rgba(22,97,79,.12);
        }

        .mob-drawer-nav {
          display: flex; flex-direction: column; gap: 2px;
          padding: 4px 10px 8px;
        }
        .mob-drawer-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 12px; text-decoration: none;
          transition: background .15s, transform .1s;
        }
        .mob-drawer-item:hover   { background: var(--sb-hover); }
        .mob-drawer-item:active  { transform: scale(.97); }
        .mob-drawer-item-active  { background: linear-gradient(90deg,rgba(22,97,79,.12),rgba(22,97,79,.04)) !important; }
        .mob-drawer-icon {
          width: 34px; height: 34px; border-radius: 10px;
          display: grid; place-items: center; flex-shrink: 0;
          transition: background .15s, color .15s;
        }

        .mob-drawer-footer {
          display: flex; flex-direction: column; gap: 7px;
          padding: 10px 12px;
          border-top: 1px solid var(--sb-border);
          background: var(--sb-footer-bg);
        }
        .mob-drawer-theme-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 11px;
          border: 1px solid var(--sb-border); background: var(--sb-hover);
          color: var(--sb-muted); font-size: .82rem; font-weight: 600;
          cursor: pointer; width: 100%;
        }
        .mob-drawer-theme-btn:hover { background: rgba(22,97,79,.1); color: #16614f; border-color: rgba(22,97,79,.2); }
        .mob-drawer-logout-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 11px;
          border: 1px solid rgba(239,68,68,.2); background: rgba(239,68,68,.06);
          color: #ef4444; font-size: .82rem; font-weight: 700;
          cursor: pointer; width: 100%;
        }
        .mob-drawer-logout-btn:hover { background: rgba(239,68,68,.12); }
        .mob-drawer-logout-btn:active { transform: scale(.97); }

        /* ────────────────────────────────────
           MOBILE BOTTOM NAV
        ──────────────────────────────────── */
        .mob-bottom-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
          background: var(--sb-bg);
          border-top: 1px solid var(--sb-border);
          box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
          padding-bottom: var(--safe-bottom);
          height: calc(var(--bottom-nav-h) + var(--safe-bottom));
          display: none;
          align-items: stretch;
        }
        @media (max-width: 1023px) {
          .mob-bottom-nav { display: flex; }
        }
        .dark .mob-bottom-nav { box-shadow: 0 -4px 24px rgba(0,0,0,.5); }

        .mob-bn-item {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 3px;
          text-decoration: none; position: relative;
          padding: 6px 4px 2px; min-width: 0;
          transition: transform .15s;
          -webkit-tap-highlight-color: transparent;
        }
        .mob-bn-item:active { transform: scale(.88); }

        .mob-bn-pill {
          position: absolute; top: 4px; left: 50%;
          transform: translateX(-50%);
          width: 36px; height: 32px; border-radius: 10px;
          transition: background .2s;
        }

        .mob-bn-icon {
          position: relative; z-index: 1;
          transition: color .2s, transform .2s;
          line-height: 1;
        }

        .mob-bn-label {
          position: relative; z-index: 1;
          font-size: .6rem; letter-spacing: .01em;
          transition: color .2s, opacity .2s, font-weight .1s;
          white-space: nowrap;
        }

        /* ── Animations ── */
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
