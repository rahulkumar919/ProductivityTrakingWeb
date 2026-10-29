import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PwaRegister } from "@/components/providers/pwa-register";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/* ── Next.js 15: viewport + themeColor must be a separate named export ── */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0f2ef" },
    { media: "(prefers-color-scheme: dark)", color: "#131610" },
  ],
};

export const metadata: Metadata = {
  title: "DevTrack AI — Personal Discipline OS",
  description:
    "Track tasks, habits, goals, focus time, DSA revision and get AI productivity insights — all in one place.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DevTrack AI",
  },
  formatDetection: { telephone: false },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#16614f",
    "msapplication-tap-highlight": "no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* iOS PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DevTrack AI" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <SessionProvider>
            <PwaRegister />
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
