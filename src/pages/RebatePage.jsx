/**
 * RebatePage.jsx
 * 
 * @description React Page Component: RebatePage.
 * @usage Rendered by react-router-dom as a full-page view.
 * @details Contains multi-day rebate management AND the new per-meal skip feature.
 *          Students can skip individual meals (BF/Lunch/Dinner) up to 3 hrs before mealtime.
 *          Munimji/Admin see a live head-count report per meal.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, FileText, Check, Clock, AlertCircle, XCircle,
  Coffee, Sun, Moon, Users, ChevronDown, ChevronUp, Ban
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

const statusConfig = {
  approved: { color: "text-emerald bg-emerald/10", icon: Check, label: "Approved" },
  pending: { color: "text-primary bg-primary/10", icon: Clock, label: "Pending" },
  rejected: { color: "text-destructive bg-destructive/10", icon: AlertCircle, label: "Rejected" },
};

// ---------- MEAL CONFIG ----------
const MEALS = [
  {
    key: "breakfast",
    label: "Breakfast",
    time: "8:00 AM",
    deadline: "5:00 AM",
    deadlineHour: 5,
    icon: Coffee,
    emoji: "☕",
    gradient: "from-amber-400 to-orange-300",
    bg: "bg-amber-50",
    border: "border-amber-200",
    activeBg: "bg-amber-500",
  },
  {
    key: "lunch",
    label: "Lunch",
    time: "1:00 PM",
    deadline: "10:00 AM",
    deadlineHour: 10,
    icon: Sun,
    emoji: "🍛",
    gradient: "from-green-400 to-emerald-300",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    activeBg: "bg-emerald-500",
  },
  {
    key: "dinner",
    label: "Dinner",
    time: "8:00 PM",
    deadline: "5:00 PM",
    deadlineHour: 17,
    icon: Moon,
    emoji: "🥘",
    gradient: "from-indigo-400 to-blue-400",
    bg: "bg-blue-50",
    border: "border-blue-200",
    activeBg: "bg-blue-500",
  },
];

const nowISTHour = () => {
  // Current IST hour (UTC+5:30)
  const nowUTC = new Date();
  const istMs = nowUTC.getTime() + 5.5 * 60 * 60 * 1000;
  return new Date(istMs).getUTCHours();
};

// ---------- MEAL SKIP CARD (student view) ----------
const MealSkipCard = ({ meal, skip, onToggle, loading }) => {
  const hourIST = nowISTHour();
  const isOpen = hourIST < meal.deadlineHour;
  const isSkipped = !!skip;
  const MealIcon = meal.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl p-5 border-2 transition-all overflow-hidden
        ${isSkipped
          ? "border-primary bg-primary/5 shadow-md"
          : isOpen
            ? `${meal.border} ${meal.bg} hover:shadow-md`
            : "border-border bg-muted/30 opacity-60"}`}
    >
      {/* Decorative gradient blob */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${meal.gradient} opacity-20 blur-2xl`} />

      <div className="flex items-center gap-4 relative z-10">
        <div className={`text-4xl select-none`}>{meal.emoji}</div>
        <div className="flex-1">
          <p className="font-display font-bold text-lg text-foreground">{meal.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Served at <span className="font-semibold">{meal.time}</span>
            {" · "}
            {isOpen
              ? <span className="text-emerald font-semibold">Submit by {meal.deadline}</span>
              : <span className="text-destructive font-semibold">Window closed</span>}
          </p>
        </div>

        <button
          disabled={!isOpen || loading}
          onClick={() => onToggle(meal, skip)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
            ${!isOpen
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : isSkipped
                ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                : `bg-gradient-to-r ${meal.gradient} text-white shadow-sm hover:scale-105 active:scale-95`}`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isSkipped ? (
            <><XCircle className="w-4 h-4" /> Cancel</>
          ) : (
            <><Check className="w-4 h-4" /> Skip</>
          )}
        </button>
      </div>

      {isSkipped && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 pt-3 border-t border-primary/20 flex items-center gap-2 text-primary text-xs font-semibold"
        >
          <Check className="w-3.5 h-3.5" />
          Marked as skipped — deduction will reflect in your bill
        </motion.div>
      )}
    </motion.div>
  );
};

// ---------- MUNIMJI HEAD-COUNT TABLE ----------
const HeadcountView = ({ data, loading }) => {
  const [expanded, setExpanded] = useState(null);

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const meal = MEALS.find(m => m.key === item.meal);
        const isExp = expanded === item.meal;
        return (
          <motion.div
            key={item.meal}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border-2 overflow-hidden ${meal.border} ${meal.bg}`}
          >
            <button
              onClick={() => setExpanded(isExp ? null : item.meal)}
              className="w-full flex items-center justify-between p-5"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{meal.emoji}</span>
                <div className="text-left">
                  <p className="font-display font-bold text-foreground">{meal.label}</p>
                  <p className="text-xs text-muted-foreground">Served at {meal.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/50">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-black text-lg text-foreground">{item.count}</span>
                  <span className="text-xs text-muted-foreground font-medium">skipping</span>
                </div>
                {isExp ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>

            <AnimatePresence>
              {isExp && item.students.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/40"
                >
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.students.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/60 rounded-xl px-3 py-2.5 border border-white/50">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center text-xs font-bold text-primary">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground">Roll: {s.roll} · Room: {s.room}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              {isExp && item.students.length === 0 && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-5 pb-5 text-sm text-muted-foreground border-t border-white/40 pt-4"
                >
                  No students have skipped {meal.label} today.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

// ---------- MAIN PAGE ----------
const RebatePage = () => {
  const { user, role } = useAuth();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [rebates, setRebates] = useState([]);
  const [allRebates, setAllRebates] = useState([]);
  const [mealSkips, setMealSkips] = useState([]);
  const [todaySkips, setTodaySkips] = useState([]);
  const [loadingRebates, setLoadingRebates] = useState(true);
  const [loadingSkips, setLoadingSkips] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mealLoading, setMealLoading] = useState(null); // which meal is loading
  const [tab, setTab] = useState("skip"); // 'my' | 'all' | 'skip' | 'skipAdmin'

  const isAdmin = ["admin", "mhmc", "munimji"].includes(role);

  useEffect(() => {
    fetchRebates();
    fetchMealSkips();
    if (isAdmin) {
      fetchAllRebates();
      fetchTodaySkips();
    }
  }, [isAdmin]);

  const fetchAllRebates = async () => {
    try { setAllRebates(await api.getAllRebates() || []); } catch (err) { console.error(err); }
  };

  const fetchRebates = async () => {
    try {
      setRebates(await api.getMyRebates() || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRebates(false);
    }
  };

  const fetchMealSkips = async () => {
    try {
      setMealSkips(await api.getMealSkips() || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTodaySkips = async () => {
    setLoadingSkips(true);
    try {
      setTodaySkips(await api.getTodayMealSkips() || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSkips(false);
    }
  };

  // Find today's skip for a given meal key
  const todayStr = new Date().toISOString().split("T")[0];
  const getTodaySkip = (mealKey) =>
    mealSkips.find(s => s.meal === mealKey && s.date?.startsWith(todayStr));

  const handleMealToggle = async (meal, existingSkip) => {
    setMealLoading(meal.key);
    try {
      if (existingSkip) {
        await api.cancelMealSkip(existingSkip._id);
      } else {
        await api.submitMealSkip(meal.key);
      }
      await fetchMealSkips();
    } catch (err) {
      alert(err.message);
    } finally {
      setMealLoading(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) return;
    setSubmitting(true);
    try {
      await api.applyRebate({ from_date: fromDate, to_date: toDate, reason });
      setFromDate(""); setToDate(""); setReason("");
      setSubmitted(true);
      fetchRebates();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Count today's skipped meals for the student badge
  const todaySkipCount = MEALS.filter(m => getTodaySkip(m.key)).length;

  return (
    <div className="min-h-screen pt-20 md:pb-12 pb-[85px] bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Rebate & Meal Skip</h1>
          <p className="text-muted-foreground">Mark meals you'll skip · Manage multi-day absences</p>
        </motion.div>

        {/* TAB BAR */}
        <div className="flex border-b border-border mb-8 overflow-x-auto">
          <button onClick={() => setTab("skip")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap px-2 ${tab === "skip" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            Skip Meals
            {todaySkipCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {todaySkipCount}
              </span>
            )}
          </button>
          <button onClick={() => setTab("my")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap px-2 ${tab === "my" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            Multi-Day Rebate
          </button>
          {isAdmin && (
            <>
              <button onClick={() => setTab("skipAdmin")}
                className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap px-2 ${tab === "skipAdmin" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
                Today's Head-Count
              </button>
              <button onClick={() => setTab("all")}
                className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap px-2 ${tab === "all" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
                All Rebates
              </button>
            </>
          )}
        </div>

        <AnimatePresence mode="wait">

          {/* ====== SKIP MEALS TAB ====== */}
          {tab === "skip" && (
            <motion.div key="skip" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-card rounded-2xl p-5 border border-border mb-6 shadow-card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">ℹ️</div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">How it works</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Mark meals you plan to skip <strong>at least 3 hours before mealtime</strong>. The headcook gets an automatic count so food isn't wasted. Each skipped meal deducts from your monthly bill.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {MEALS.map(meal => (
                  <MealSkipCard
                    key={meal.key}
                    meal={meal}
                    skip={getTodaySkip(meal.key)}
                    onToggle={handleMealToggle}
                    loading={mealLoading === meal.key}
                  />
                ))}
              </div>

              {/* This month's skip history */}
              {mealSkips.length > 0 && (
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> This Month's Skips
                  </h2>
                  <div className="space-y-2">
                    {mealSkips.map((s, i) => {
                      const meal = MEALS.find(m => m.key === s.meal);
                      return (
                        <motion.div
                          key={s._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${meal?.border} ${meal?.bg}`}
                        >
                          <span className="text-xl">{meal?.emoji}</span>
                          <div className="flex-1">
                            <span className="text-sm font-semibold text-foreground">{meal?.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-emerald bg-emerald/10 px-2 py-0.5 rounded-lg">Skipped</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ====== MY (Multi-day) REBATE TAB ====== */}
          {tab === "my" && (
            <motion.div key="my" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <motion.form
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                onSubmit={handleSubmit}
                className="bg-card rounded-2xl p-6 shadow-card border border-border mb-8"
              >
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" /> New Rebate Request
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">From Date</label>
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">To Date</label>
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Reason</label>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="e.g., Going home for a family function" className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-gradient-warm text-primary-foreground font-semibold hover:scale-[1.02] transition-transform">
                  Submit Rebate Request
                </button>
                {submitted && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald text-sm text-center mt-3 flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> Rebate filed successfully!
                  </motion.p>
                )}
              </motion.form>

              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Rebate History
                </h2>
                {loadingRebates ? (
                  <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : rebates.length === 0 ? (
                  <p className="text-center py-10 text-muted-foreground text-sm bg-card rounded-2xl border border-border">No rebates filed yet.</p>
                ) : (
                  <div className="space-y-3">
                    {rebates.map((r, i) => {
                      const config = statusConfig[r.status] || statusConfig.pending;
                      const StatusIcon = config.icon;
                      const days = Math.ceil((new Date(r.to_date) - new Date(r.from_date)) / (1000 * 60 * 60 * 24)) + 1;
                      return (
                        <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="bg-card rounded-2xl p-4 shadow-card border border-border flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {new Date(r.from_date).toLocaleDateString()} → {new Date(r.to_date).toLocaleDateString()}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{r.reason} ({days} days)</p>
                          </div>
                          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${config.color}`}>
                            <StatusIcon className="w-3 h-3" /> {config.label}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ====== ADMIN: TODAY's HEAD-COUNT ====== */}
          {tab === "skipAdmin" && isAdmin && (
            <motion.div key="skipAdmin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" /> Today's Meal Skip Report
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>
                <button
                  onClick={fetchTodaySkips}
                  className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-semibold border border-border hover:bg-muted/80 transition-colors"
                >
                  Refresh
                </button>
              </div>
              <HeadcountView data={todaySkips} loading={loadingSkips} />
            </motion.div>
          )}

          {/* ====== ADMIN: ALL ACTIVE REBATES ====== */}
          {tab === "all" && isAdmin && (
            <motion.div key="all" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Active Student Rebates
              </h2>
              <div className="space-y-3">
                {allRebates.map((r, i) => {
                  const days = Math.ceil((new Date(r.to_date) - new Date(r.from_date)) / (1000 * 60 * 60 * 24)) + 1;
                  return (
                    <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-card rounded-2xl p-4 shadow-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-foreground">{r.student?.name} <span className="text-muted-foreground font-normal">({r.student?.roll})</span></p>
                        <p className="text-xs font-medium text-muted-foreground mt-1">
                          {new Date(r.from_date).toLocaleDateString()} → {new Date(r.to_date).toLocaleDateString()} ({days} days)
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 opacity-80">Reason: {r.reason}</p>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm(`Remove/cancel rebate for ${r.student?.name}?`)) {
                            try { await api.deleteRebate(r._id); fetchAllRebates(); } catch (err) { alert(err.message); }
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors flex items-center gap-1.5 self-start sm:self-center"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel / Student Arrived
                      </button>
                    </motion.div>
                  );
                })}
                {allRebates.length === 0 && (
                  <p className="text-center py-10 text-muted-foreground text-sm bg-card rounded-2xl border border-border">No active rebates across the hostel.</p>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default RebatePage;
