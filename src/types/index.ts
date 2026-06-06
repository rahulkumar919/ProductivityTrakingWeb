export type Category = "Coding" | "Study" | "College" | "Gym" | "Personal" | "Other";
export type Priority = "Low" | "Medium" | "High";
export type TaskStatus = "Todo" | "In Progress" | "Completed";
export type GoalPeriod = "Daily" | "Weekly" | "Monthly";
export type SessionMode = "Pomodoro" | "Deep Work" | "Study Session" | "Coding Session";

export type Task = {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  deadline: string;
  status: TaskStatus;
};

export type Habit = {
  id: string;
  title: string;
  streak: number;
  longestStreak: number;
  completedToday: boolean;
  monthlyHistory: boolean[];
};

export type Goal = {
  id: string;
  title: string;
  period: GoalPeriod;
  progress: number;
  deadline: string;
};

export type RoutineItem = {
  id: string;
  title: string;
  targetTime: string;
  completed: boolean;
};

export type ActivityLog = {
  id: string;
  type: string;
  description: string;
  createdAt: string;
};

export type TimeSession = {
  id: string;
  mode: SessionMode;
  taskTitle?: string;
  durationMinutes: number;
  startedAt: string;
  endedAt: string;
};
