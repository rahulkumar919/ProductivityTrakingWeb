import { Schema, models, model } from "mongoose";

const NoteSchema = new Schema({
    id: { type: String, required: true },
    page: { type: Number, required: true },
    text: { type: String, required: true },
    createdAt: { type: String, required: true },
});

const StudyPdfSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, required: true, trim: true },
        category: { type: String, default: "General" },
        pdfUrl: { type: String, default: "" },      // Local proxy URL or legacy remote URL
        publicId: { type: String, default: "" },    // Optional legacy Cloudinary public_id
        fileId: { type: String, default: "", index: true }, // MongoDB GridFS File ID as hex string
        pdfData: { type: String, default: "" },        // Base64 backup for small documents (< 2MB)
        fileSize: { type: Number, default: 0 },
        totalPages: { type: Number, default: 1 },
        lastPage: { type: Number, default: 1 },
        color: { type: String, default: "#6366f1" },
        notes: [NoteSchema],
    },
    { timestamps: true }
);

export const StudyPdf = models.StudyPdf || model("StudyPdf", StudyPdfSchema);
