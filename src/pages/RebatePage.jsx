import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, FileText, Check, Clock, AlertCircle } from "lucide-react";

const pastRebates = [
  { id: 1, from: "2026-01-15", to: "2026-01-18", reason: "Family function", status: "approved", savings: 400 },
  { id: 2, from: "2026-01-25", to: "2026-01-27", reason: "Medical leave", status: "approved", savings: 300 },
  { id: 3, from: "2026-02-05", to: "2026-02-06", reason: "Personal work", status: "pending", savings: 200 },
];

const statusConfig = {
  approved: { color: "text-emerald bg-emerald/10", icon: Check, label: "Approved" },
  pending: { color: "text-primary bg-primary/10", icon: Clock, label: "Pending" },
  rejected: { color: "text-destructive bg-destructive/10", icon: AlertCircle, label: "Rejected" },
};

const RebatePage = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [rebates, setRebates] = useState(pastRebates);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) return;
    const days = Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1;
    setRebates([
      { id: Date.now(), from: fromDate, to: toDate, reason, status: "pending", savings: days * 100 },
      ...rebates,
    ]);
    setFromDate(""); setToDate(""); setReason("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Rebate Filing</h1>
          <p className="text-muted-foreground">File your leave rebate online and save on mess charges</p>
        </motion.div>

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
          <div className="space-y-3">
            {rebates.map((r, i) => {
              const config = statusConfig[r.status];
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl p-4 shadow-card border border-border flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.from} → {r.to}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.reason}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-emerald">-₹{r.savings}</span>
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${config.color}`}>
                      <StatusIcon className="w-3 h-3" /> {config.label}
                    </span>
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

export default RebatePage;
