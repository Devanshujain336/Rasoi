import { motion } from "framer-motion";
import { ThumbsUp, Clock, CheckCircle, TrendingUp } from "lucide-react";

const ActivePolls = ({ polls, onVote, currentUserId }) => {
  if (!polls.length) return null;

  return (
    <div className="mt-16">
      <h2 className="font-display text-2xl font-bold text-white text-center mb-8 drop-shadow-lg">
        Active Polls
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {polls.map((poll, i) => {
          const percent = Math.round((poll.votes / poll.totalStudents) * 100);
          const isHot = percent >= 70;
          const hasVoted = poll.votedBy?.includes(currentUserId);

          return (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="backdrop-blur-md bg-white/85 dark:bg-black/50 rounded-2xl p-5 border border-white/20 shadow-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{poll.suggestion}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {poll.day} • {poll.meal} — by {poll.by}
                  </p>
                </div>
                {isHot && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-gradient-warm text-primary-foreground text-xs font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> 70%+
                  </span>
                )}
              </div>

              <div className="w-full h-3 rounded-full bg-muted/50 overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1, delay: i * 0.08 }}
                  className={`h-full rounded-full ${isHot ? "bg-gradient-warm" : "bg-gradient-emerald"}`}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{percent}%</span>
                  <span>{poll.votes}/{poll.totalStudents}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {poll.daysLeft}d</span>
                </div>
                {hasVoted ? (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-xs font-medium">
                    <CheckCircle className="w-3 h-3" /> Voted
                  </span>
                ) : (
                  <button
                    onClick={() => onVote(poll.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                  >
                    <ThumbsUp className="w-3 h-3" /> Vote
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivePolls;
