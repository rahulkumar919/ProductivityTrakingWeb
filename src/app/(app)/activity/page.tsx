import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { demoActivities } from "@/data/demo";

export default function ActivityPage() {
  return (
    <>
      <PageHeader title="Activity Timeline" description="Every completed task, session, habit, routine, and goal achievement in one timeline." />
      <Card>
        <div className="space-y-5">
          {demoActivities.map((activity) => (
            <div key={activity.id} className="relative border-l pl-5">
              <span className="absolute -left-2 top-1 size-4 rounded-full bg-primary" />
              <p className="font-semibold">{activity.type}</p>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(activity.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
