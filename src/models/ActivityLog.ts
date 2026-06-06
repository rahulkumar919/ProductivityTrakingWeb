import { Schema, models, model } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const ActivityLog = models.ActivityLog || model("ActivityLog", ActivityLogSchema);
