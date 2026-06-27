"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Phone, Lock, ArrowRight, Dumbbell, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <main className="login-root">
      {/* Animated background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Floating particles */}
      <div className="particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="particle" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      <div className="login-wrapper">
        {/* Left panel — branding */}
        <div className="login-brand">
          <div className="brand-logo">
            <Dumbbell size={32} />
          </div>
          <h2 className="brand-name">DevTrack AI</h2>
          <p className="brand-tagline">Your personal discipline OS</p>

          <ul className="brand-features">
            {[
              "Track daily habits & routines",
              "AI-powered productivity insights",
              "Deep focus timer & analytics",
              "Goals & milestone tracking",
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

        {/* Right panel — form */}
        <div className="login-card">
          <div className="login-card-inner">
            <div className="login-header">
              <h1 className="login-title">Welcome back 👋</h1>
              <p className="login-subtitle">Sign in to continue your streak</p>
            </div>

            <form action="/api/auth/login" method="post" className="login-form">
              {/* Mobile field */}
              <div className={`input-group ${focusedField === "mobile" ? "focused" : ""}`}>
                <span className="input-icon">
                  <Phone size={17} />
                </span>
                <input
                  id="login-mobile"
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

              {/* Password field */}
              <div className={`input-group ${focusedField === "password" ? "focused" : ""}`}>
                <span className="input-icon">
                  <Lock size={17} />
                </span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
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

              <div className="form-meta">
                <label className="remember-label">
                  <input type="checkbox" className="remember-check" />
                  <span className="remember-box" />
                  <span>Remember me</span>
                </label>
                <Link href="#" className="forgot-link">Forgot password?</Link>
              </div>

              <button id="login-submit-btn" type="submit" className="submit-btn">
                <span>Sign In</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="divider">
              <span />
              <span className="divider-text">or continue with</span>
              <span />
            </div>

            <div className="social-btns">
              <button id="login-google-btn" type="button" className="social-btn" aria-label="Sign in with Google">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button id="login-github-btn" type="button" className="social-btn" aria-label="Sign in with GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </button>
            </div>

            <p className="register-link-text">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="register-link">Create one free →</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .login-root {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #07110e;
          overflow: hidden;
          padding: 1rem;
        }

        /* ── Blobs ── */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          animation: floatBlob 12s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .blob-1 { width: 500px; height: 500px; background: #16614f; top: -150px; left: -150px; animation-duration: 14s; }
        .blob-2 { width: 400px; height: 400px; background: #d9603d; bottom: -120px; right: -120px; animation-duration: 10s; animation-delay: -4s; }
        .blob-3 { width: 300px; height: 300px; background: #5ec4a8; top: 50%; left: 50%; transform: translate(-50%, -50%); animation-duration: 16s; animation-delay: -8s; }

        @keyframes floatBlob {
          from { transform: scale(1) translate(0, 0); }
          to   { transform: scale(1.15) translate(30px, -30px); }
        }

        /* ── Particles ── */
        .particles { position: absolute; inset: 0; pointer-events: none; }
        .particle {
          position: absolute;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #5ec4a8;
          opacity: 0;
          left: calc(var(--i) * 5.2%);
          top: 110%;
          animation: riseParticle calc(6s + var(--i) * 0.3s) linear infinite;
          animation-delay: calc(var(--i) * 0.4s);
        }
        @keyframes riseParticle {
          0%   { opacity: 0; top: 110%; }
          10%  { opacity: 0.7; }
          90%  { opacity: 0.3; }
          100% { opacity: 0; top: -10%; }
        }

        /* ── Layout ── */
        .login-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          width: 100%;
          max-width: 900px;
          min-height: 580px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(94,196,168,0.15);
          animation: fadeUp 0.6s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Left brand panel ── */
        .login-brand {
          position: relative;
          display: none;
          flex-direction: column;
          justify-content: center;
          padding: 3rem 2.5rem;
          background: linear-gradient(145deg, #0d1f1a 0%, #16614f 60%, #1a7a63 100%);
          flex: 0 0 340px;
          overflow: hidden;
        }
        @media (min-width: 720px) { .login-brand { display: flex; } }

        .brand-glow {
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(94,196,168,0.25) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          pointer-events: none;
        }

        .brand-logo {
          width: 56px; height: 56px;
          border-radius: 16px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
          display: grid;
          place-items: center;
          color: #fff;
          margin-bottom: 1.25rem;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .brand-name { font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0; }
        .brand-tagline { font-size: 0.85rem; color: rgba(255,255,255,0.55); margin-top: 0.25rem; }

        .brand-features { list-style: none; margin: 2rem 0 0; padding: 0; display: flex; flex-direction: column; gap: 0.85rem; }
        .brand-feature-item {
          display: flex; align-items: center; gap: 0.6rem;
          font-size: 0.85rem; color: rgba(255,255,255,0.75);
        }
        .feature-dot {
          flex-shrink: 0;
          width: 24px; height: 24px;
          border-radius: 8px;
          background: rgba(255,255,255,0.12);
          display: grid; place-items: center;
          color: #7ee8d0;
        }

        /* ── Right card ── */
        .login-card {
          flex: 1;
          background: rgba(16, 24, 20, 0.92);
          backdrop-filter: blur(24px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.5rem;
        }
        .login-card-inner { width: 100%; max-width: 380px; }

        .login-header { margin-bottom: 2rem; }
        .login-title { font-size: 1.75rem; font-weight: 800; color: #f5f7f0; margin: 0; }
        .login-subtitle { font-size: 0.875rem; color: #6b8a7e; margin-top: 0.35rem; }

        /* ── Form ── */
        .login-form { display: flex; flex-direction: column; gap: 1rem; }

        .input-group {
          position: relative;
          display: flex;
          align-items: center;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
          overflow: hidden;
        }
        .input-group.focused {
          border-color: #5ec4a8;
          background: rgba(94,196,168,0.06);
          box-shadow: 0 0 0 3px rgba(94,196,168,0.12);
        }
        .input-icon {
          padding: 0 0 0 0.9rem;
          color: #6b8a7e;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .input-group.focused .input-icon { color: #5ec4a8; }

        .fancy-input {
          flex: 1;
          height: 3rem;
          background: transparent;
          border: none;
          outline: none;
          padding: 0 0.75rem;
          font-size: 0.9rem;
          color: #f5f7f0;
          caret-color: #5ec4a8;
        }
        .fancy-input::placeholder { color: #4a6660; }

        .eye-toggle {
          padding: 0 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #6b8a7e;
          display: flex;
          align-items: center;
          transition: color 0.2s;
          height: 3rem;
        }
        .eye-toggle:hover { color: #5ec4a8; }

        .input-border-animated {
          position: absolute;
          bottom: 0; left: 0;
          height: 2px;
          width: 0;
          background: linear-gradient(90deg, #5ec4a8, #16614f);
          border-radius: 0 0 2px 2px;
          transition: width 0.35s ease;
        }
        .input-group.focused .input-border-animated { width: 100%; }

        /* ── Form meta ── */
        .form-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: -0.25rem;
        }
        .remember-label {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.8rem; color: #6b8a7e; cursor: pointer;
          user-select: none;
        }
        .remember-check { display: none; }
        .remember-box {
          width: 16px; height: 16px;
          border-radius: 5px;
          border: 1.5px solid #30503d;
          display: inline-block;
          transition: background 0.2s, border-color 0.2s;
        }
        .remember-check:checked + .remember-box {
          background: #5ec4a8;
          border-color: #5ec4a8;
        }
        .forgot-link { font-size: 0.8rem; color: #5ec4a8; text-decoration: none; transition: color 0.2s; }
        .forgot-link:hover { color: #7ee8d0; }

        /* ── Submit button ── */
        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          height: 3rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #16614f 0%, #5ec4a8 100%);
          color: #fff;
          font-size: 0.95rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 6px 24px rgba(22,97,79,0.45);
          margin-top: 0.25rem;
          letter-spacing: 0.02em;
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(22,97,79,0.55);
        }
        .submit-btn:active { transform: translateY(0); }

        /* ── Divider ── */
        .divider {
          display: flex; align-items: center; gap: 0.75rem;
          margin: 1.5rem 0 1rem;
        }
        .divider span:first-child,
        .divider span:last-child {
          flex: 1; height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .divider-text { font-size: 0.75rem; color: #4a6660; white-space: nowrap; }

        /* ── Social buttons ── */
        .social-btns { display: flex; gap: 0.75rem; }
        .social-btn {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          height: 2.75rem;
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          color: #aeb7a7;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
        }
        .social-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
          color: #f5f7f0;
          transform: translateY(-1px);
        }

        /* ── Register link ── */
        .register-link-text {
          text-align: center;
          font-size: 0.82rem;
          color: #4a6660;
          margin-top: 1.5rem;
        }
        .register-link {
          color: #5ec4a8;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .register-link:hover { color: #7ee8d0; }
      `}</style>
    </main>
  );
}
