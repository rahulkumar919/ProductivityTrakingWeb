import { PageHeader } from "@/components/app/page-header";
import { TaskBoard } from "@/components/features/task-board";

export default function TasksPage() {
  return (
    <>
      <PageHeader title="Tasks" description="Create, update, delete, search, filter, and sort your personal work." />
      <TaskBoard />
    </>
  );
}
