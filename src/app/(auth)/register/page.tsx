"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Phone, Lock, User, ArrowRight, Dumbbell, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <main className="login-root">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="particle" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      <div className="login-wrapper">
        {/* Left brand panel */}
        <div className="login-brand">
          <div className="brand-logo">
            <Dumbbell size={32} />
          </div>
          <h2 className="brand-name">DevTrack AI</h2>
          <p className="brand-tagline">Start your discipline journey today</p>

          <ul className="brand-features">
            {[
              "Build powerful daily habits",
              "AI insights & smart coaching",
              "Track study, code & gym time",
              "Unlock your full potential",
            ].map((f) => (
              <li key={f} className="brand-feature-item">
                <span className="feature-dot">
                  <Sparkles size={12} />
                </span>
                {f}
              </li>
            ))}
          </ul>

          <div className="brand-glow" />
        </div>

        {/* Right form */}
        <div className="login-card">
          <div className="login-card-inner">
            <div className="login-header">
              <h1 className="login-title">Create account ✨</h1>
              <p className="login-subtitle">Join thousands building their best self</p>
            </div>

            <form action="/api/auth/register" method="post" className="login-form">
              <div className={`input-group ${focusedField === "name" ? "focused" : ""}`}>
                <span className="input-icon"><User size={17} /></span>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  required
                  className="fancy-input"
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                />
                <div className="input-border-animated" />
              </div>

              <div className={`input-group ${focusedField === "mobile" ? "focused" : ""}`}>
                <span className="input-icon"><Phone size={17} /></span>
                <input
                  id="register-mobile"
                  name="mobileNumber"
                  type="tel"
                  placeholder="Mobile Number"
                  required
                  className="fancy-input"
                  onFocus={() => setFocusedField("mobile")}
                  onBlur={() => setFocusedField(null)}
                />
                <div className="input-border-animated" />
              </div>

              <div className={`input-group ${focusedField === "password" ? "focused" : ""}`}>
                <span className="input-icon"><Lock size={17} /></span>
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (min 8 characters)"
                  minLength={8}
                  required
                  className="fancy-input"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <div className="input-border-animated" />
              </div>

              <p className="terms-text">
                By creating an account, you agree to our{" "}
                <Link href="#" className="terms-link">Terms of Service</Link> and{" "}
                <Link href="#" className="terms-link">Privacy Policy</Link>.
              </p>

              <button id="register-submit-btn" type="submit" className="submit-btn">
                <span>Create Account</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="register-link-text">
              Already have an account?{" "}
              <Link href="/login" className="register-link">Sign in →</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .login-root {
          position: relative; min-height: 100vh; display: flex; align-items: center;
          justify-content: center; background: #07110e; overflow: hidden; padding: 1rem;
        }
        .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.35; animation: floatBlob 12s ease-in-out infinite alternate; pointer-events: none; }
        .blob-1 { width: 500px; height: 500px; background: #16614f; top: -150px; left: -150px; animation-duration: 14s; }
        .blob-2 { width: 400px; height: 400px; background: #d9603d; bottom: -120px; right: -120px; animation-duration: 10s; animation-delay: -4s; }
        .blob-3 { width: 300px; height: 300px; background: #5ec4a8; top: 50%; left: 50%; transform: translate(-50%,-50%); animation-duration: 16s; animation-delay: -8s; }
        @keyframes floatBlob { from { transform: scale(1) translate(0,0); } to { transform: scale(1.15) translate(30px,-30px); } }
        .particles { position: absolute; inset: 0; pointer-events: none; }
        .particle { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: #5ec4a8; opacity: 0; left: calc(var(--i)*5.2%); top: 110%; animation: riseParticle calc(6s + var(--i)*0.3s) linear infinite; animation-delay: calc(var(--i)*0.4s); }
        @keyframes riseParticle { 0% { opacity:0; top:110%; } 10% { opacity:0.7; } 90% { opacity:0.3; } 100% { opacity:0; top:-10%; } }
        .login-wrapper { position: relative; z-index: 10; display: flex; width: 100%; max-width: 900px; min-height: 580px; border-radius: 24px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(94,196,168,0.15); animation: fadeUp 0.6s ease both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        .login-brand { position: relative; display: none; flex-direction: column; justify-content: center; padding: 3rem 2.5rem; background: linear-gradient(145deg,#0d1f1a 0%,#16614f 60%,#1a7a63 100%); flex: 0 0 340px; overflow: hidden; }
        @media (min-width: 720px) { .login-brand { display: flex; } }
        .brand-glow { position: absolute; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle,rgba(94,196,168,0.25) 0%,transparent 70%); bottom: -80px; right: -80px; pointer-events: none; }
        .brand-logo { width: 56px; height: 56px; border-radius: 16px; background: rgba(255,255,255,0.1); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); display: grid; place-items: center; color: #fff; margin-bottom: 1.25rem; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .brand-name { font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0; }
        .brand-tagline { font-size: 0.85rem; color: rgba(255,255,255,0.55); margin-top: 0.25rem; }
        .brand-features { list-style: none; margin: 2rem 0 0; padding: 0; display: flex; flex-direction: column; gap: 0.85rem; }
        .brand-feature-item { display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: rgba(255,255,255,0.75); }
        .feature-dot { flex-shrink: 0; width: 24px; height: 24px; border-radius: 8px; background: rgba(255,255,255,0.12); display: grid; place-items: center; color: #7ee8d0; }
        .login-card { flex: 1; background: rgba(16,24,20,0.92); backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 2.5rem 1.5rem; }
        .login-card-inner { width: 100%; max-width: 380px; }
        .login-header { margin-bottom: 2rem; }
        .login-title { font-size: 1.75rem; font-weight: 800; color: #f5f7f0; margin: 0; }
        .login-subtitle { font-size: 0.875rem; color: #6b8a7e; margin-top: 0.35rem; }
        .login-form { display: flex; flex-direction: column; gap: 1rem; }
        .input-group { position: relative; display: flex; align-items: center; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08); transition: border-color 0.25s, background 0.25s, box-shadow 0.25s; overflow: hidden; }
        .input-group.focused { border-color: #5ec4a8; background: rgba(94,196,168,0.06); box-shadow: 0 0 0 3px rgba(94,196,168,0.12); }
        .input-icon { padding: 0 0 0 0.9rem; color: #6b8a7e; flex-shrink: 0; display: flex; align-items: center; transition: color 0.2s; }
        .input-group.focused .input-icon { color: #5ec4a8; }
        .fancy-input { flex: 1; height: 3rem; background: transparent; border: none; outline: none; padding: 0 0.75rem; font-size: 0.9rem; color: #f5f7f0; caret-color: #5ec4a8; }
        .fancy-input::placeholder { color: #4a6660; }
        .eye-toggle { padding: 0 0.75rem; background: none; border: none; cursor: pointer; color: #6b8a7e; display: flex; align-items: center; transition: color 0.2s; height: 3rem; }
        .eye-toggle:hover { color: #5ec4a8; }
        .input-border-animated { position: absolute; bottom: 0; left: 0; height: 2px; width: 0; background: linear-gradient(90deg,#5ec4a8,#16614f); border-radius: 0 0 2px 2px; transition: width 0.35s ease; }
        .input-group.focused .input-border-animated { width: 100%; }
        .terms-text { font-size: 0.75rem; color: #4a6660; line-height: 1.6; margin-top: -0.25rem; }
        .terms-link { color: #5ec4a8; text-decoration: none; }
        .terms-link:hover { color: #7ee8d0; }
        .submit-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; height: 3rem; border-radius: 12px; background: linear-gradient(135deg,#16614f 0%,#5ec4a8 100%); color: #fff; font-size: 0.95rem; font-weight: 700; border: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 6px 24px rgba(22,97,79,0.45); margin-top: 0.25rem; letter-spacing: 0.02em; }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(22,97,79,0.55); }
        .submit-btn:active { transform: translateY(0); }
        .register-link-text { text-align: center; font-size: 0.82rem; color: #4a6660; margin-top: 1.5rem; }
        .register-link { color: #5ec4a8; font-weight: 600; text-decoration: none; }
        .register-link:hover { color: #7ee8d0; }
      `}</style>
    </main>
  );
}
