"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import {
  User, Phone, Briefcase, BookOpen, Code2, Dumbbell,
  Save, Camera, CheckCircle2, Mail, MapPin, Globe, Edit3,
  Target, TrendingUp, Zap, Shield
} from "lucide-react";

const STAT_CARDS = [
  { icon: TrendingUp, label: "Study Hours", value: "3h", color: "#5ec4a8", bg: "rgba(94,196,168,0.12)" },
  { icon: Code2,      label: "Coding Hours", value: "4h", color: "#f18b67", bg: "rgba(241,139,103,0.12)" },
  { icon: Dumbbell,   label: "Gym Time",     value: "60m", color: "#74d2bb", bg: "rgba(116,210,187,0.12)" },
  { icon: Zap,        label: "Focus Score",  value: "87%", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
];

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"personal" | "targets" | "security">("personal");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Manage your personal info, targets, and account settings."
      />

      <div className="profile-root">
        {/* ── Avatar & quick-stats column ── */}
        <aside className="profile-aside">
          {/* Avatar card */}
          <div className="avatar-card">
            <div className="avatar-ring">
              <div className="avatar-circle">
                <User size={44} strokeWidth={1.5} />
              </div>
              <button id="profile-avatar-btn" type="button" className="avatar-cam" aria-label="Change avatar">
                <Camera size={14} />
              </button>
            </div>
            <div className="avatar-info">
              <p className="avatar-name">DevTrack User</p>
              <p className="avatar-role">Student Developer</p>
              <span className="avatar-badge">
                <Shield size={11} />
                Active Member
              </span>
            </div>

            <div className="avatar-meta">
              <div className="avatar-meta-item">
                <Mail size={14} />
                <span>user@devtrack.ai</span>
              </div>
              <div className="avatar-meta-item">
                <Phone size={14} />
                <span>+91 9999999999</span>
              </div>
              <div className="avatar-meta-item">
                <MapPin size={14} />
                <span>India</span>
              </div>
              <div className="avatar-meta-item">
                <Globe size={14} />
                <span>devtrack.ai/@user</span>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="stat-grid">
            {STAT_CARDS.map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className="stat-card" style={{ "--stat-color": color, "--stat-bg": bg } as React.CSSProperties}>
                <div className="stat-icon-wrap">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="stat-value">{value}</p>
                  <p className="stat-label">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Form column ── */}
        <main className="profile-main">
          {/* Tabs */}
          <div className="profile-tabs" role="tablist">
            {(["personal", "targets", "security"] as const).map((tab) => (
              <button
                key={tab}
                id={`profile-tab-${tab}`}
                role="tab"
                type="button"
                aria-selected={activeTab === tab}
                className={`profile-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "personal" && <User size={14} />}
                {tab === "targets"  && <Target size={14} />}
                {tab === "security" && <Shield size={14} />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSave} className="profile-form">
            {/* ─ Personal tab ─ */}
            {activeTab === "personal" && (
              <div className="form-section">
                <div className="section-header">
                  <Edit3 size={16} />
                  <h2 className="section-title">Personal Information</h2>
                </div>
                <div className="form-grid">
                  <FieldGroup id="pf-name" label="Full Name" icon={User} focusedField={focusedField} setFocused={setFocusedField}>
                    <input id="pf-name" name="name" defaultValue="DevTrack User" className="pf-input" onFocus={() => setFocusedField("pf-name")} onBlur={() => setFocusedField(null)} />
                  </FieldGroup>

                  <FieldGroup id="pf-email" label="Email Address" icon={Mail} focusedField={focusedField} setFocused={setFocusedField}>
                    <input id="pf-email" name="email" type="email" defaultValue="user@devtrack.ai" className="pf-input" onFocus={() => setFocusedField("pf-email")} onBlur={() => setFocusedField(null)} />
                  </FieldGroup>

                  <FieldGroup id="pf-mobile" label="Mobile Number" icon={Phone} focusedField={focusedField} setFocused={setFocusedField}>
                    <input id="pf-mobile" name="mobileNumber" defaultValue="+91 9999999999" className="pf-input" onFocus={() => setFocusedField("pf-mobile")} onBlur={() => setFocusedField(null)} />
                  </FieldGroup>

                  <FieldGroup id="pf-location" label="Location" icon={MapPin} focusedField={focusedField} setFocused={setFocusedField}>
                    <input id="pf-location" name="location" defaultValue="India" className="pf-input" onFocus={() => setFocusedField("pf-location")} onBlur={() => setFocusedField(null)} />
                  </FieldGroup>

                  <FieldGroup id="pf-profession" label="Profession" icon={Briefcase} focusedField={focusedField} setFocused={setFocusedField} span={2}>
                    <input id="pf-profession" name="profession" defaultValue="Student Developer" className="pf-input" onFocus={() => setFocusedField("pf-profession")} onBlur={() => setFocusedField(null)} />
                  </FieldGroup>

                  <FieldGroup id="pf-bio" label="Bio" icon={Edit3} focusedField={focusedField} setFocused={setFocusedField} span={2}>
                    <textarea id="pf-bio" name="bio" className="pf-input pf-textarea" defaultValue="Building habits & mastering code one day at a time." onFocus={() => setFocusedField("pf-bio")} onBlur={() => setFocusedField(null)} />
                  </FieldGroup>
                </div>
              </div>
            )}

            {/* ─ Targets tab ─ */}
            {activeTab === "targets" && (
              <div className="form-section">
                <div className="section-header">
                  <Target size={16} />
                  <h2 className="section-title">Daily Targets</h2>
                </div>
                <p className="section-desc">Set your daily goals for study, coding, and fitness. These power your analytics.</p>
                <div className="form-grid">
                  <TargetCard id="pf-study" label="Daily Study Hours" icon={BookOpen} color="#5ec4a8" defaultValue={3} unit="hrs" focusedField={focusedField} setFocused={setFocusedField} />
                  <TargetCard id="pf-coding" label="Daily Coding Hours" icon={Code2} color="#f18b67" defaultValue={4} unit="hrs" focusedField={focusedField} setFocused={setFocusedField} />
                  <TargetCard id="pf-gym" label="Daily Gym Time" icon={Dumbbell} color="#74d2bb" defaultValue={60} unit="min" focusedField={focusedField} setFocused={setFocusedField} />
                  <TargetCard id="pf-focus" label="Focus Sessions" icon={Zap} color="#a78bfa" defaultValue={4} unit="sessions" focusedField={focusedField} setFocused={setFocusedField} />
                </div>
              </div>
            )}

            {/* ─ Security tab ─ */}
            {activeTab === "security" && (
              <div className="form-section">
                <div className="section-header">
                  <Shield size={16} />
                  <h2 className="section-title">Security Settings</h2>
                </div>
                <div className="form-grid">
                  <FieldGroup id="pf-cur-pass" label="Current Password" icon={Shield} focusedField={focusedField} setFocused={setFocusedField} span={2}>
                    <input id="pf-cur-pass" name="currentPassword" type="password" placeholder="••••••••" className="pf-input" onFocus={() => setFocusedField("pf-cur-pass")} onBlur={() => setFocusedField(null)} />
                  </FieldGroup>

                  <FieldGroup id="pf-new-pass" label="New Password" icon={Shield} focusedField={focusedField} setFocused={setFocusedField}>
                    <input id="pf-new-pass" name="newPassword" type="password" placeholder="Min 8 characters" className="pf-input" onFocus={() => setFocusedField("pf-new-pass")} onBlur={() => setFocusedField(null)} />
                  </FieldGroup>

                  <FieldGroup id="pf-conf-pass" label="Confirm Password" icon={Shield} focusedField={focusedField} setFocused={setFocusedField}>
                    <input id="pf-conf-pass" name="confirmPassword" type="password" placeholder="Repeat new password" className="pf-input" onFocus={() => setFocusedField("pf-conf-pass")} onBlur={() => setFocusedField(null)} />
                  </FieldGroup>
                </div>

                <div className="danger-zone">
                  <h3 className="danger-title">Danger Zone</h3>
                  <p className="danger-desc">Permanently delete your account and all associated data. This action cannot be undone.</p>
                  <button id="profile-delete-btn" type="button" className="danger-btn">Delete Account</button>
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="form-footer">
              <button id="profile-save-btn" type="submit" className={`save-btn ${saved ? "saved" : ""}`}>
                {saved ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              <p className="save-hint">Changes are saved securely and will reflect instantly.</p>
            </div>
          </form>
        </main>
      </div>

      <style>{`
        /* ── Layout ── */
        .profile-root {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        /* ── Aside ── */
        .profile-aside {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex: 0 0 260px;
          min-width: 0;
        }

        /* ── Avatar card ── */
        .avatar-card {
          border-radius: 20px;
          background: var(--card);
          border: 1px solid var(--border);
          padding: 1.75rem 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          transition: box-shadow 0.3s;
        }
        .avatar-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.12); }

        .avatar-ring {
          position: relative;
          width: 96px; height: 96px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #5ec4a8, #16614f, #5ec4a8);
          padding: 3px;
          animation: spinRing 8s linear infinite;
        }
        @keyframes spinRing { to { transform: rotate(360deg); } }

        .avatar-circle {
          width: 100%; height: 100%;
          border-radius: 50%;
          background: var(--muted);
          display: grid;
          place-items: center;
          color: var(--muted-foreground);
        }

        .avatar-cam {
          position: absolute;
          bottom: 2px; right: 2px;
          width: 28px; height: 28px;
          border-radius: 50%;
          background: #5ec4a8;
          color: #07110e;
          border: 2px solid var(--card);
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .avatar-cam:hover { transform: scale(1.15); }

        .avatar-info {
          text-align: center;
        }
        .avatar-name { font-size: 1rem; font-weight: 700; color: var(--foreground); margin: 0; }
        .avatar-role { font-size: 0.78rem; color: var(--muted-foreground); margin-top: 0.2rem; }
        .avatar-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          margin-top: 0.5rem;
          padding: 0.25rem 0.65rem;
          border-radius: 999px;
          background: rgba(94,196,168,0.12);
          color: #5ec4a8;
          font-size: 0.72rem;
          font-weight: 600;
          border: 1px solid rgba(94,196,168,0.25);
        }

        .avatar-meta {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }
        .avatar-meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          color: var(--muted-foreground);
        }
        .avatar-meta-item svg { color: #5ec4a8; flex-shrink: 0; }

        /* ── Stat grid ── */
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .stat-card {
          border-radius: 14px;
          padding: 0.9rem;
          background: var(--stat-bg);
          border: 1px solid color-mix(in srgb, var(--stat-color) 25%, transparent);
          display: flex;
          align-items: center;
          gap: 0.65rem;
          transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-icon-wrap {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: color-mix(in srgb, var(--stat-color) 18%, transparent);
          display: grid;
          place-items: center;
          color: var(--stat-color);
          flex-shrink: 0;
        }
        .stat-value { font-size: 1rem; font-weight: 800; color: var(--foreground); margin: 0; line-height: 1; }
        .stat-label { font-size: 0.7rem; color: var(--muted-foreground); margin-top: 0.2rem; }

        /* ── Main form ── */
        .profile-main { flex: 1; min-width: 0; }

        /* ── Tabs ── */
        .profile-tabs {
          display: flex;
          gap: 0.4rem;
          background: var(--muted);
          border-radius: 14px;
          padding: 0.35rem;
          margin-bottom: 1.25rem;
        }
        .profile-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          height: 2.25rem;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--muted-foreground);
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
          text-transform: capitalize;
        }
        .profile-tab.active {
          background: var(--card);
          color: var(--foreground);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          font-weight: 600;
        }
        .profile-tab:hover:not(.active) { color: var(--foreground); }

        /* ── Form card ── */
        .profile-form {
          border-radius: 20px;
          background: var(--card);
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }

        .form-section { padding: 1.75rem; }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          color: var(--primary);
        }
        .section-title { font-size: 1rem; font-weight: 700; color: var(--foreground); margin: 0; }
        .section-desc { font-size: 0.82rem; color: var(--muted-foreground); margin: -1rem 0 1.5rem; line-height: 1.7; }

        /* ── Form grid ── */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }

        /* ── Field group ── */
        .field-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .field-group.span-2 { grid-column: span 2; }
        @media (max-width: 600px) { .field-group.span-2 { grid-column: span 1; } }

        .field-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .field-label svg { color: var(--primary); }

        .field-wrap {
          border-radius: 12px;
          border: 1.5px solid var(--border);
          background: var(--background);
          transition: border-color 0.25s, box-shadow 0.25s;
          overflow: hidden;
        }
        .field-wrap.focused {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent);
        }
        .pf-input {
          width: 100%;
          height: 2.75rem;
          background: transparent;
          border: none;
          outline: none;
          padding: 0 0.85rem;
          font-size: 0.88rem;
          color: var(--foreground);
          caret-color: var(--primary);
        }
        .pf-input::placeholder { color: var(--muted-foreground); }
        .pf-textarea {
          height: auto;
          min-height: 80px;
          padding: 0.65rem 0.85rem;
          resize: vertical;
          line-height: 1.6;
        }

        /* ── Target card ── */
        .target-card {
          border-radius: 16px;
          padding: 1rem;
          border: 1.5px solid var(--border);
          background: var(--background);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .target-card.focused {
          border-color: var(--tc-color);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--tc-color) 15%, transparent);
        }
        .target-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .target-icon-wrap {
          width: 32px; height: 32px;
          border-radius: 9px;
          display: grid;
          place-items: center;
          background: color-mix(in srgb, var(--tc-color) 15%, transparent);
          color: var(--tc-color);
          flex-shrink: 0;
        }
        .target-label { font-size: 0.8rem; font-weight: 600; color: var(--foreground); }
        .target-input-row { display: flex; align-items: center; gap: 0.5rem; }
        .target-input {
          flex: 1;
          height: 2.25rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--card);
          outline: none;
          padding: 0 0.6rem;
          font-size: 1rem;
          font-weight: 700;
          color: var(--foreground);
          caret-color: var(--primary);
        }
        .target-unit {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--muted-foreground);
          white-space: nowrap;
        }

        /* ── Danger zone ── */
        .danger-zone {
          margin-top: 2rem;
          padding: 1.25rem;
          border-radius: 14px;
          border: 1.5px solid rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.04);
        }
        .danger-title { font-size: 0.88rem; font-weight: 700; color: #ef4444; margin: 0 0 0.4rem; }
        .danger-desc { font-size: 0.8rem; color: var(--muted-foreground); margin: 0 0 1rem; line-height: 1.6; }
        .danger-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          border: 1.5px solid #ef4444;
          background: transparent;
          color: #ef4444;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .danger-btn:hover { background: #ef4444; color: #fff; }

        /* ── Footer ── */
        .form-footer {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.75rem;
          background: var(--muted);
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .save-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          height: 2.75rem;
          padding: 0 1.5rem;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, #5ec4a8) 100%);
          color: var(--primary-foreground);
          font-size: 0.9rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background 0.4s;
          box-shadow: 0 4px 16px rgba(22,97,79,0.35);
          letter-spacing: 0.02em;
        }
        .save-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(22,97,79,0.45); }
        .save-btn:active { transform: translateY(0); }
        .save-btn.saved { background: linear-gradient(135deg, #16a34a, #4ade80); }
        .save-hint { font-size: 0.75rem; color: var(--muted-foreground); }
      `}</style>
    </>
  );
}

/* ── Sub-components ── */
function FieldGroup({
  id, label, icon: Icon, focusedField, setFocused, span, children,
}: {
  id: string; label: string; icon: React.ElementType;
  focusedField: string | null; setFocused: (v: string | null) => void;
  span?: number; children: React.ReactNode;
}) {
  return (
    <div className={`field-group${span ? ` span-${span}` : ""}`}>
      <label htmlFor={id} className="field-label">
        <Icon size={13} />
        {label}
      </label>
      <div className={`field-wrap ${focusedField === id ? "focused" : ""}`}>
        {children}
      </div>
    </div>
  );
}

function TargetCard({
  id, label, icon: Icon, color, defaultValue, unit, focusedField, setFocused,
}: {
  id: string; label: string; icon: React.ElementType; color: string;
  defaultValue: number; unit: string;
  focusedField: string | null; setFocused: (v: string | null) => void;
}) {
  return (
    <div
      className={`target-card ${focusedField === id ? "focused" : ""}`}
      style={{ "--tc-color": color } as React.CSSProperties}
    >
      <div className="target-header">
        <div className="target-icon-wrap"><Icon size={16} /></div>
        <span className="target-label">{label}</span>
      </div>
      <div className="target-input-row">
        <input
          id={id}
          name={id}
          type="number"
          min={0}
          defaultValue={defaultValue}
          className="target-input"
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused(null)}
        />
        <span className="target-unit">/ day ({unit})</span>
      </div>
    </div>
  );
}
