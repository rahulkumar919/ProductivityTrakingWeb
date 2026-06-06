import { PageHeader } from "@/components/app/page-header";
import { RoutinePlanner } from "@/components/features/routine-planner";

export default function RoutinePage() {
  return (
    <>
      <PageHeader title="Daily Routine" description="Plan the day, mark routines complete, and watch your consistency score." />
      <RoutinePlanner />
    </>
  );
}
