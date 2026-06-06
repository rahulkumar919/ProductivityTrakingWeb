import { Activity, CheckCircle2, Clock, Code2, Dumbbell, Flame, ListTodo, Timer } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { HoursBar, ProductivityArea } from "@/components/charts/productivity-charts";
import { demoGoals, demoHabits, demoRoutine, demoSessions, demoTasks, productivitySeries } from "@/data/demo";
import { calculateProductivityScore } from "@/lib/productivity";
import { formatHours } from "@/lib/utils";

export function Dashboard() {
  const score = calculateProductivityScore({ tasks: demoTasks, habits: demoHabits, routine: demoRoutine, sessions: demoSessions, goals: demoGoals });
  const focusMinutes = demoSessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const completed = demoTasks.filter((task) => task.status === "Completed").length;
  const pending = demoTasks.filter((task) => task.status !== "Completed").length;

  const stats = [
    { label: "Productivity Score", value: `${score}%`, icon: Activity },
    { label: "Focus Hours", value: formatHours(focusMinutes), icon: Timer },
    { label: "Coding Hours", value: "5h 20m", icon: Code2 },
    { label: "Study Hours", value: "3h 35m", icon: Clock },
    { label: "Gym Time", value: "1h", icon: Dumbbell },
    { label: "Tasks Completed", value: completed, icon: CheckCircle2 },
    { label: "Pending Tasks", value: pending, icon: ListTodo },
    { label: "Current Streak", value: "18 days", icon: Flame },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between">
              <CardTitle>{stat.label}</CardTitle>
              <stat.icon size={18} className="text-primary" />
            </div>
            <div className="mt-3 text-3xl font-bold">{stat.value}</div>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Weekly Progress</h2>
          <ProductivityArea data={productivitySeries} />
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Coding, Study, Gym</h2>
          <HoursBar data={productivitySeries} />
        </Card>
      </div>
    </div>
  );
}
