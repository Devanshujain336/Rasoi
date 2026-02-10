import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, ThumbsUp, Send, User, Pin, Clock } from "lucide-react";

const initialThreads = [
  { id: 1, title: "Can we get more South Indian options?", author: "Deepa M.", time: "2 hours ago", likes: 24, replies: 8, pinned: true, category: "Suggestion" },
  { id: 2, title: "Great improvement in dinner quality this week!", author: "Rohit K.", time: "5 hours ago", likes: 45, replies: 12, pinned: false, category: "Appreciation" },
  { id: 3, title: "Water dispenser on 3rd floor needs repair", author: "Amit S.", time: "1 day ago", likes: 18, replies: 5, pinned: false, category: "Issue" },
  { id: 4, title: "Suggestion: Weekend brunch buffet?", author: "Sneha R.", time: "2 days ago", likes: 67, replies: 23, pinned: true, category: "Suggestion" },
  { id: 5, title: "Hygiene audit results - February 2026", author: "MHMC Admin", time: "3 days ago", likes: 31, replies: 7, pinned: true, category: "Announcement" },
];

const categoryColors = {
  Suggestion: "bg-primary/10 text-primary",
  Appreciation: "bg-emerald/10 text-emerald",
  Issue: "bg-destructive/10 text-destructive",
  Announcement: "bg-accent/30 text-accent-foreground",
};

const ForumPage = () => {
  const [threads, setThreads] = useState(initialThreads);
  const [newPost, setNewPost] = useState("");
  const [filter, setFilter] = useState("All");

  const handlePost = () => {
    if (!newPost.trim()) return;
    setThreads([
      { id: Date.now(), title: newPost, author: "You", time: "Just now", likes: 0, replies: 0, pinned: false, category: "Suggestion" },
      ...threads,
    ]);
    setNewPost("");
  };

  const handleLike = (id) => {
    setThreads(threads.map(t => t.id === id ? { ...t, likes: t.likes + 1 } : t));
  };

  const filtered = filter === "All" ? threads : threads.filter(t => t.category === filter);

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Community Forum</h1>
          <p className="text-muted-foreground">Discuss, suggest, and collaborate to improve mess services</p>
        </motion.div>

        {/* New Post */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 shadow-card border border-border mb-6">
          <div className="flex gap-2">
            <input
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handlePost()}
              placeholder="Start a new discussion..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button onClick={handlePost} className="px-5 py-2.5 rounded-xl bg-gradient-warm text-primary-foreground font-medium text-sm">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["All", "Suggestion", "Appreciation", "Issue", "Announcement"].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === cat
                  ? "bg-gradient-warm text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Threads */}
        <div className="space-y-3">
          {filtered.map((thread, i) => (
            <motion.div
              key={thread.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-5 shadow-card border border-border hover:shadow-elevated transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-warm flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {thread.pinned && <Pin className="w-3 h-3 text-primary" />}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryColors[thread.category]}`}>
                      {thread.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{thread.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{thread.author}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{thread.time}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{thread.replies}</span>
                    <button onClick={() => handleLike(thread.id)} className="flex items-center gap-1 hover:text-primary transition-colors">
                      <ThumbsUp className="w-3 h-3" />{thread.likes}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
