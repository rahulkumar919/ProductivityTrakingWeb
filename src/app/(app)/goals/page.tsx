import { PageHeader } from "@/components/app/page-header";
import { GoalManager } from "@/components/features/goal-manager";

export default function GoalsPage() {
  return (
    <>
      <PageHeader title="Goals" description="Manage daily, weekly, and monthly goals with completion rates and deadlines." />
      <GoalManager />
    </>
  );
}
