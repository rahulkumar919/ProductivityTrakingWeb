import { Sidebar } from "@/components/app/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />

      {/*
        Desktop : left-offset 260px (sidebar width), no top padding
        Mobile  : top padding 56px (mob-header) + bottom padding via mobile-pb class
                  (= --bottom-nav-h + --safe-bottom + 16px, defined in globals.css)
      */}
      <main
        className="mobile-pb"
        style={{
          /* Desktop offset */
          marginLeft: "var(--main-ml, 0px)",
          /* Mobile top clearance for the fixed header */
          paddingTop: "var(--main-pt, 16px)",
          paddingLeft: "clamp(12px, 4vw, 32px)",
          paddingRight: "clamp(12px, 4vw, 32px)",
        }}
      >
        {children}
      </main>

      {/*
        Inline style block — sets the CSS vars that drive the layout offsets.
        Using CSS custom properties instead of Tailwind breakpoint classes
        keeps the logic in one place and avoids the lg:ml-72 / sidebar-width
        mismatch that existed before.
      */}
      <style>{`
        /* Desktop ≥ 1024px */
        @media (min-width: 1024px) {
          :root {
            --main-ml: 260px;
            --main-pt: 28px;
          }
        }
        /* Mobile < 1024px */
        @media (max-width: 1023px) {
          :root {
            --main-ml: 0px;
            /* 56px mob-header + 8px breathing room */
            --main-pt: calc(56px + var(--safe-top, 0px) + 8px);
          }
        }
      `}</style>
    </div>
  );
}
