import Link from "next/link";
import { Activity, BarChart3, Brain, CalendarCheck, CheckSquare, Dumbbell, Flame, Gauge, Target, Timer, User } from "lucide-react";
import { ThemeToggle } from "@/components/app/theme-toggle";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/routine", label: "Routine", icon: CalendarCheck },
  { href: "/habits", label: "Habits", icon: Flame },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/timer", label: "Focus Timer", icon: Timer },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai-insights", label: "AI Insights", icon: Brain },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  return (
    <aside className="border-b bg-card/80 backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-5 p-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground"><Dumbbell size={20} /></span>
            <span>
              <span className="block text-lg font-bold">DevTrack AI</span>
              <span className="block text-xs text-muted-foreground">Personal discipline OS</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>
        <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/api/auth/logout" method="post" className="mt-auto">
          <button className="h-10 w-full rounded-md border text-sm font-semibold hover:bg-muted">Logout</button>
        </form>
      </div>
    </aside>
  );
}
