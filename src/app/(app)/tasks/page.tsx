import { PageHeader } from "@/components/app/page-header";
import { TaskBoard } from "@/components/features/task-board";

export default function TasksPage() {
  return (
    <>
      <PageHeader title="Tasks" description="Plan. Prioritize. Execute. Track every step of your journey." />
      <TaskBoard />
    </>
  );
}
