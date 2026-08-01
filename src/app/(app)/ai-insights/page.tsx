import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AiInsightsPage() {
  return (
    <>
      <PageHeader
        title="AI Insights"
        description="Daily summary, weekly review, routine suggestions, consistency analysis, burnout checks, and smart recommendations."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <h2 className="text-lg font-semibold">Coach Review</h2>
          <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
            <Lightbulb size={36} className="text-muted-foreground" />
            <p className="font-semibold">No data yet</p>
            <p className="text-sm text-muted-foreground max-w-md">
              Start tracking tasks, habits, focus sessions, and goals. Once you have activity data, your AI coach will generate personalised insights and recommendations here.
            </p>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Smart Signals</h2>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>Productivity score: <strong>—</strong></p>
            <p>Burnout risk: <strong>—</strong></p>
            <p>Best next action: <strong>Create your first task to get started.</strong></p>
          </div>
        </Card>
      </div>
    </>
  );
}
