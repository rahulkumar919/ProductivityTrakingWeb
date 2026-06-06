import { PageHeader } from "@/components/app/page-header";
import { HoursBar, ProductivityArea } from "@/components/charts/productivity-charts";
import { Card } from "@/components/ui/card";
import { productivitySeries } from "@/data/demo";

export default function AnalyticsPage() {
  const metrics = ["Daily Productivity", "Weekly Productivity", "Monthly Productivity", "Habit Streaks", "Goal Completion", "Focus Time"];
  return (
    <>
      <PageHeader title="Analytics" description="Daily, weekly, and monthly progress across coding, study, gym, habits, goals, and focus." />
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric, index) => <Card key={metric}><p className="text-sm text-muted-foreground">{metric}</p><p className="mt-2 text-3xl font-bold">{[78, 84, 72, 18, 61, 295][index]}{index < 5 ? "%" : "m"}</p></Card>)}
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <Card><h2 className="mb-4 text-lg font-semibold">Productivity Trend</h2><ProductivityArea data={productivitySeries} /></Card>
        <Card><h2 className="mb-4 text-lg font-semibold">Focus Time Analysis</h2><HoursBar data={productivitySeries} /></Card>
      </div>
    </>
  );
}
