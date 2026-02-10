import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ThumbsUp, Clock, CheckCircle, Vote } from "lucide-react";

const MenuCard = ({ day, meal, items, poll, suggestionsLeft, onCreatePoll, onVote, currentUserId }) => {
  const [expanded, setExpanded] = useState(false);
  const [suggestion, setSuggestion] = useState("");

  const handleSubmit = () => {
    if (!suggestion.trim() || suggestion.length > 100) return;
    onCreatePoll(day, meal, suggestion);
    setSuggestion("");
    setExpanded(false);
  };

  const hasVoted = poll?.votedBy?.includes(currentUserId);
  const percent = poll ? Math.round((poll.votes / poll.totalStudents) * 100) : 0;
  const isHot = percent >= 70;

  return (
    <>
      {/* Default card */}
      <motion.div
        layoutId={`card-${day}-${meal}`}
        onClick={() => setExpanded(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative cursor-pointer rounded-xl p-4 backdrop-blur-md bg-white/85 dark:bg-black/50 border border-white/20 shadow-card transition-shadow hover:shadow-elevated min-h-[150px]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">{meal}</span>
          {poll && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
              🗳️ Poll
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-foreground leading-relaxed line-clamp-3">{items}</p>
        {poll && (
          <div className="mt-3">
            <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1 }}
                className={`h-full rounded-full ${isHot ? "bg-gradient-warm" : "bg-gradient-emerald"}`}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{percent}% voted</p>
          </div>
        )}
      </motion.div>

      {/* Expanded modal */}
      <AnimatePresence>
        {expanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpanded(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[400px] max-h-[80vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-elevated p-6"
            >
              {/* Close */}
              <button
                onClick={() => setExpanded(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">{day} • {meal}</p>
                <h3 className="font-display text-xl font-bold text-foreground">Current Menu</h3>
              </div>

              {/* Current items */}
              <div className="bg-muted/50 rounded-xl p-4 mb-5">
                <ul className="space-y-1.5">
                  {items.split(",").map((item, i) => (
                    <li key={i} className="text-sm text-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {item.trim()}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Active poll section */}
              {poll && (
                <div className="mb-5 p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <p className="text-xs font-semibold text-primary mb-1">Active Poll</p>
                  <p className="text-sm font-semibold text-foreground mb-3">
                    Suggested: {poll.suggestion}
                  </p>
                  <div className="w-full h-3 rounded-full bg-muted overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full rounded-full ${isHot ? "bg-gradient-warm" : "bg-gradient-emerald"}`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="font-semibold text-foreground">{percent}% voted ({poll.votes}/{poll.totalStudents})</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {poll.daysLeft}d left</span>
                  </div>
                  {hasVoted ? (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/10 text-secondary text-sm font-medium">
                      <CheckCircle className="w-4 h-4" /> You voted for this
                    </div>
                  ) : (
                    <button
                      onClick={() => onVote(poll.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-warm text-primary-foreground text-sm font-semibold hover:scale-[1.02] transition-transform"
                    >
                      <ThumbsUp className="w-4 h-4" /> Vote for this suggestion
                    </button>
                  )}
                  {isHot && (
                    <p className="text-xs text-center mt-2 text-primary font-semibold">🔥 This poll crossed 70% — MHMC has been notified!</p>
                  )}
                </div>
              )}

              {/* Suggestion input */}
              {!poll && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Suggest a new item for this slot</p>
                  {suggestionsLeft > 0 ? (
                    <>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={suggestion}
                            onChange={e => setSuggestion(e.target.value.slice(0, 100))}
                            placeholder="e.g., Paneer Butter Masala"
                            className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                            {suggestion.length}/100
                          </span>
                        </div>
                        <button
                          onClick={handleSubmit}
                          disabled={!suggestion.trim()}
                          className="px-4 py-2.5 rounded-xl bg-gradient-warm text-primary-foreground font-medium text-sm hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{suggestionsLeft} suggestion(s) remaining this week</p>
                    </>
                  ) : (
                    <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                      You've used both suggestions this week. Resets next Monday.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MenuCard;
