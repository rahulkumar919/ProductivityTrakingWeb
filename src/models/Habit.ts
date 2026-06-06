import { Schema, models, model } from "mongoose";

const CheckInSchema = new Schema(
  {
    date: { type: Date, required: true },
    completed: { type: Boolean, default: true },
  },
  { _id: false }
);

const HabitSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    checkIns: { type: [CheckInSchema], default: [] },
  },
  { timestamps: true }
);

export const Habit = models.Habit || model("Habit", HabitSchema);
