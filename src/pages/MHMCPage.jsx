import { useState } from "react";
import { motion } from "framer-motion";
import { Vote, User, Award, ChevronRight, ThumbsUp, Trophy } from "lucide-react";

const floors = [1, 2, 3, 4, 5];

const candidates = {
  1: [
    { id: 1, name: "Vikram Singh", bio: "Final year CS student passionate about mess reform", manifesto: "Better quality ingredients, transparent billing, weekly feedback sessions", votes: 34 },
    { id: 2, name: "Ananya Gupta", bio: "Active sports player who understands nutrition", manifesto: "Protein-rich meals, sports diet options, healthier snack alternatives", votes: 28 },
    { id: 3, name: "Rohan Mehta", bio: "Previous mess volunteer with management experience", manifesto: "Cost optimization without quality compromise, digital-first approach", votes: 22 },
  ],
  2: [
    { id: 4, name: "Sneha Reddy", bio: "Foodie and event organizer", manifesto: "Monthly food festivals, diverse cuisines, student chef nights", votes: 41 },
    { id: 5, name: "Karan Joshi", bio: "Eco-conscious engineering student", manifesto: "Zero food waste initiative, sustainable packaging, composting program", votes: 38 },
  ],
  3: [
    { id: 6, name: "Meera Nair", bio: "Health-conscious BBA student", manifesto: "Calorie-counted meals, allergy-safe options, clean kitchen audits", votes: 30 },
    { id: 7, name: "Aditya Patel", bio: "Tech enthusiast who loves cooking", manifesto: "App-based feedback, automated menu suggestions, smart inventory", votes: 35 },
  ],
};

const MHMCPage = () => {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [votedFor, setVotedFor] = useState(null);
  const [floorCandidates, setFloorCandidates] = useState(candidates);

  const handleVote = (candidateId) => {
    if (votedFor) return;
    setVotedFor(candidateId);
    setFloorCandidates(prev => ({
      ...prev,
      [selectedFloor]: prev[selectedFloor].map(c =>
        c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
      ),
    }));
  };

  const currentCandidates = floorCandidates[selectedFloor] || [];
  const maxVotes = Math.max(...currentCandidates.map(c => c.votes), 1);

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">MHMC Elections</h1>
          <p className="text-muted-foreground">Choose your mess representatives — democracy in dining!</p>
        </motion.div>

        {/* Floor Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {floors.map(floor => (
            <button
              key={floor}
              onClick={() => { setSelectedFloor(floor); setVotedFor(null); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedFloor === floor
                  ? "bg-gradient-warm text-primary-foreground shadow-warm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Floor {floor}
            </button>
          ))}
        </div>

        {/* Candidates */}
        <div className="space-y-4">
          {currentCandidates.map((candidate, i) => {
            const isLeading = candidate.votes === maxVotes;
            const isVoted = votedFor === candidate.id;
            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-card rounded-2xl p-6 shadow-card border transition-all ${
                  isVoted ? "border-primary shadow-warm" : "border-border"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-warm flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-lg font-semibold text-foreground">{candidate.name}</h3>
                      {isLeading && <Trophy className="w-4 h-4 text-accent" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{candidate.bio}</p>
                    <div className="p-3 rounded-xl bg-muted/50 mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Manifesto</p>
                      <p className="text-sm text-foreground">{candidate.manifesto}</p>
                    </div>
                    {/* Vote Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(candidate.votes / maxVotes) * 100}%` }}
                          transition={{ duration: 1 }}
                          className="h-full rounded-full bg-gradient-warm"
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{candidate.votes} votes</span>
                      <button
                        onClick={() => handleVote(candidate.id)}
                        disabled={!!votedFor}
                        className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                          isVoted
                            ? "bg-primary text-primary-foreground"
                            : votedFor
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" /> {isVoted ? "Voted!" : "Vote"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {currentCandidates.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Vote className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No candidates registered for this floor yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MHMCPage;
