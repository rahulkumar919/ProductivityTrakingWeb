import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  mobileNumber: z.string().min(8).max(16),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  mobileNumber: z.string().min(8),
  password: z.string().min(8),
});

export const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  category: z.enum(["Coding", "Study", "College", "Gym", "Personal", "Other"]),
  priority: z.enum(["Low", "Medium", "High"]),
  deadline: z.string(),
  status: z.enum(["Todo", "In Progress", "Completed"]),
});

export const goalSchema = z.object({
  title: z.string().min(2),
  period: z.enum(["Daily", "Weekly", "Monthly"]),
  progress: z.coerce.number().min(0).max(100),
  deadline: z.string(),
});
