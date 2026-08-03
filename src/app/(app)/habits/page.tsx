import { PageHeader } from "@/components/app/page-header";
import { HabitTracker } from "@/components/features/habit-tracker";

export default function HabitsPage() {
  return (
    <>
      <PageHeader title="Habit Tracker" description="Build small habits, get consistent, achieve big goals." />
      <HabitTracker />
    </>
  );
}
