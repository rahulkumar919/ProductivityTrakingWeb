import { PageHeader } from "@/components/app/page-header";
import { FocusTimer } from "@/components/features/focus-timer";

export default function TimerPage() {
  return (
    <>
      <PageHeader title="Focus Timer" description="Run Pomodoro, deep work, study, or coding sessions and log your focus time." />
      <FocusTimer />
    </>
  );
}
