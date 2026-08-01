"use client";

import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { HoursBar, ProductivityArea } from "@/components/charts/productivity-charts";
import { BarChart2 } from "lucide-react";

const METRICS = [
  "Daily Productivity",
  "Weekly Productivity",
  "Monthly Productivity",
  "Habit Streaks",
  "Goal Completion",
  "Focus Time",
];

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Daily, weekly, and monthly progress across coding, study, gym, habits, goals, and focus."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {METRICS.map((metric) => (
          <Card key={metric}>
            <p className="text-sm text-muted-foreground">{metric}</p>
            <p className="mt-2 text-3xl font-bold text-muted-foreground/40">—</p>
          </Card>
        ))}
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Productivity Trend</h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart2 size={32} className="mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Data will appear here once you log focus sessions and complete tasks.</p>
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Focus Time Analysis</h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart2 size={32} className="mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Start a focus session to see time analysis charts here.</p>
          </div>
        </Card>
      </div>
    </>
  );
}
