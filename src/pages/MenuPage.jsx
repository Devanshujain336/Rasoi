import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, Plus, X, Send, Clock } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = ["Breakfast", "Lunch", "Dinner"];

const sampleMenu = {
  Monday: { Breakfast: "Poha, Chai, Banana", Lunch: "Dal, Rice, Roti, Aloo Gobi", Dinner: "Paneer Butter Masala, Naan, Salad" },
  Tuesday: { Breakfast: "Idli, Sambar, Chutney", Lunch: "Rajma, Rice, Roti, Raita", Dinner: "Chole, Bhature, Onion Salad" },
  Wednesday: { Breakfast: "Paratha, Curd, Pickle", Lunch: "Kadhi, Rice, Roti, Mix Veg", Dinner: "Dal Makhani, Jeera Rice, Salad" },
  Thursday: { Breakfast: "Upma, Chai, Boiled Egg", Lunch: "Sambar, Rice, Roti, Bhindi", Dinner: "Biryani, Raita, Gulab Jamun" },
  Friday: { Breakfast: "Bread, Butter, Omelette", Lunch: "Dal Fry, Rice, Roti, Palak", Dinner: "Chicken/Paneer Curry, Rice, Roti" },
  Saturday: { Breakfast: "Chole Bhature, Lassi", Lunch: "Aloo Matar, Rice, Roti, Papad", Dinner: "Pav Bhaji, Pulao, Ice Cream" },
  Sunday: { Breakfast: "Puri, Halwa, Chana", Lunch: "Special Thali - Assorted", Dinner: "Fried Rice, Manchurian, Soup" },
};

const samplePolls = [
  { id: 1, suggestion: "Masala Dosa for Sunday Breakfast", votes: 178, totalStudents: 250, by: "Rahul K.", daysLeft: 22 },
  { id: 2, suggestion: "Pasta Night every Wednesday", votes: 145, totalStudents: 250, by: "Priya S.", daysLeft: 18 },
  { id: 3, suggestion: "Fresh Fruit Salad with Lunch", votes: 198, totalStudents: 250, by: "Amit R.", daysLeft: 25 },
  { id: 4, suggestion: "South Indian Special on Saturdays", votes: 120, totalStudents: 250, by: "Deepa M.", daysLeft: 14 },
];

const MenuPage = () => {
  const [selectedCell, setSelectedCell] = useState(null);
  const [suggestion, setSuggestion] = useState("");
  const [polls, setPolls] = useState(samplePolls);
  const [suggestionsLeft, setSuggestionsLeft] = useState(2);

  const handleVote = (pollId) => {
    setPolls(polls.map(p => p.id === pollId ? { ...p, votes: p.votes + 1 } : p));
  };

  const handleSubmitSuggestion = () => {
    if (!suggestion.trim() || suggestionsLeft <= 0) return;
    const newPoll = {
      id: Date.now(),
      suggestion: suggestion,
      votes: 1,
      totalStudents: 250,
      by: "You",
      daysLeft: 30,
    };
    setPolls([newPoll, ...polls]);
    setSuggestion("");
    setSuggestionsLeft(suggestionsLeft - 1);
    setSelectedCell(null);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Weekly Menu</h1>
          <p className="text-muted-foreground">Click any meal to suggest alternatives • {suggestionsLeft} suggestions remaining this week</p>
        </motion.div>

        {/* Menu Grid */}
        <div className="overflow-x-auto mb-16">
          <div className="min-w-[700px]">
            {/* Header Row */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              <div className="p-3 font-semibold text-sm text-muted-foreground">Day</div>
              {MEALS.map(meal => (
                <div key={meal} className="p-3 font-semibold text-sm text-center text-muted-foreground">{meal}</div>
              ))}
            </div>
            {/* Data Rows */}
            {DAYS.map((day, di) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: di * 0.05 }}
                className="grid grid-cols-4 gap-2 mb-2"
              >
                <div className="p-3 rounded-xl bg-muted font-display font-semibold text-sm flex items-center text-foreground">
                  {day}
                </div>
                {MEALS.map(meal => {
                  const cellKey = `${day}-${meal}`;
                  const isSelected = selectedCell === cellKey;
                  return (
                    <motion.div
                      key={cellKey}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCell(isSelected ? null : cellKey)}
                      className={`p-3 rounded-xl cursor-pointer transition-all text-sm border ${
                        isSelected
                          ? "bg-primary/10 border-primary shadow-warm"
                          : "bg-card border-border hover:border-primary/30 shadow-card"
                      }`}
                    >
                      <p className="text-foreground font-medium">{sampleMenu[day][meal]}</p>
                    </motion.div>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Suggestion Box */}
        <AnimatePresence>
          {selectedCell && suggestionsLeft > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              className="max-w-lg mx-auto mb-16"
            >
              <div className="bg-card rounded-2xl p-6 shadow-elevated border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-foreground">
                    Suggest for {selectedCell.replace("-", " → ")}
                  </h3>
                  <button onClick={() => setSelectedCell(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={suggestion}
                    onChange={e => setSuggestion(e.target.value)}
                    placeholder="e.g., Masala Dosa with Coconut Chutney"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    onClick={handleSubmitSuggestion}
                    className="px-4 py-2.5 rounded-xl bg-gradient-warm text-primary-foreground font-medium text-sm hover:scale-105 transition-transform"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Polls */}
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">Active Polls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {polls.map((poll, i) => {
              const percent = Math.round((poll.votes / poll.totalStudents) * 100);
              const isHot = percent >= 70;
              return (
                <motion.div
                  key={poll.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl p-5 shadow-card border border-border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{poll.suggestion}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Suggested by {poll.by}</p>
                    </div>
                    {isHot && (
                      <span className="px-2 py-0.5 rounded-full bg-gradient-warm text-primary-foreground text-xs font-semibold">
                        🔥 Hot
                      </span>
                    )}
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-muted overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full rounded-full ${isHot ? "bg-gradient-warm" : "bg-gradient-emerald"}`}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{percent}%</span>
                      <span>{poll.votes}/{poll.totalStudents} votes</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {poll.daysLeft}d left</span>
                    </div>
                    <button
                      onClick={() => handleVote(poll.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" /> Vote
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
