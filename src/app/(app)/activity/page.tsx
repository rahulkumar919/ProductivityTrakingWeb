import { PageHeader } from "@/components/app/page-header";
import { ActivityTimeline } from "@/components/features/activity-timeline";

export default function ActivityPage() {
  return (
    <>
      <PageHeader
        title="Activity Timeline"
        description="Every completed task, session, habit, routine, goal achievement, and learning entry in one timeline."
      />
      <ActivityTimeline />
    </>
  );
}
