import { Schema, models, model } from "mongoose";

const TaskSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, enum: ["Coding", "Study", "College", "Gym", "Personal", "Other"], default: "Other" },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ["Todo", "In Progress", "Completed"], default: "Todo" },
  },
  { timestamps: true }
);

export const Task = models.Task || model("Task", TaskSchema);
