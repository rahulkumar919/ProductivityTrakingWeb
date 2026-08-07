"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, ArrowRight, Loader2, Shield, Smartphone, Lock } from "lucide-react";

/* ── tiny validation helpers ─────────────────────────────────── */
function validateMobile(v: string) {
  if (!v.trim()) return "Mobile number is required.";
  if (!/^\d{8,15}$/.test(v.replace(/[\s\-+]/g, ""))) return "Enter a valid mobile number.";
  return "";
}
function validatePwd(v: string) {
  if (!v) return "Password is required.";
  if (v.length < 8) return "Password must be at least 8 characters.";
  return "";
}

/* ── Google SVG ──────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/* ── Animated mountain SVG (left panel bg) ───────────────────── */
function MountainScene() {
  return (
    <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", bottom: 0, left: 0, width: "100%", opacity: 0.9 }}>
      {/* sky glow */}
      <ellipse cx="200" cy="200" rx="180" ry="80" fill="url(#skyGlow)" />
      {/* back mountains */}
      <path d="M0 260 L60 140 L120 200 L180 100 L240 170 L300 80 L360 150 L400 120 L400 260Z"
        fill="url(#mtBack)" opacity="0.5" />
      {/* mid mountains */}
      <path d="M0 260 L80 160 L150 210 L220 120 L290 180 L340 130 L400 160 L400 260Z"
        fill="url(#mtMid)" opacity="0.7" />
      {/* front hills */}
      <path d="M0 260 L100 200 L180 230 L260 190 L340 220 L400 200 L400 260Z"
        fill="url(#mtFront)" />
      {/* path/road */}
      <path d="M180 260 Q200 200 210 170 Q215 155 200 140" stroke="#5ec4a8"
        strokeWidth="2" strokeDasharray="4 3" opacity="0.6" fill="none" />
      {/* flag at top */}
      <circle cx="200" cy="138" r="3" fill="#5ec4a8" />
      <line x1="200" y1="138" x2="200" y2="122" stroke="#5ec4a8" strokeWidth="1.5" />
      <path d="M200 122 L212 127 L200 132Z" fill="#5ec4a8" />
      {/* stars */}
      {[[60, 40], [100, 20], [160, 50], [280, 30], [340, 60], [370, 25]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill="white" opacity="0.6" />
      ))}
      <defs>
        <radialGradient id="skyGlow" cx="50%" cy="80%">
          <stop offset="0%" stopColor="#5ec4a8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#5ec4a8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mtBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a3d30" /><stop offset="100%" stopColor="#0d1f1a" />
        </linearGradient>
        <linearGradient id="mtMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e4d3a" /><stop offset="100%" stopColor="#0f2419" />
        </linearGradient>
        <linearGradient id="mtFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16614f" /><stop offset="100%" stopColor="#0a1e16" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Feature list item ───────────────────────────────────────── */
const FEATURES = [
  { icon: "🎯", title: "Track daily habits & routines", sub: "Build consistency that lasts" },
  { icon: "✨", title: "AI-powered productivity insights", sub: "Smarter analytics for better you" },
  { icon: "⏱️", title: "Deep focus timer & analytics", sub: "Stay in the zone, get more done" },
  { icon: "🚩", title: "Goals & milestone tracking", sub: "Set goals and crush them daily" },
];

/* ══════════════════════════════════════════════════════════════
   INNER COMPONENT (needs useSearchParams → must be in Suspense)
══════════════════════════════════════════════════════════════ */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ mobile?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Handle OAuth error param from NextAuth
    const err = searchParams.get("error");
    if (err === "OAuthAccountNotLinked") {
      setToast({ msg: "This email is linked to another sign-in method.", ok: false });
    } else if (err) {
      setToast({ msg: "Sign-in failed. Please try again.", ok: false });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Credentials submit ───────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const mErr = validateMobile(mobile);
    const pErr = validatePwd(password);
    if (mErr || pErr) { setErrors({ mobile: mErr, password: pErr }); return; }
    setErrors({});
    setLoading(true);
    try {
      // Call custom login API to set JWT cookie (used by middleware)
      const apiRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: mobile.replace(/[\s\-+]/g, ""), password }),
      });
      if (!apiRes.ok) {
        setToast({ msg: "Invalid mobile number or password.", ok: false });
      } else {
        // Also sign in with NextAuth to set session cookie
        await signIn("credentials", {
          mobileNumber: mobile.replace(/[\s\-+]/g, ""),
          password,
          redirect: false,
        });
        setToast({ msg: "Welcome back! Redirecting…", ok: true });
        setTimeout(() => { window.location.href = "/dashboard"; }, 800);
      }
    } catch {
      setToast({ msg: "Something went wrong. Please try again.", ok: false });
    } finally {
      setLoading(false);
    }
  }

  /* ── Google OAuth ─────────────────────────────────────────── */
  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setToast({ msg: "Google sign-in failed. Please try again.", ok: false });
      setGoogleLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <main className="lg-root">
      {/* animated ambient blobs */}
      <div className="lg-blob lg-blob-1" /><div className="lg-blob lg-blob-2" /><div className="lg-blob lg-blob-3" />

      {/* floating particles */}
      <div className="lg-particles" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="lg-particle" style={{ "--pi": i } as React.CSSProperties} />
        ))}
      </div>

      {/* toast */}
      {toast && (
        <div className={`lg-toast ${toast.ok ? "lg-toast-ok" : "lg-toast-err"}`} role="alert">
          <span>{toast.ok ? "✓" : "✕"}</span> {toast.msg}
        </div>
      )}

      <div className="lg-card">
        {/* ── LEFT BRAND PANEL ── */}
        <div className="lg-left">
          <MountainScene />
          <div className="lg-left-content">
            {/* logo */}
            <div className="lg-logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <h2 className="lg-brand">DevTrack <span className="lg-brand-ai">AI</span></h2>
            <p className="lg-tagline">Your Personal Discipline OS</p>
            <p className="lg-motto">Track. Focus. Improve. Achieve.</p>
            <ul className="lg-features">
              {FEATURES.map(f => (
                <li key={f.title} className="lg-feat">
                  <div className="lg-feat-icon">{f.icon}</div>
                  <div>
                    <p className="lg-feat-title">{f.title}</p>
                    <p className="lg-feat-sub">{f.sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="lg-right">
          {/* secure badge */}
          <div className="lg-secure-badge"><Shield size={12} /> Secure &amp; Private</div>

          <div className="lg-form-wrap">
            <div className="lg-header">
              <h1 className="lg-title">Welcome back <span className="lg-wave">👋</span></h1>
              <p className="lg-sub">Sign in to continue your journey</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="lg-form">
              {/* Mobile */}
              <div className="lg-field">
                <label className="lg-label" htmlFor="lg-mobile">Mobile Number</label>
                <div className={`lg-input-wrap ${errors.mobile ? "lg-input-err" : ""}`}>
                  <Smartphone size={16} className="lg-input-icon" />
                  <input id="lg-mobile" type="tel" autoComplete="tel" placeholder="Enter your mobile number"
                    value={mobile} onChange={e => { setMobile(e.target.value); setErrors(p => ({ ...p, mobile: "" })); }}
                    onBlur={() => setErrors(p => ({ ...p, mobile: validateMobile(mobile) }))}
                    className="lg-input" disabled={loading} />
                </div>
                {errors.mobile && <p className="lg-error">{errors.mobile}</p>}
              </div>

              {/* Password */}
              <div className="lg-field">
                <label className="lg-label" htmlFor="lg-pwd">Password</label>
                <div className={`lg-input-wrap ${errors.password ? "lg-input-err" : ""}`}>
                  <Lock size={16} className="lg-input-icon" />
                  <input id="lg-pwd" type={showPwd ? "text" : "password"} autoComplete="current-password"
                    placeholder="Enter your password" value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                    onBlur={() => setErrors(p => ({ ...p, password: validatePwd(password) }))}
                    className="lg-input lg-input-pwd" disabled={loading} />
                  <button type="button" className="lg-eye" onClick={() => setShowPwd(v => !v)} tabIndex={-1} aria-label={showPwd ? "Hide password" : "Show password"}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="lg-error">{errors.password}</p>}
              </div>

              {/* remember + forgot */}
              <div className="lg-row">
                <label className="lg-check-label">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="lg-check-native" />
                  <span className="lg-check-box" /><span>Remember me</span>
                </label>
                <button type="button" className="lg-forgot" onClick={() => alert("Password reset coming soon!")}>Forgot password?</button>
              </div>

              {/* submit */}
              <button type="submit" className="lg-submit" disabled={loading || googleLoading} aria-busy={loading}>
                {loading ? <><Loader2 size={18} className="lg-spin" /> Signing in…</> : <>Sign In <ArrowRight size={18} /></>}
              </button>
            </form>

            {/* divider */}
            <div className="lg-divider"><span /><span className="lg-div-txt">or continue with</span><span /></div>

            {/* social */}
            <div className="lg-socials">
              <button type="button" className="lg-social lg-google" onClick={handleGoogle} disabled={loading || googleLoading}>
                {googleLoading ? <Loader2 size={18} className="lg-spin" /> : <GoogleIcon />}
                {googleLoading ? "Connecting…" : "Continue with Google"}
              </button>
            </div>

            {/* register link */}
            <p className="lg-reg-txt">Don&apos;t have an account? <Link href="/register" className="lg-reg-link">Create one free →</Link></p>

            {/* trust badge */}
            <div className="lg-trust">
              <Lock size={20} className="lg-trust-icon" />
              <div>
                <p className="lg-trust-title">Your data is safe with us</p>
                <p className="lg-trust-sub">We never share your personal information with anyone. Ever.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        *,*::before,*::after{box-sizing:border-box;}
        .lg-root{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 20% 30%,#0a2319 0%,#07110e 50%,#050e09 100%);overflow:hidden;padding:1rem;position:relative;}
        .lg-blob{position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none;animation:lgBlob 14s ease-in-out infinite alternate;}
        .lg-blob-1{width:500px;height:500px;background:#0e3d28;opacity:.5;top:-200px;left:-150px;animation-duration:16s;}
        .lg-blob-2{width:400px;height:400px;background:#1a4a35;opacity:.35;bottom:-150px;right:-100px;animation-duration:12s;animation-delay:-6s;}
        .lg-blob-3{width:350px;height:350px;background:#5ec4a820;opacity:.4;top:40%;left:38%;animation-duration:18s;animation-delay:-3s;}
        @keyframes lgBlob{0%{transform:scale(1) translate(0,0);}100%{transform:scale(1.2) translate(40px,-40px);}}
        .lg-particles{position:absolute;inset:0;pointer-events:none;overflow:hidden;}
        .lg-particle{position:absolute;width:2px;height:2px;border-radius:50%;background:#5ec4a8;opacity:0;left:calc(var(--pi)*4.3%);top:105%;animation:lgRise calc(7s + var(--pi)*.25s) linear infinite;animation-delay:calc(var(--pi)*.5s);}
        @keyframes lgRise{0%{opacity:0;top:105%;}10%{opacity:.6;}90%{opacity:.2;}100%{opacity:0;top:-5%;}}
        .lg-toast{position:fixed;top:1.5rem;right:1.5rem;z-index:9999;padding:.75rem 1.25rem;border-radius:12px;font-size:.85rem;font-weight:600;display:flex;align-items:center;gap:.5rem;animation:lgSlideIn .3s ease;box-shadow:0 8px 24px rgba(0,0,0,.4);}
        .lg-toast-ok{background:#16614f;color:#7ee8d0;border:1px solid rgba(94,196,168,.3);}
        .lg-toast-err{background:#3d1616;color:#f87171;border:1px solid rgba(239,68,68,.3);}
        @keyframes lgSlideIn{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
        .lg-card{position:relative;z-index:10;display:flex;width:100%;max-width:960px;min-height:620px;border-radius:28px;overflow:hidden;box-shadow:0 0 0 1px rgba(94,196,168,.12),0 40px 120px rgba(0,0,0,.7);animation:lgUp .6s cubic-bezier(.22,1,.36,1) both;}
        @keyframes lgUp{from{opacity:0;transform:translateY(40px);}to{opacity:1;transform:translateY(0);}}
        .lg-left{position:relative;flex:0 0 380px;overflow:hidden;background:linear-gradient(160deg,#0a2319 0%,#0d2e1f 40%,#12402b 70%,#0a2218 100%);}
        @media(max-width:800px){.lg-left{display:none;}}
        .lg-left-content{position:relative;z-index:2;padding:2.5rem;height:100%;display:flex;flex-direction:column;}
        .lg-logo{width:52px;height:52px;border-radius:16px;background:rgba(94,196,168,.15);border:1px solid rgba(94,196,168,.25);display:grid;place-items:center;margin-bottom:1.2rem;backdrop-filter:blur(8px);}
        .lg-brand{font-size:1.8rem;font-weight:900;color:#fff;margin:0;}
        .lg-brand-ai{color:#5ec4a8;}
        .lg-tagline{font-size:.82rem;color:rgba(255,255,255,.5);margin-top:.2rem;}
        .lg-motto{font-size:.78rem;font-weight:700;color:#5ec4a8;margin:.9rem 0 1.4rem;letter-spacing:.04em;padding-bottom:.9rem;border-bottom:1px solid rgba(94,196,168,.15);}
        .lg-features{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1rem;}
        .lg-feat{display:flex;align-items:flex-start;gap:.85rem;}
        .lg-feat-icon{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);display:grid;place-items:center;font-size:1rem;flex-shrink:0;}
        .lg-feat-title{font-size:.82rem;font-weight:700;color:rgba(255,255,255,.85);margin:0;}
        .lg-feat-sub{font-size:.72rem;color:rgba(255,255,255,.4);margin:.1rem 0 0;}
        .lg-right{flex:1;background:rgba(11,20,16,.9);backdrop-filter:blur(32px);display:flex;align-items:center;justify-content:center;padding:2.5rem 2rem;position:relative;}
        .lg-secure-badge{position:absolute;top:1.25rem;right:1.25rem;display:flex;align-items:center;gap:.4rem;padding:.3rem .75rem;border-radius:99px;background:rgba(94,196,168,.08);border:1px solid rgba(94,196,168,.18);font-size:.68rem;font-weight:700;color:#5ec4a8;}
        .lg-form-wrap{width:100%;max-width:400px;display:flex;flex-direction:column;gap:0;}
        .lg-header{margin-bottom:1.75rem;}
        .lg-title{font-size:1.75rem;font-weight:900;color:#f0f5f2;margin:0;display:flex;align-items:center;gap:.5rem;}
        .lg-wave{display:inline-block;animation:lgWave 2s ease-in-out infinite;}
        @keyframes lgWave{0%,100%{transform:rotate(0deg);}25%{transform:rotate(20deg);}75%{transform:rotate(-10deg);}}
        .lg-sub{font-size:.85rem;color:#4a6b5a;margin:.35rem 0 0;}
        .lg-form{display:flex;flex-direction:column;gap:1rem;}
        .lg-field{display:flex;flex-direction:column;gap:.4rem;}
        .lg-label{font-size:.78rem;font-weight:600;color:#8aada0;}
        .lg-input-wrap{display:flex;align-items:center;gap:0;border-radius:12px;border:1.5px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);transition:border-color .2s,box-shadow .2s;overflow:hidden;}
        .lg-input-wrap:focus-within{border-color:#5ec4a8;box-shadow:0 0 0 3px rgba(94,196,168,.12);}
        .lg-input-err{border-color:#ef4444 !important;}
        .lg-input-icon{color:#4a6b5a;flex-shrink:0;margin-left:.9rem;}
        .lg-input{flex:1;height:48px;padding:0 .9rem;background:transparent;border:none;outline:none;color:#f0f5f2;font-size:.9rem;}
        .lg-input::placeholder{color:#2e4d3e;}
        .lg-input-pwd{padding-right:0;}
        .lg-eye{display:flex;align-items:center;justify-content:center;width:44px;height:48px;background:transparent;border:none;cursor:pointer;color:#4a6b5a;flex-shrink:0;transition:color .15s;}
        .lg-eye:hover{color:#5ec4a8;}
        .lg-error{font-size:.72rem;color:#f87171;margin:0;}
        .lg-row{display:flex;align-items:center;justify-content:space-between;}
        .lg-check-native{display:none;}
        .lg-check-label{display:flex;align-items:center;gap:.5rem;font-size:.78rem;color:#4a6b5a;cursor:pointer;user-select:none;}
        .lg-check-box{width:16px;height:16px;border-radius:5px;border:1.5px solid #2e4d3e;flex-shrink:0;transition:background .2s,border-color .2s;background:transparent;}
        .lg-check-native:checked+.lg-check-box{background:#5ec4a8;border-color:#5ec4a8;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 8'%3E%3Cpath d='M1 4l3 3 5-6' stroke='%23071510' strokeWidth='1.8' fill='none' strokeLinecap='round'/%3E%3C/svg%3E");background-size:10px 8px;background-repeat:no-repeat;background-position:center;}
        .lg-forgot{font-size:.78rem;color:#5ec4a8;background:none;border:none;cursor:pointer;padding:0;transition:color .15s;}
        .lg-forgot:hover{color:#7ee8d0;}
        .lg-submit{display:flex;align-items:center;justify-content:center;gap:.5rem;height:52px;border-radius:14px;background:linear-gradient(135deg,#16614f 0%,#5ec4a8 100%);color:#fff;font-size:.95rem;font-weight:800;border:none;cursor:pointer;transition:transform .2s,box-shadow .2s,opacity .2s;box-shadow:0 8px 28px rgba(22,97,79,.5);letter-spacing:.02em;margin-top:.25rem;}
        .lg-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 14px 36px rgba(22,97,79,.65);}
        .lg-submit:disabled{opacity:.65;cursor:not-allowed;}
        .lg-spin{animation:lgSpin .7s linear infinite;}
        @keyframes lgSpin{to{transform:rotate(360deg);}}
        .lg-divider{display:flex;align-items:center;gap:.75rem;margin:1.4rem 0 1rem;}
        .lg-divider span:first-child,.lg-divider span:last-child{flex:1;height:1px;background:rgba(255,255,255,.06);}
        .lg-div-txt{font-size:.72rem;color:#2e4d3e;white-space:nowrap;}
        .lg-socials{display:flex;flex-direction:column;gap:.65rem;}
        .lg-social{display:flex;align-items:center;justify-content:center;gap:.65rem;height:48px;border-radius:13px;border:1.5px solid rgba(255,255,255,.09);background:rgba(255,255,255,.04);color:#c4d4cc;font-size:.85rem;font-weight:600;cursor:pointer;transition:background .2s,border-color .2s,color .2s,transform .15s;}
        .lg-social:hover:not(:disabled){background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.18);color:#fff;transform:translateY(-1px);}
        .lg-social:disabled{opacity:.6;cursor:not-allowed;}
        .lg-google:hover:not(:disabled){border-color:rgba(66,133,244,.4);}
        .lg-reg-txt{text-align:center;font-size:.8rem;color:#2e4d3e;margin:1.25rem 0 0;}
        .lg-reg-link{color:#5ec4a8;font-weight:700;text-decoration:none;transition:color .15s;}
        .lg-reg-link:hover{color:#7ee8d0;}
        .lg-trust{display:flex;align-items:center;gap:.85rem;padding:.9rem;border-radius:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);margin-top:1rem;}
        .lg-trust-icon{color:#5ec4a8;flex-shrink:0;}
        .lg-trust-title{font-size:.78rem;font-weight:700;color:#8aada0;margin:0;}
        .lg-trust-sub{font-size:.7rem;color:#2e4d3e;margin:.1rem 0 0;}
      `}</style>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
