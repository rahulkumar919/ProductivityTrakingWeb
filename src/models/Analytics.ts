import { Schema, models, model } from "mongoose";

const AnalyticsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true },
    productivityScore: { type: Number, required: true },
    focusMinutes: { type: Number, default: 0 },
    codingMinutes: { type: Number, default: 0 },
    studyMinutes: { type: Number, default: 0 },
    gymMinutes: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    pendingTasks: { type: Number, default: 0 },
    routineCompletion: { type: Number, default: 0 },
    habitCompletion: { type: Number, default: 0 },
    goalCompletionRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AnalyticsSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Analytics = models.Analytics || model("Analytics", AnalyticsSchema);
