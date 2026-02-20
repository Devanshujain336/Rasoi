import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ThumbsUp, Send, User, Pin, Clock, Plus, X, Lock, Eye, ChevronDown, ChevronRight, Trash2, PinIcon, UnlockIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const categoryColors = {
  general: "bg-primary/10 text-primary",
  suggestion: "bg-secondary/10 text-secondary",
  issue: "bg-destructive/10 text-destructive",
  announcement: "bg-accent/30 text-accent-foreground",
};

const categoryIcons = { general: "💬", suggestion: "💡", issue: "⚠️", announcement: "📢" };

const timeAgo = (ts) => {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─── New Post Modal ───────────────────────────────────────────────
const NewPostModal = ({ onClose, onCreated }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: "", content: "", category: "general" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setLoading(true); setError("");
    const { error } = await supabase.from("forum_posts").insert({ title: form.title, content: form.content, category: form.category, author_id: user.id });
    setLoading(false);
    if (error) setError(error.message);
    else { onCreated(); onClose(); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="bg-card rounded-2xl shadow-elevated border border-border w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-xl font-bold text-foreground">New Post</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
            <select value={form.category} onChange={set("category")}
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="general">💬 General</option>
              <option value="suggestion">💡 Suggestion</option>
              <option value="issue">⚠️ Issue/Complaint</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</label>
            <input value={form.title} onChange={set("title")} required maxLength={200}
              placeholder="What's your post about?" 
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <p className="text-right text-[10px] text-muted-foreground mt-1">{form.title.length}/200</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</label>
            <textarea value={form.content} onChange={set("content")} required maxLength={5000} rows={6}
              placeholder="Share your thoughts, suggestions, or concerns..."
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            <p className="text-right text-[10px] text-muted-foreground mt-1">{form.content.length}/5000</p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-warm text-primary-foreground text-sm font-semibold shadow-warm hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-60">
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ─── Comment ─────────────────────────────────────────────────────
const Comment = ({ comment, profiles, onReply, postLocked, user, isMHMC, onDelete, depth = 0 }) => {
  const [showReplies, setShowReplies] = useState(true);
  const author = profiles[comment.author_id];

  return (
    <div className={`${depth > 0 ? "ml-8 border-l-2 border-border pl-4" : ""}`}>
      <div className="bg-muted/40 rounded-xl p-4 mb-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-warm flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">{author?.full_name || "Student"}</span>
              {comment.is_edited && <span className="text-[10px] text-muted-foreground ml-1">(edited)</span>}
              <p className="text-[10px] text-muted-foreground">{timeAgo(comment.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!postLocked && depth < 3 && (
              <button onClick={() => onReply(comment.id)} className="text-[11px] text-primary hover:underline px-2 py-1">Reply</button>
            )}
            {(user?.id === comment.author_id || isMHMC) && (
              <button onClick={() => onDelete(comment.id)} className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-foreground">{comment.content}</p>
      </div>
      {comment.replies?.length > 0 && (
        <div>
          <button onClick={() => setShowReplies(!showReplies)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 ml-4">
            {showReplies ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
          </button>
          {showReplies && comment.replies.map((r) => (
            <Comment key={r.id} comment={r} profiles={profiles} onReply={onReply} postLocked={postLocked} user={user} isMHMC={isMHMC} onDelete={onDelete} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Post Detail ──────────────────────────────────────────────────
const PostDetail = ({ postId, onBack }) => {
  const { user, isMHMC } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, [postId]);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: postData }, { data: commentsData }] = await Promise.all([
      supabase.from("forum_posts").select("*").eq("id", postId).single(),
      supabase.from("forum_comments").select("*").eq("post_id", postId).is("parent_comment_id", null).order("created_at", { ascending: true }),
    ]);

    // Increment views
    if (postData) {
      supabase.from("forum_posts").update({ views_count: (postData.views_count || 0) + 1 }).eq("id", postId).then(() => {});
      setPost({ ...postData, views_count: (postData.views_count || 0) + 1 });
    }

    // Fetch replies for each comment
    if (commentsData) {
      const repliesData = await Promise.all(
        commentsData.map((c) => supabase.from("forum_comments").select("*").eq("parent_comment_id", c.id).order("created_at", { ascending: true }))
      );
      const withReplies = commentsData.map((c, i) => ({ ...c, replies: repliesData[i].data || [] }));
      setComments(withReplies);

      // Gather all author IDs
      const authorIds = new Set([postData?.author_id, ...commentsData.map((c) => c.author_id), ...repliesData.flatMap((r) => (r.data || []).map((rc) => rc.author_id))]);
      const { data: profilesData } = await supabase.from("profiles").select("user_id, full_name").in("user_id", [...authorIds].filter(Boolean));
      const profileMap = {};
      profilesData?.forEach((p) => (profileMap[p.user_id] = p));
      setProfiles(profileMap);
    }
    setLoading(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const { error } = await supabase.from("forum_comments").insert({ post_id: postId, content: newComment, author_id: user.id, parent_comment_id: replyTo || null });
    if (!error) { setNewComment(""); setReplyTo(null); fetchAll(); }
  };

  const handleDeleteComment = async (commentId) => {
    await supabase.from("forum_comments").delete().eq("id", commentId);
    fetchAll();
  };

  const handleTogglePin = async () => {
    await supabase.from("forum_posts").update({ is_pinned: !post.is_pinned }).eq("id", postId);
    setPost((p) => ({ ...p, is_pinned: !p.is_pinned }));
  };

  const handleToggleLock = async () => {
    await supabase.from("forum_posts").update({ is_locked: !post.is_locked }).eq("id", postId);
    setPost((p) => ({ ...p, is_locked: !p.is_locked }));
  };

  const handleDeletePost = async () => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("forum_posts").delete().eq("id", postId);
    onBack();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!post) return <div className="text-center py-20 text-muted-foreground">Post not found</div>;

  const author = profiles[post.author_id];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        ← Back to Forum
      </button>

      {/* Post */}
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border mb-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-warm flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{author?.full_name || "Student"}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
            </div>
          </div>
          {isMHMC && (
            <div className="flex items-center gap-2">
              <button onClick={handleTogglePin} title={post.is_pinned ? "Unpin" : "Pin"}
                className={`p-2 rounded-lg transition-colors ${post.is_pinned ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"}`}>
                <PinIcon className="w-4 h-4" />
              </button>
              <button onClick={handleToggleLock} title={post.is_locked ? "Unlock" : "Lock"}
                className={`p-2 rounded-lg transition-colors ${post.is_locked ? "bg-destructive/10 text-destructive" : "hover:bg-muted text-muted-foreground"}`}>
                {post.is_locked ? <UnlockIcon className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </button>
              <button onClick={handleDeletePost} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
          {!isMHMC && user?.id === post.author_id && (
            <button onClick={handleDeletePost} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {post.is_pinned && <span className="flex items-center gap-1 text-[10px] font-medium text-primary"><Pin className="w-3 h-3" />Pinned</span>}
          {post.is_locked && <span className="flex items-center gap-1 text-[10px] font-medium text-destructive"><Lock className="w-3 h-3" />Locked</span>}
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${categoryColors[post.category]}`}>
            {categoryIcons[post.category]} {post.category}
          </span>
        </div>

        <h2 className="font-display text-2xl font-bold text-foreground mb-3">{post.title}</h2>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.views_count} views</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{comments.length} comments</span>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
        <h3 className="font-display text-lg font-bold text-foreground mb-5">Comments ({comments.length})</h3>

        {!post.is_locked ? (
          <form onSubmit={handleAddComment} className="mb-6">
            {replyTo && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-t-xl border border-border border-b-0">
                <span>Replying to comment</span>
                <button type="button" onClick={() => setReplyTo(null)}><X className="w-3 h-3" /></button>
              </div>
            )}
            <div className="flex gap-2">
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={3} maxLength={2000}
                placeholder="Write a comment..."
                className={`flex-1 px-4 py-2.5 text-sm rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none ${replyTo ? "rounded-tl-none" : ""}`} />
              <button type="submit" disabled={!newComment.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-warm text-primary-foreground font-medium text-sm self-end disabled:opacity-40 hover:shadow-warm hover:scale-[1.02] transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive text-sm mb-6">
            <Lock className="w-4 h-4 flex-shrink-0" />
            This post is locked. No more comments allowed.
          </div>
        )}

        <div className="space-y-3">
          {comments.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
          )}
          {comments.map((c) => (
            <Comment key={c.id} comment={c} profiles={profiles} onReply={setReplyTo} postLocked={post.is_locked}
              user={user} isMHMC={isMHMC} onDelete={handleDeleteComment} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Forum Page ──────────────────────────────────────────────
const ForumPage = () => {
  const { user, isMHMC } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchPosts();
  }, [filter, sortBy, user]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase.from("forum_posts").select("*");
    if (filter !== "All") query = query.eq("category", filter.toLowerCase());
    if (sortBy === "recent") query = query.order("created_at", { ascending: false });
    else if (sortBy === "popular") query = query.order("views_count", { ascending: false });
    
    const { data } = await query;
    const sorted = (data || []).sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
    setPosts(sorted);

    if (sorted.length > 0) {
      const { data: profilesData } = await supabase.from("profiles").select("user_id, full_name").in("user_id", [...new Set(sorted.map((p) => p.author_id))]);
      const pm = {}; profilesData?.forEach((p) => (pm[p.user_id] = p));
      setProfiles(pm);
    }
    setLoading(false);
  };

  if (selectedPostId) return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <PostDetail postId={selectedPostId} onBack={() => { setSelectedPostId(null); fetchPosts(); }} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground">Community Forum</h1>
            <p className="text-muted-foreground mt-1">Discuss, suggest, and improve mess services together</p>
          </div>
          <button onClick={() => setShowNewPost(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-warm text-primary-foreground font-semibold text-sm shadow-warm hover:shadow-lg hover:scale-[1.02] transition-all">
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </motion.div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="flex flex-wrap gap-2 flex-1">
            {["All", "General", "Suggestion", "Issue", "Announcement"].map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === cat ? "bg-gradient-warm text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}>
                {categoryIcons[cat.toLowerCase()] || "🔍"} {cat}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted border border-border text-muted-foreground focus:outline-none">
            <option value="recent">Most Recent</option>
            <option value="popular">Most Views</option>
          </select>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No posts yet. Be the first to start a discussion!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedPostId(post.id)}
                className={`bg-card rounded-2xl p-5 shadow-card border transition-shadow cursor-pointer hover:shadow-elevated ${post.is_pinned ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-warm flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {post.is_pinned && <span className="flex items-center gap-1 text-[10px] font-medium text-primary"><Pin className="w-3 h-3" />Pinned</span>}
                      {post.is_locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${categoryColors[post.category]}`}>
                        {categoryIcons[post.category]} {post.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1 truncate">{post.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{profiles[post.author_id]?.full_name || "Student"}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(post.created_at)}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views_count}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showNewPost && (
          <NewPostModal onClose={() => setShowNewPost(false)} onCreated={fetchPosts} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForumPage;
