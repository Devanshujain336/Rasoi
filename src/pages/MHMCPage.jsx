import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed, Vote, History, BarChart3, ChevronLeft, ChevronRight,
  Edit3, X, Plus, Trash2, Save, ThumbsUp, Trophy, Clock, CheckCircle,
  Filter, ArrowDownWideNarrow, PartyPopper, AlertCircle, Eye
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = ["Breakfast", "Lunch", "Dinner"];

const initialMenu = {
  Monday: { Breakfast: ["Poha", "Chai", "Banana"], Lunch: ["Dal", "Rice", "Roti", "Aloo Gobi"], Dinner: ["Paneer Butter Masala", "Naan", "Salad"] },
  Tuesday: { Breakfast: ["Idli", "Sambar", "Chutney"], Lunch: ["Rajma", "Rice", "Roti", "Raita"], Dinner: ["Chole", "Bhature", "Onion Salad"] },
  Wednesday: { Breakfast: ["Paratha", "Curd", "Pickle"], Lunch: ["Kadhi", "Rice", "Roti", "Mix Veg"], Dinner: ["Dal Makhani", "Jeera Rice", "Salad"] },
  Thursday: { Breakfast: ["Upma", "Chai", "Boiled Egg"], Lunch: ["Sambar", "Rice", "Roti", "Bhindi"], Dinner: ["Biryani", "Raita", "Gulab Jamun"] },
  Friday: { Breakfast: ["Bread", "Butter", "Omelette"], Lunch: ["Dal Fry", "Rice", "Roti", "Palak"], Dinner: ["Chicken/Paneer Curry", "Rice", "Roti"] },
  Saturday: { Breakfast: ["Chole Bhature", "Lassi"], Lunch: ["Aloo Matar", "Rice", "Roti", "Papad"], Dinner: ["Pav Bhaji", "Pulao", "Ice Cream"] },
  Sunday: { Breakfast: ["Puri", "Halwa", "Chana"], Lunch: ["Special Thali", "Assorted"], Dinner: ["Fried Rice", "Manchurian", "Soup"] },
};

const initialPolls = [
  { id: 1, suggestion: "Masala Dosa for Sunday Breakfast", day: "Sunday", meal: "Breakfast", votes: 178, totalStudents: 250, by: "Rahul K.", daysLeft: 22, status: "active", createdAt: "2026-01-23" },
  { id: 2, suggestion: "Pasta Night every Wednesday", day: "Wednesday", meal: "Dinner", votes: 145, totalStudents: 250, by: "Priya S.", daysLeft: 18, status: "active", createdAt: "2026-01-27" },
  { id: 3, suggestion: "Fresh Fruit Salad with Lunch", day: "Friday", meal: "Lunch", votes: 198, totalStudents: 250, by: "Amit R.", daysLeft: 25, status: "active", createdAt: "2026-01-20" },
  { id: 4, suggestion: "South Indian Special on Saturdays", day: "Saturday", meal: "Lunch", votes: 120, totalStudents: 250, by: "Deepa M.", daysLeft: 14, status: "active", createdAt: "2026-02-01" },
  { id: 5, suggestion: "Chocolate Shake for Friday Dinner", day: "Friday", meal: "Dinner", votes: 190, totalStudents: 250, by: "Neha T.", daysLeft: 0, status: "expired", createdAt: "2025-12-15" },
  { id: 6, suggestion: "Veg Biryani for Monday Lunch", day: "Monday", meal: "Lunch", votes: 200, totalStudents: 250, by: "Sanjay P.", daysLeft: 0, status: "approved", createdAt: "2025-12-20", approvedBy: "Admin", implementationMonth: "February 2026" },
];

const NAV = [
  { key: "editor", label: "Menu Editor", icon: UtensilsCrossed },
  { key: "polls", label: "Active Polls", icon: Vote },
  { key: "history", label: "Poll History", icon: History },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

const MHMCPage = () => {
  const [tab, setTab] = useState("editor");
  const [collapsed, setCollapsed] = useState(false);
  const [menu, setMenu] = useState(initialMenu);
  const [polls, setPolls] = useState(initialPolls);
  const [editModal, setEditModal] = useState(null);
  const [pollDetail, setPollDetail] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/menu", { withCredentials: true });
      if (res.data.menu) setMenu(res.data.menu);
      if (res.data.polls) setPolls(res.data.polls);
    } catch (error) {
      console.error("Error fetching menu data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen pt-16 flex justify-center items-center">Loading...</div>;
  }

  const activePolls = polls.filter(p => p.status === "active");
  const hotCount = activePolls.filter(p => (p.votes / p.totalStudents) * 100 >= 70).length;

  return (
    <div className="min-h-screen pt-16 bg-background flex">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        className="fixed left-0 top-16 bottom-0 z-30 bg-sidebar border-r border-sidebar-border flex flex-col"
      >
        <div className="flex items-center justify-end p-2">
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {NAV.map(n => {
            const active = tab === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-warm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
              >
                <n.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{n.label}</span>}
                {!collapsed && n.key === "polls" && hotCount > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{hotCount}</span>
                )}
              </button>
            );
          })}
        </nav>
      </motion.aside>

      {/* Main */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-16" : "ml-60"}`}>
        <div className="p-6 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {tab === "editor" && (
              <MenuEditor key="editor" menu={menu} setMenu={setMenu} editModal={editModal} setEditModal={setEditModal} polls={activePolls} />
            )}
            {tab === "polls" && (
              <ActivePollsTab
                key="active-polls"
                polls={polls}
                setPolls={setPolls}
                pollDetail={pollDetail}
                setPollDetail={setPollDetail}
                setShowConfetti={setShowConfetti}
                onUpdate={fetchData}
              />
            )}{tab === "history" && (
              <PollHistoryTab key="history" polls={polls.filter(p => p.status !== "active")} />
            )}
            {tab === "analytics" && (
              <AnalyticsTab key="analytics" polls={polls} menu={menu} />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Confetti overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-6xl">
              🎉
            </motion.div>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: 0, opacity: 1 }}
                animate={{
                  y: [0, Math.random() * 600 + 200],
                  x: [(Math.random() - 0.5) * 400, (Math.random() - 0.5) * 600],
                  opacity: [1, 0],
                  rotate: Math.random() * 720,
                }}
                transition={{ duration: 1.5 + Math.random(), ease: "easeOut" }}
                className="absolute top-1/3 text-2xl"
              >
                {["🎊", "✨", "🥳", "🎉", "⭐"][i % 5]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ===== MENU EDITOR ===== */
const MenuEditor = ({ menu, setMenu, editModal, setEditModal, polls }) => {
  const [editItems, setEditItems] = useState([]);

  const openEdit = (day, meal) => {
    setEditItems([...menu[day][meal]]);
    setEditModal({ day, meal });
  };

  const saveEdit = async () => {
    if (!editModal) return;
    const updatedMenu = {
      ...menu,
      [editModal.day]: { ...menu[editModal.day], [editModal.meal]: editItems.filter(i => i.trim()) },
    };
    try {
      await axios.put("http://localhost:3001/api/menu", { data: updatedMenu }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setMenu(updatedMenu);
      setEditModal(null);
    } catch (error) {
      console.error("Failed to update menu", error);
    }
  };

  const hasPoll = (day, meal) => polls.some(p => p.day === day && p.meal === meal);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h1 className="font-display text-3xl font-bold text-foreground mb-1">Menu Editor</h1>
      <p className="text-muted-foreground text-sm mb-6">Edit weekly mess menu — click any cell to modify items</p>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header */}
          <div className="grid grid-cols-[100px_1fr_1fr_1fr] gap-2 mb-2">
            <div />
            {MEALS.map(m => (
              <div key={m} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">{m}</div>
            ))}
          </div>
          {/* Rows */}
          {DAYS.map(day => (
            <div key={day} className="grid grid-cols-[100px_1fr_1fr_1fr] gap-2 mb-2">
              <div className="flex items-center px-3 py-2 rounded-xl bg-muted">
                <span className="font-display font-bold text-xs text-foreground">{day}</span>
              </div>
              {MEALS.map(meal => (
                <div
                  key={`${day}-${meal}`}
                  onClick={() => openEdit(day, meal)}
                  className="group relative cursor-pointer rounded-xl p-3 bg-card border border-border hover:border-primary/40 hover:shadow-card transition-all min-h-[100px]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold uppercase text-primary tracking-wider">{meal}</span>
                    <Edit3 className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <ul className="space-y-0.5">
                    {menu[day][meal].map((item, i) => (
                      <li key={i} className="text-xs text-foreground">{item}</li>
                    ))}
                  </ul>
                  {hasPoll(day, meal) && (
                    <span className="absolute top-2 right-2 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">🗳️</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditModal(null)} className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-card border border-border rounded-2xl shadow-elevated p-6"
            >
              <button onClick={() => setEditModal(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              <p className="text-xs font-semibold uppercase text-primary mb-1">{editModal.day} • {editModal.meal}</p>
              <h3 className="font-display text-xl font-bold text-foreground mb-4">Edit Menu Items</h3>
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {editItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={item}
                      onChange={e => setEditItems(prev => prev.map((it, idx) => idx === i ? e.target.value : it))}
                      className="flex-1 px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button onClick={() => setEditItems(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => setEditItems(prev => [...prev, ""])} className="flex items-center gap-2 text-sm text-primary font-medium mb-4 hover:underline">
                <Plus className="w-4 h-4" /> Add item
              </button>
              <div className="flex gap-2">
                <button onClick={() => setEditModal(null)} className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-muted-foreground font-medium text-sm">Cancel</button>
                <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-warm text-primary-foreground font-semibold text-sm hover:scale-[1.02] transition-transform">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ===== ACTIVE POLLS ===== */
const ActivePollsTab = ({ polls, setPolls, pollDetail, setPollDetail, setShowConfetti, onUpdate }) => {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("percent");

  let filtered = filter === "hot" ? polls.filter(p => (p.votes / p.totalStudents) * 100 >= 70) : polls;
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "percent") return (b.votes / b.totalStudents) - (a.votes / a.totalStudents);
    return b.daysLeft - a.daysLeft;
  });

  const handleApprove = async (pollId) => {
    try {
      await axios.put(`http://localhost:3001/api/menu/polls/${pollId}/status`, { status: "approved" }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setPollDetail(null);
      // Wait a tiny bit for the confetti to be visible
      setTimeout(onUpdate, 500);
    } catch (error) {
      console.error("Failed to approve", error);
    }
  };

  const handleReject = async (pollId) => {
    try {
      await axios.put(`http://localhost:3001/api/menu/polls/${pollId}/status`, { status: "rejected" }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setPollDetail(null);
      onUpdate();
    } catch (error) {
      console.error("Failed to reject", error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Active Polls</h1>
          <p className="text-muted-foreground text-sm">{polls.length} active polls • {polls.filter(p => (p.votes / p.totalStudents) * 100 >= 70).length} crossed 70% threshold</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter(f => f === "all" ? "hot" : "all")} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${filter === "hot" ? "bg-gradient-warm text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            <Filter className="w-3.5 h-3.5" /> {filter === "hot" ? "🔥 Hot Only" : "All Polls"}
          </button>
          <button onClick={() => setSortBy(s => s === "percent" ? "date" : "percent")} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-all">
            <ArrowDownWideNarrow className="w-3.5 h-3.5" /> {sortBy === "percent" ? "By Votes" : "By Date"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((poll, i) => {
          const pct = Math.round((poll.votes / poll.totalStudents) * 100);
          const isHot = pct >= 70;
          return (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-card rounded-2xl p-5 border transition-all cursor-pointer hover:shadow-card ${isHot ? "border-primary/30" : "border-border"}`}
              onClick={() => setPollDetail(poll)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-base font-semibold text-foreground">{poll.suggestion}</h3>
                    {isHot && <span className="text-xs bg-primary/15 text-primary font-bold px-2 py-0.5 rounded-full">🔥 70%+</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{poll.day} • {poll.meal} • by {poll.by}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {poll.daysLeft}d left
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${isHot ? "bg-gradient-warm" : "bg-gradient-emerald"}`}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground whitespace-nowrap">{pct}% ({poll.votes}/{poll.totalStudents})</span>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Vote className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No polls match this filter.</p>
          </div>
        )}
      </div>

      {/* Poll Detail Modal */}
      <AnimatePresence>
        {pollDetail && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPollDetail(null)} className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg bg-card border border-border rounded-2xl shadow-elevated p-6"
            >
              <button onClick={() => setPollDetail(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              <p className="text-xs font-semibold uppercase text-primary mb-1">{pollDetail.day} • {pollDetail.meal}</p>
              <h3 className="font-display text-xl font-bold text-foreground mb-1">{pollDetail.suggestion}</h3>
              <p className="text-sm text-muted-foreground mb-4">Suggested by {pollDetail.by} • Created {pollDetail.createdAt}</p>

              <div className="p-4 rounded-xl bg-muted/50 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">{Math.round((pollDetail.votes / pollDetail.totalStudents) * 100)}% approval</span>
                  <span className="text-xs text-muted-foreground">{pollDetail.votes}/{pollDetail.totalStudents} students</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(pollDetail.votes / pollDetail.totalStudents) * 100}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${(pollDetail.votes / pollDetail.totalStudents) * 100 >= 70 ? "bg-gradient-warm" : "bg-gradient-emerald"}`}
                  />
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {pollDetail.daysLeft} days remaining
                </div>
              </div>

              {(pollDetail.votes / pollDetail.totalStudents) * 100 >= 70 && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary font-medium mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> This poll has crossed the 70% threshold — eligible for next month's menu!
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleReject(pollDetail.id)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive font-medium text-sm hover:bg-destructive/20 transition-colors"
                >
                  Reject
                </button>
                <button className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-muted-foreground font-medium text-sm hover:text-foreground transition-colors" onClick={() => setPollDetail(null)}>
                  Keep Active
                </button>
                {(pollDetail.votes / pollDetail.totalStudents) * 100 >= 70 && (
                  <button
                    onClick={() => handleApprove(pollDetail.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-warm text-primary-foreground font-semibold text-sm hover:scale-[1.02] transition-transform"
                  >
                    <PartyPopper className="w-4 h-4" /> Approve
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ===== POLL HISTORY ===== */
const PollHistoryTab = ({ polls }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h1 className="font-display text-3xl font-bold text-foreground mb-1">Poll History</h1>
      <p className="text-muted-foreground text-sm mb-6">Past polls — approved, rejected, and expired</p>

      {polls.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No poll history yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {polls.map((poll, i) => {
            const pct = Math.round((poll.votes / poll.totalStudents) * 100);
            const statusColors = {
              approved: "bg-secondary/15 text-secondary",
              rejected: "bg-destructive/15 text-destructive",
              expired: "bg-muted text-muted-foreground",
            };
            return (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-5 border border-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-display text-base font-semibold text-foreground mb-0.5">{poll.suggestion}</h3>
                    <p className="text-xs text-muted-foreground">{poll.day} • {poll.meal} • by {poll.by}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColors[poll.status] || ""}`}>
                    {poll.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 70 ? "bg-gradient-warm" : "bg-gradient-emerald"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{pct}%</span>
                </div>
                {poll.status === "approved" && poll.implementationMonth && (
                  <p className="text-xs text-secondary mt-2 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Added to {poll.implementationMonth} menu</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

/* ===== ANALYTICS ===== */
const AnalyticsTab = ({ polls, menu }) => {
  const totalPolls = polls.length;
  const approved = polls.filter(p => p.status === "approved").length;
  const rejected = polls.filter(p => p.status === "rejected").length;
  const expired = polls.filter(p => p.status === "expired").length;
  const active = polls.filter(p => p.status === "active").length;
  const avgVotes = totalPolls > 0 ? Math.round(polls.reduce((s, p) => s + p.votes, 0) / totalPolls) : 0;
  const totalMenuItems = DAYS.reduce((s, d) => s + MEALS.reduce((s2, m) => s2 + menu[d][m].length, 0), 0);

  const stats = [
    { label: "Total Polls", value: totalPolls, color: "bg-primary/15 text-primary" },
    { label: "Active", value: active, color: "bg-secondary/15 text-secondary" },
    { label: "Approved", value: approved, color: "bg-gradient-warm text-primary-foreground" },
    { label: "Rejected", value: rejected, color: "bg-destructive/15 text-destructive" },
    { label: "Expired", value: expired, color: "bg-muted text-muted-foreground" },
    { label: "Avg Votes", value: avgVotes, color: "bg-accent/15 text-accent-foreground" },
  ];

  // Meal distribution
  const mealDist = {};
  polls.forEach(p => { mealDist[p.meal] = (mealDist[p.meal] || 0) + 1; });

  // Day distribution
  const dayDist = {};
  polls.forEach(p => { dayDist[p.day] = (dayDist[p.day] || 0) + 1; });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h1 className="font-display text-3xl font-bold text-foreground mb-1">Analytics</h1>
      <p className="text-muted-foreground text-sm mb-6">Overview of menu and poll statistics</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold font-display">{s.value}</p>
            <p className="text-xs font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts area */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Polls by Meal */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Polls by Meal Type</h3>
          <div className="space-y-3">
            {MEALS.map(m => {
              const count = mealDist[m] || 0;
              const max = Math.max(...Object.values(mealDist), 1);
              return (
                <div key={m}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{m}</span>
                    <span className="text-muted-foreground">{count} polls</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(count / max) * 100}%` }} transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-warm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Polls by Day */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Polls by Day</h3>
          <div className="space-y-3">
            {DAYS.map(d => {
              const count = dayDist[d] || 0;
              const max = Math.max(...Object.values(dayDist), 1);
              return (
                <div key={d}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{d}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(count / max) * 100}%` }} transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-emerald" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-card rounded-2xl p-5 border border-border">
        <h3 className="font-display text-lg font-semibold text-foreground mb-3">Menu Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold font-display text-foreground">{totalMenuItems}</p>
            <p className="text-xs text-muted-foreground">Total Menu Items</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-foreground">21</p>
            <p className="text-xs text-muted-foreground">Meal Slots</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-foreground">{approved}</p>
            <p className="text-xs text-muted-foreground">Student-Sourced Items</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MHMCPage;
