import { Schema, models, model } from "mongoose";

const NotebookSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, required: true, trim: true },
        subject: { type: String, default: "General" },   // e.g. DSA, Tree, Graph
        description: { type: String, default: "" },
        color: { type: String, default: "#6366f1" },
        emoji: { type: String, default: "📓" },
        pages: [
            {
                pageNumber: { type: Number, required: true },
                cloudinaryId: { type: String, required: true },  // public_id on Cloudinary
                imageUrl: { type: String, required: true },  // secure_url
                caption: { type: String, default: "" },
            },
        ],
    },
    { timestamps: true }
);

export const Notebook = models.Notebook || model("Notebook", NotebookSchema);
