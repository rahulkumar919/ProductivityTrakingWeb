import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { generateProductivityInsights } from "@/lib/ai";
import { demoGoals, demoHabits, demoRoutine, demoSessions, demoTasks } from "@/data/demo";
import { calculateProductivityScore } from "@/lib/productivity";

export const dynamic = "force-dynamic";

export default async function AiInsightsPage() {
  const score = calculateProductivityScore({ tasks: demoTasks, habits: demoHabits, routine: demoRoutine, sessions: demoSessions, goals: demoGoals });
  const insight = await generateProductivityInsights(JSON.stringify({ score, tasks: demoTasks, habits: demoHabits, routine: demoRoutine, goals: demoGoals, sessions: demoSessions }, null, 2));
  return (
    <>
      <PageHeader title="AI Insights" description="Daily summary, weekly review, routine suggestions, consistency analysis, burnout checks, and smart recommendations." />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card><h2 className="text-lg font-semibold">Coach Review</h2><div className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">{insight}</div></Card>
        <Card><h2 className="text-lg font-semibold">Smart Signals</h2><div className="mt-4 space-y-3 text-sm"><p>Productivity score: <strong>{score}%</strong></p><p>Burnout risk: <strong>Low to moderate</strong></p><p>Best next action: finish one high-priority coding task.</p></div></Card>
      </div>
    </>
  );
}
