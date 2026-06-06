import { PageHeader } from "@/components/app/page-header";
import { Dashboard } from "@/components/features/dashboard";

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Today at a glance: focus, routine, habits, streaks, goals, and progress." />
      <Dashboard />
    </>
  );
}
