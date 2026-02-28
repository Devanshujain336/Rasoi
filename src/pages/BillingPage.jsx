import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IndianRupee, Download, Eye, CreditCard, Clock, AlertTriangle,
  CheckCircle2, X, UtensilsCrossed, TrendingDown,
  FileText, ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

const DAILY_RATE = 90;

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-accent/20 text-accent-foreground border-accent/30",
    paid: "bg-emerald/20 text-emerald border-emerald/30",
    overdue: "bg-destructive/20 text-destructive border-destructive/30",
  };
  const icons = { pending: Clock, paid: CheckCircle2, overdue: AlertTriangle };
  const Icon = icons[status] || Clock;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
      <Icon className="w-3.5 h-3.5" />
      {(status || "pending").toUpperCase()}
    </span>
  );
};

const BreakdownModal = ({ bill, onClose, extras = [], rebates = [] }) => {
  const [activeTab, setActiveTab] = useState("extras");

  const tabs = [
    { key: "extras", label: "Extra Items", amount: `₹${(bill.extrasTotal || 0).toLocaleString()}` },
    { key: "rebates", label: "Rebates", amount: `-₹${(bill.rebateDeductions || 0).toLocaleString()}` },
    { key: "daily", label: "Base Charges", amount: `₹${(bill.baseMess || 0).toLocaleString()}` },
  ];

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-2xl shadow-elevated border border-border w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-xl font-bold text-foreground">Detailed Breakdown</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.key ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <span>{tab.label}</span>
              <span className="block text-xs mt-0.5 opacity-70">{tab.amount}</span>
              {activeTab === tab.key && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          ))}
        </div>
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === "extras" && (
            <table className="w-full">
              <thead><tr className="text-xs text-muted-foreground border-b border-border"><th className="text-left pb-3 font-medium">Date</th><th className="text-left pb-3 font-medium">Item</th><th className="text-right pb-3 font-medium">Price</th></tr></thead>
              <tbody>
                {extras.map((item, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-3 text-sm text-muted-foreground">{formatDate(item.created_at)}</td>
                    <td className="py-3 text-sm text-foreground font-medium">{item.item_name}</td>
                    <td className="py-3 text-sm text-right text-primary font-semibold">₹{item.price}</td>
                  </tr>
                ))}
                {extras.length === 0 && <tr><td colSpan="3" className="py-10 text-center text-sm text-muted-foreground">No extra purchases found.</td></tr>}
              </tbody>
            </table>
          )}
          {activeTab === "rebates" && (
            <div className="space-y-3">
              {rebates.map((r, i) => {
                const days = Math.ceil((new Date(r.to_date) - new Date(r.from_date)) / (1000 * 60 * 60 * 24)) + 1;
                return (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                    <div><p className="text-sm font-medium text-foreground">{r.reason}</p><p className="text-xs text-muted-foreground mt-0.5">{formatDate(r.from_date)} → {formatDate(r.to_date)} ({days} days)</p></div>
                    <div className="text-right">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.status === "approved" ? "bg-emerald/20 text-emerald" : "bg-accent/20 text-accent-foreground"}`}>{r.status}</span>
                    </div>
                  </div>
                );
              })}
              {rebates.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No rebates filed.</p>}
            </div>
          )}
          {activeTab === "daily" && (
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex justify-between mb-2"><span className="text-sm text-muted-foreground">Monthly mess fee</span><span className="text-sm font-semibold text-foreground">₹{bill.baseMess}</span></div>
              <p className="text-xs text-muted-foreground mt-4 italic">Note: Base charges are set by your hostel administration.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const BillingPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [extras, setExtras] = useState([]);
  const [rebates, setRebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, extRes, rebRes] = await Promise.all([
          api.getBillingSummary(),
          api.getMyExtras(),
          api.getMyRebates()
        ]);
        setSummary(sumRes);
        setExtras(extRes || []);
        setRebates(rebRes || []);
      } catch (err) {
        console.error("Billing fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen pt-40 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!summary) return <div className="min-h-screen pt-40 text-center text-muted-foreground">No billing data available.</div>;

  const bill = {
    semester: `Semester ${new Date().getFullYear()}`,
    baseMess: summary.base_fee,
    extrasTotal: summary.extras_total,
    rebateDeductions: summary.rebate_total,
    totalAmount: summary.net_bill,
    paymentStatus: "pending",
    paymentDeadline: "2026-03-31",
  };

  const formatDateFull = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground">Semester Billing</h1>
          <p className="text-muted-foreground mt-1">Manage your mess bills for {summary.hostel_name}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-card border border-border overflow-hidden mb-6">
          <div className="bg-gradient-dark p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Bill</p>
                <h2 className="font-display text-2xl font-bold text-primary-foreground">{bill.semester}</h2>
              </div>
              <StatusBadge status={bill.paymentStatus} />
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground flex items-center gap-2"><UtensilsCrossed className="w-4 h-4" />Base Fees</span><span className="text-sm font-semibold text-foreground">₹{bill.baseMess.toLocaleString()}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground flex items-center gap-2"><CreditCard className="w-4 h-4" />Extra Purchases</span><span className="text-sm font-semibold text-primary">+ ₹{bill.extrasTotal.toLocaleString()}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground flex items-center gap-2"><TrendingDown className="w-4 h-4" />Rebate Deductions</span><span className="text-sm font-semibold text-emerald">- ₹{bill.rebateDeductions.toLocaleString()}</span></div>
              <hr className="border-border" />
              <div className="flex justify-between items-center"><span className="text-base font-bold text-foreground">Total Payable</span><span className="text-2xl font-display font-bold text-gradient-warm">₹{bill.totalAmount.toLocaleString()}</span></div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => alert("Payment logic needed")} className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-warm text-primary-foreground font-semibold shadow-warm hover:scale-[1.02] transition-all"><IndianRupee className="w-4 h-4" />Pay Now</button>
              <button onClick={() => setShowBreakdown(true)} className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-muted text-foreground border border-border hover:bg-muted/80"><Eye className="w-4 h-4" />Breakdown</button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[{ label: "Base Charges", val: bill.baseMess, icon: UtensilsCrossed }, { label: "Extras", val: bill.extrasTotal, icon: CreditCard }, { label: "Savings", val: bill.rebateDeductions, icon: TrendingDown, color: "text-emerald" }].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }} className="bg-card rounded-2xl p-5 border border-border">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3"><s.icon className="w-5 h-5 text-primary" /></div>
              <p className={`text-2xl font-display font-bold ${s.color || "text-foreground"}`}>₹{s.val.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showBreakdown && <BreakdownModal bill={bill} onClose={() => setShowBreakdown(false)} extras={extras} rebates={rebates} />}
      </AnimatePresence>
    </div>
  );
};

export default BillingPage;
