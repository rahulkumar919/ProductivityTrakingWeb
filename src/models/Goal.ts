import { Schema, models, model } from "mongoose";

const GoalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    period: { type: String, enum: ["Daily", "Weekly", "Monthly"], required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    deadline: { type: Date, required: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Goal = models.Goal || model("Goal", GoalSchema);
