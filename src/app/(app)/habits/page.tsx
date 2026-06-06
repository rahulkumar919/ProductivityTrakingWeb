import { PageHeader } from "@/components/app/page-header";
import { HabitTracker } from "@/components/features/habit-tracker";

export default function HabitsPage() {
  return (
    <>
      <PageHeader title="Habit Tracker" description="Track coding, DSA, web development, English, reading, gym, meditation, and sleep habits." />
      <HabitTracker />
    </>
  );
}
