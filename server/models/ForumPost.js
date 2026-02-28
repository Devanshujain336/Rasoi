import mongoose from "mongoose";

const forumPostSchema = new mongoose.Schema({
    author_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hostel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel", default: null },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
        type: String,
        enum: ["general", "suggestion", "issue", "announcement"],
        default: "general",
    },
    is_pinned: { type: Boolean, default: false },
    is_locked: { type: Boolean, default: false },
    views_count: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

forumPostSchema.pre("save", function () {
    this.updated_at = Date.now();
});

const ForumPost = mongoose.model("ForumPost", forumPostSchema);
export default ForumPost;
