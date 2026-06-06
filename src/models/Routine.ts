import { Schema, models, model } from "mongoose";

const RoutineSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    targetTime: { type: String, required: true },
    completedDates: { type: [Date], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Routine = models.Routine || model("Routine", RoutineSchema);
