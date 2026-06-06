import { clamp } from "@/lib/utils";
import type { Goal, Habit, RoutineItem, Task, TimeSession } from "@/types";

export function calculateProductivityScore(input: {
  tasks: Task[];
  habits: Habit[];
  routine: RoutineItem[];
  sessions: TimeSession[];
  goals: Goal[];
}) {
  const totalTasks = input.tasks.length || 1;
  const taskScore = (input.tasks.filter((task) => task.status === "Completed").length / totalTasks) * 100;
  const habitScore = (input.habits.filter((habit) => habit.completedToday).length / (input.habits.length || 1)) * 100;
  const routineScore = (input.routine.filter((item) => item.completed).length / (input.routine.length || 1)) * 100;
  const focusMinutes = input.sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const focusScore = clamp((focusMinutes / 240) * 100);
  const goalScore = input.goals.reduce((sum, goal) => sum + goal.progress, 0) / (input.goals.length || 1);

  return Math.round(taskScore * 0.34 + focusScore * 0.2 + habitScore * 0.18 + routineScore * 0.18 + goalScore * 0.1);
}
