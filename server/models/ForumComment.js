import mongoose from "mongoose";

const forumCommentSchema = new mongoose.Schema({
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: "ForumPost", required: true },
    author_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    parent_comment_id: { type: mongoose.Schema.Types.ObjectId, ref: "ForumComment", default: null },
    is_edited: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const ForumComment = mongoose.model("ForumComment", forumCommentSchema);
export default ForumComment;
