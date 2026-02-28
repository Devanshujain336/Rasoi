import express from "express";
import ForumPost from "../models/ForumPost.js";
import ForumComment from "../models/ForumComment.js";
import Profile from "../models/Profile.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/forum/posts?category=&search=
router.get("/posts", protect, async (req, res) => {
    try {
        const myProfile = await Profile.findOne({ user_id: req.user._id });
        const hostelFilter = myProfile?.hostel_id ? { hostel_id: myProfile.hostel_id } : {};

        let query = { ...hostelFilter };
        if (req.query.category) query.category = req.query.category;
        if (req.query.search) {
            const rx = new RegExp(req.query.search, "i");
            query.$or = [{ title: rx }, { content: rx }];
        }

        const posts = await ForumPost.find(query).sort({ is_pinned: -1, created_at: -1 });

        // Attach author names
        const authorIds = [...new Set(posts.map((p) => p.author_id.toString()))];
        const profiles = await Profile.find({ user_id: { $in: authorIds } }).select("user_id full_name");
        const nameMap = {};
        profiles.forEach((p) => { nameMap[p.user_id.toString()] = p.full_name; });

        const result = posts.map((p) => ({
            ...p.toObject(),
            author_name: nameMap[p.author_id.toString()] || "Unknown",
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/forum/posts
router.post("/posts", protect, async (req, res) => {
    try {
        const myProfile = await Profile.findOne({ user_id: req.user._id });
        if (!myProfile) return res.status(403).json({ error: "Profile not found." });
        if (myProfile.is_blocked) return res.status(403).json({ error: "You are blocked from posting." });

        const { title, content, category } = req.body;
        if (!title?.trim() || !content?.trim()) return res.status(400).json({ error: "Title and content are required." });

        const post = await ForumPost.create({
            author_id: req.user._id,
            hostel_id: myProfile.hostel_id,
            title: title.trim(),
            content: content.trim(),
            category: category || "general",
        });

        res.status(201).json({ ...post.toObject(), author_name: myProfile.full_name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/forum/posts/:id  (post + comments)
router.get("/posts/:id", protect, async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found." });

        // Increment view count (fire & forget)
        ForumPost.findByIdAndUpdate(req.params.id, { $inc: { views_count: 1 } }).exec();

        const topComments = await ForumComment.find({ post_id: req.params.id, parent_comment_id: null }).sort({ created_at: 1 });
        const replies = await ForumComment.find({ post_id: req.params.id, parent_comment_id: { $ne: null } }).sort({ created_at: 1 });

        // Attach author names
        const allIds = [post.author_id, ...topComments.map((c) => c.author_id), ...replies.map((c) => c.author_id)];
        const uniqueIds = [...new Set(allIds.map((id) => id.toString()))];
        const profileDocs = await Profile.find({ user_id: { $in: uniqueIds } }).select("user_id full_name");
        const nameMap = {};
        profileDocs.forEach((p) => { nameMap[p.user_id.toString()] = p.full_name; });

        const commentsWithReplies = topComments.map((c) => ({
            ...c.toObject(),
            author_name: nameMap[c.author_id.toString()] || "Unknown",
            replies: replies
                .filter((r) => r.parent_comment_id?.toString() === c._id.toString())
                .map((r) => ({ ...r.toObject(), author_name: nameMap[r.author_id.toString()] || "Unknown" })),
        }));

        res.json({
            post: { ...post.toObject(), author_name: nameMap[post.author_id.toString()] || "Unknown" },
            comments: commentsWithReplies,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/forum/posts/:id
router.patch("/posts/:id", protect, async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found." });

        const myProfile = await Profile.findOne({ user_id: req.user._id });
        const isMod = myProfile?.role === "mhmc" || myProfile?.role === "admin";
        const isAuthor = post.author_id.toString() === req.user._id.toString();

        if (!isAuthor && !isMod) return res.status(403).json({ error: "Not authorized." });

        const allowedFields = {};
        if (req.body.title !== undefined) allowedFields.title = req.body.title;
        if (req.body.content !== undefined) allowedFields.content = req.body.content;
        if (req.body.is_pinned !== undefined && isMod) allowedFields.is_pinned = req.body.is_pinned;
        if (req.body.is_locked !== undefined && isMod) allowedFields.is_locked = req.body.is_locked;
        allowedFields.updated_at = Date.now();

        const updated = await ForumPost.findByIdAndUpdate(req.params.id, allowedFields, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/forum/posts/:id
router.delete("/posts/:id", protect, async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found." });

        const myProfile = await Profile.findOne({ user_id: req.user._id });
        const isMod = myProfile?.role === "mhmc" || myProfile?.role === "admin";
        const isAuthor = post.author_id.toString() === req.user._id.toString();

        if (!isAuthor && !isMod) return res.status(403).json({ error: "Not authorized." });

        await ForumComment.deleteMany({ post_id: req.params.id });
        await ForumPost.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/forum/posts/:id/comments
router.post("/posts/:id/comments", protect, async (req, res) => {
    try {
        const myProfile = await Profile.findOne({ user_id: req.user._id });
        if (!myProfile) return res.status(403).json({ error: "Profile not found." });
        if (myProfile.is_blocked) return res.status(403).json({ error: "You are blocked from commenting." });

        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found." });
        if (post.is_locked) return res.status(403).json({ error: "This post is locked." });

        const { content, parent_comment_id } = req.body;
        if (!content?.trim()) return res.status(400).json({ error: "Content is required." });

        const comment = await ForumComment.create({
            post_id: req.params.id,
            author_id: req.user._id,
            content: content.trim(),
            parent_comment_id: parent_comment_id || null,
        });

        res.status(201).json({ ...comment.toObject(), author_name: myProfile.full_name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/forum/comments/:id
router.delete("/comments/:id", protect, async (req, res) => {
    try {
        const comment = await ForumComment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: "Comment not found." });

        const myProfile = await Profile.findOne({ user_id: req.user._id });
        const isMod = myProfile?.role === "mhmc" || myProfile?.role === "admin";
        const isAuthor = comment.author_id.toString() === req.user._id.toString();

        if (!isAuthor && !isMod) return res.status(403).json({ error: "Not authorized." });

        await ForumComment.deleteMany({ parent_comment_id: req.params.id });
        await ForumComment.findByIdAndDelete(req.params.id);
        res.json({ message: "Comment deleted." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
