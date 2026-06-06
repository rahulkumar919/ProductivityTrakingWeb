import { Schema, models, model } from "mongoose";

const TimeSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mode: { type: String, enum: ["Pomodoro", "Deep Work", "Study Session", "Coding Session"], required: true },
    taskId: { type: Schema.Types.ObjectId, ref: "Task" },
    taskTitle: { type: String, default: "" },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
  },
  { timestamps: true }
);

export const TimeSession = models.TimeSession || model("TimeSession", TimeSessionSchema);
