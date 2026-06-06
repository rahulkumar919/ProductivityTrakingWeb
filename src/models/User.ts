import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    profession: { type: String, default: "Student Developer" },
    dailyTargetStudyHours: { type: Number, default: 3 },
    dailyTargetCodingHours: { type: Number, default: 4 },
    dailyTargetGymTime: { type: Number, default: 60 },
  },
  { timestamps: true }
);

export type UserDocument = mongoose.InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };
export const User = models.User || model("User", UserSchema);
