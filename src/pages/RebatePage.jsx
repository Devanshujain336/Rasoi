import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, FileText, Check, Clock, AlertCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

const statusConfig = {
  approved: { color: "text-emerald bg-emerald/10", icon: Check, label: "Approved" },
  pending: { color: "text-primary bg-primary/10", icon: Clock, label: "Pending" },
  rejected: { color: "text-destructive bg-destructive/10", icon: AlertCircle, label: "Rejected" },
};

const RebatePage = () => {
  const { user, role } = useAuth();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [rebates, setRebates] = useState([]);
  const [allRebates, setAllRebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tab, setTab] = useState("my");

  const isAdmin = ["admin", "mhmc", "munimji"].includes(role);

  useEffect(() => {
    fetchRebates();
    if (isAdmin) fetchAllRebates();
  }, [isAdmin]);

  const fetchAllRebates = async () => {
    try {
      const data = await api.getAllRebates();
      setAllRebates(data || []);
    } catch (err) {
      console.error("Fetch all failed:", err);
    }
  };

  const fetchRebates = async () => {
    try {
      const data = await api.getMyRebates();
      setRebates(data || []);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Rebate Management</h1>
          <p className="text-muted-foreground">Manage automatic mess fee deductions</p>
        </motion.div>

        {isAdmin && (
          <div className="flex border-b border-border mb-8">
            <button onClick={() => setTab("my")} className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${tab === "my" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
              My Rebates
            </button>
            <button onClick={() => setTab("all")} className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${tab === "all" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
              All Active Rebates
            </button>
          </div>
        )}

        {tab === "my" ? (
          <>
            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
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

            {/* History */}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Rebate History
              </h2>
              {loading ? (
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
                      <motion.div
                        key={r._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-card rounded-2xl p-4 shadow-card border border-border flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(r.from_date).toLocaleDateString()} → {new Date(r.to_date).toLocaleDateString()}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{r.reason} ({days} days)</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${config.color}`}>
                            <StatusIcon className="w-3 h-3" /> {config.label}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Active Student Rebates
            </h2>
            <div className="space-y-3">
              {allRebates.map((r, i) => {
                const days = Math.ceil((new Date(r.to_date) - new Date(r.from_date)) / (1000 * 60 * 60 * 24)) + 1;
                return (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-2xl p-4 shadow-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
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
                          try {
                            await api.deleteRebate(r._id);
                            fetchAllRebates();
                          } catch (err) {
                            alert(err.message);
                          }
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors flex items-center gap-1.5 self-start sm:self-center"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel / Student Arrived
                    </button>
                  </motion.div>
                );
              })}
              {allRebates.length === 0 && <p className="text-center py-10 text-muted-foreground text-sm bg-card rounded-2xl border border-border">No active rebates across the hostel.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RebatePage;
