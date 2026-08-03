"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";

interface ProfileData {
    name?: string;
    avatarUrl?: string;
    email?: string;
}

export function TopBar() {
    const [profile, setProfile] = useState<ProfileData>({});
    const [open, setOpen] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch("/api/profile")
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d) setProfile({ name: d.name, avatarUrl: d.avatarUrl, email: d.email });
            })
            .catch(() => { });
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const displayName = profile.name ?? "User";
    const initials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div className="tb-topbar">
            <div ref={dropRef} className="tb-profile-wrap">
                {/* Avatar + name trigger */}
                <button
                    className="tb-profile-btn"
                    onClick={() => setOpen(v => !v)}
                    aria-label="Profile menu"
                    aria-expanded={open}
                >
                    {/* Avatar */}
                    <div className="tb-avatar">
                        {profile.avatarUrl ? (
                            <Image
                                src={profile.avatarUrl}
                                alt={displayName}
                                width={36}
                                height={36}
                                className="tb-avatar-img"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <span className="tb-avatar-initials">{initials || "U"}</span>
                        )}
                    </div>

                    {/* Name + subtitle */}
                    <div className="tb-profile-info">
                        <span className="tb-profile-name">{displayName}</span>
                        <span className="tb-profile-sub">Stay Focused!</span>
                    </div>

                    <ChevronDown
                        size={14}
                        className="tb-chevron"
                        style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                </button>

                {/* Dropdown menu */}
                {open && (
                    <div className="tb-dropdown" role="menu">
                        {/* User info header */}
                        <div className="tb-drop-header">
                            <div className="tb-drop-avatar">
                                {profile.avatarUrl ? (
                                    <Image
                                        src={profile.avatarUrl}
                                        alt={displayName}
                                        width={44}
                                        height={44}
                                        style={{ borderRadius: "50%", objectFit: "cover", width: "100%", height: "100%" }}
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--primary)" }}>{initials || "U"}</span>
                                )}
                            </div>
                            <div>
                                <p className="tb-drop-name">{displayName}</p>
                                {profile.email && <p className="tb-drop-email">{profile.email}</p>}
                            </div>
                        </div>

                        <div className="tb-drop-divider" />

                        <Link href="/profile" className="tb-drop-item" onClick={() => setOpen(false)} role="menuitem">
                            <User size={14} /> View Profile
                        </Link>
                        <Link href="/profile" className="tb-drop-item" onClick={() => setOpen(false)} role="menuitem">
                            <Settings size={14} /> Settings
                        </Link>

                        <div className="tb-drop-divider" />

                        <form action="/api/auth/logout" method="post">
                            <button type="submit" className="tb-drop-item tb-drop-logout" role="menuitem">
                                <LogOut size={14} /> Sign Out
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <style>{`
        .tb-topbar {
          position: fixed;
          top: 0;
          right: 0;
          z-index: 50;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .tb-profile-wrap { position: relative; }

        .tb-profile-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.4rem 0.75rem 0.4rem 0.4rem;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--card);
          cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .tb-profile-btn:hover {
          background: var(--muted);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }

        .tb-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(22,97,79,0.15);
          border: 2px solid var(--primary);
          display: grid;
          place-items: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .tb-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
        .tb-avatar-initials {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--primary);
        }

        .tb-profile-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1px;
        }
        .tb-profile-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--foreground);
          white-space: nowrap;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tb-profile-sub {
          font-size: 0.68rem;
          color: var(--primary);
          font-weight: 600;
        }

        .tb-chevron {
          color: var(--muted-foreground);
          transition: transform 0.2s;
          flex-shrink: 0;
        }

        /* Dropdown */
        .tb-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 220px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.18);
          overflow: hidden;
          animation: tbDropIn 0.18s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes tbDropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .tb-drop-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
        }
        .tb-drop-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(22,97,79,0.12);
          border: 2px solid var(--primary);
          display: grid;
          place-items: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .tb-drop-name {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--foreground);
          margin: 0;
        }
        .tb-drop-email {
          font-size: 0.72rem;
          color: var(--muted-foreground);
          margin: 2px 0 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 150px;
        }

        .tb-drop-divider {
          height: 1px;
          background: var(--border);
          margin: 0;
        }

        .tb-drop-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.6rem 1rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--foreground);
          background: transparent;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.12s;
          text-align: left;
        }
        .tb-drop-item:hover {
          background: var(--muted);
          color: var(--foreground);
        }
        .tb-drop-logout {
          color: #ef4444;
        }
        .tb-drop-logout:hover {
          background: rgba(239,68,68,0.08);
        }

        /* Hide on mobile where sidebar is collapsed */
        @media (max-width: 1023px) {
          .tb-profile-info { display: none; }
          .tb-chevron { display: none; }
        }
      `}</style>
        </div>
    );
}
