import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IndianRupee, Download, Eye, CreditCard, Clock, AlertTriangle,
  CheckCircle2, X, UtensilsCrossed, Calendar, Receipt, ChevronRight,
  FileText, TrendingDown
} from "lucide-react";

const DAILY_RATE = 90;

const sampleBill = {
  id: "BILL-2026-JAN",
  semester: "January - June 2026",
  semesterStart: "2026-01-15",
  semesterEnd: "2026-06-30",
  baseMess: 15300,
  extrasTotal: 2850,
  rebateDeductions: 1620,
  totalAmount: 16530,
  paymentStatus: "pending",
  paymentDeadline: "2026-02-28",
  generatedAt: "2026-02-01",
};

const extrasBreakdown = [
  { id: 1, date: "2026-01-20", item: "Ice Cream", quantity: 2, price: 40 },
  { id: 2, date: "2026-01-22", item: "Cold Drink", quantity: 1, price: 20 },
  { id: 3, date: "2026-01-25", item: "Gulab Jamun", quantity: 3, price: 75 },
  { id: 4, date: "2026-01-28", item: "Lassi", quantity: 2, price: 40 },
  { id: 5, date: "2026-02-01", item: "Rasmalai", quantity: 2, price: 60 },
  { id: 6, date: "2026-02-03", item: "Brownie", quantity: 1, price: 35 },
  { id: 7, date: "2026-02-05", item: "Ice Cream", quantity: 4, price: 80 },
  { id: 8, date: "2026-02-07", item: "Cold Drink", quantity: 3, price: 60 },
  { id: 9, date: "2026-02-09", item: "Gulab Jamun", quantity: 2, price: 50 },
  { id: 10, date: "2026-02-11", item: "Jalebi", quantity: 5, price: 100 },
  { id: 11, date: "2026-02-12", item: "Rasgulla", quantity: 3, price: 90 },
  { id: 12, date: "2026-02-13", item: "Kulfi", quantity: 2, price: 50 },
];

const rebatesBreakdown = [
  { id: 1, fromDate: "2026-01-18", toDate: "2026-01-20", days: 3, reason: "Home visit", amount: 270, status: "approved" },
  { id: 2, fromDate: "2026-02-05", toDate: "2026-02-10", days: 6, reason: "Medical leave", amount: 540, status: "approved" },
  { id: 3, fromDate: "2026-02-12", toDate: "2026-02-14", days: 3, reason: "Festival", amount: 270, status: "approved" },
  { id: 4, fromDate: "2026-02-20", toDate: "2026-02-25", days: 6, reason: "Family event", amount: 540, status: "pending" },
];

const pastBills = [
  { id: "BILL-2025-JUL", semester: "Jul - Dec 2025", total: 14200, status: "paid", paidOn: "2025-08-10" },
  { id: "BILL-2025-JAN", semester: "Jan - Jun 2025", total: 13800, status: "paid", paidOn: "2025-02-15" },
  { id: "BILL-2024-JUL", semester: "Jul - Dec 2024", total: 12500, status: "paid", paidOn: "2024-08-20" },
];

const getDaysUntil = (deadline) => {
  const diff = new Date(deadline) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-accent/20 text-accent-foreground border-accent/30",
    paid: "bg-emerald/20 text-emerald border-emerald/30",
    overdue: "bg-destructive/20 text-destructive border-destructive/30",
  };
  const icons = { pending: Clock, paid: CheckCircle2, overdue: AlertTriangle };
  const Icon = icons[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      <Icon className="w-3.5 h-3.5" />
      {status.toUpperCase()}
    </span>
  );
};

const BreakdownModal = ({ bill, onClose }) => {
  const [activeTab, setActiveTab] = useState("extras");

  const tabs = [
    { key: "extras", label: "Extra Items", amount: `₹${bill.extrasTotal.toLocaleString()}` },
    { key: "rebates", label: "Rebates", amount: `-₹${bill.rebateDeductions.toLocaleString()}` },
    { key: "daily", label: "Daily Charges", amount: `₹${bill.baseMess.toLocaleString()}` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-2xl shadow-elevated border border-border w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-xl font-bold text-foreground">Detailed Breakdown</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.key ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span className="block text-xs mt-0.5 opacity-70">{tab.amount}</span>
              {activeTab === tab.key && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === "extras" && (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-left pb-3 font-medium">Item</th>
                  <th className="text-center pb-3 font-medium">Qty</th>
                  <th className="text-right pb-3 font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {extrasBreakdown.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 text-sm text-muted-foreground">{formatDate(item.date)}</td>
                    <td className="py-3 text-sm text-foreground font-medium">{item.item}</td>
                    <td className="py-3 text-sm text-center text-muted-foreground">{item.quantity}</td>
                    <td className="py-3 text-sm text-right text-primary font-semibold">₹{item.price}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border">
                  <td colSpan="3" className="py-3 text-sm font-bold text-foreground">Total</td>
                  <td className="py-3 text-sm text-right font-bold text-primary">
                    ₹{extrasBreakdown.reduce((s, i) => s + i.price, 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}

          {activeTab === "rebates" && (
            <div className="space-y-3">
              {rebatesBreakdown.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.reason}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(r.fromDate)} → {formatDate(r.toDate)} ({r.days} days)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald">-₹{r.amount}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      r.status === "approved" ? "bg-emerald/20 text-emerald" : "bg-accent/20 text-accent-foreground"
                    }`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between p-4 rounded-xl bg-emerald/10 border border-emerald/20">
                <span className="text-sm font-bold text-foreground">Total Rebate</span>
                <span className="text-sm font-bold text-emerald">
                  -₹{rebatesBreakdown.filter(r => r.status === "approved").reduce((s, r) => s + r.amount, 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {activeTab === "daily" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Daily mess rate</span>
                  <span className="text-sm font-semibold text-foreground">₹{DAILY_RATE}/day</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Semester days</span>
                  <span className="text-sm font-semibold text-foreground">170 days</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-sm font-bold text-foreground">Base charge</span>
                  <span className="text-sm font-bold text-primary">₹{bill.baseMess.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Daily charges are calculated based on ₹{DAILY_RATE}/day × number of active days in the semester. 
                Rebate days are deducted separately.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const BillingPage = () => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [bill] = useState(sampleBill);
  const daysLeft = getDaysUntil(bill.paymentDeadline);
  const isUrgent = daysLeft <= 5 && bill.paymentStatus === "pending";

  const handlePayNow = () => {
    // Placeholder for payment gateway integration
    alert("Payment gateway integration coming soon! This will connect to Stripe/Razorpay.");
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground">Semester Billing</h1>
          <p className="text-muted-foreground mt-1">Manage your mess bills and payments</p>
        </motion.div>

        {/* Current Bill Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-card border border-border overflow-hidden mb-6"
        >
          {/* Bill Header */}
          <div className="bg-gradient-dark p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Semester Bill</p>
                <h2 className="font-display text-2xl font-bold text-primary-foreground">{bill.semester}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(bill.semesterStart)} – {formatDate(bill.semesterEnd)}
                </p>
              </div>
              <StatusBadge status={bill.paymentStatus} />
            </div>
          </div>

          {/* Bill Body */}
          <div className="p-6">
            {/* Line Items */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4" />
                  Base Mess Charges
                </span>
                <span className="text-sm font-semibold text-foreground">₹{bill.baseMess.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Extra Items
                </span>
                <span className="text-sm font-semibold text-primary">+ ₹{bill.extrasTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Rebates
                </span>
                <span className="text-sm font-semibold text-emerald">- ₹{bill.rebateDeductions.toLocaleString()}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-foreground">Total Amount Due</span>
                <span className="text-2xl font-display font-bold text-gradient-warm">
                  ₹{bill.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Deadline Warning */}
            {bill.paymentStatus === "pending" && (
              <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${
                isUrgent
                  ? "bg-destructive/10 border border-destructive/20"
                  : "bg-accent/10 border border-accent/20"
              }`}>
                {isUrgent ? (
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-accent flex-shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-semibold ${isUrgent ? "text-destructive" : "text-foreground"}`}>
                    {isUrgent
                      ? `⚠️ Only ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left to pay!`
                      : `Payment due by ${formatDate(bill.paymentDeadline)}`
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {daysLeft > 0 ? `${daysLeft} days remaining` : "Payment is overdue"}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePayNow}
                disabled={bill.paymentStatus === "paid"}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  bill.paymentStatus === "paid"
                    ? "bg-emerald/20 text-emerald cursor-not-allowed"
                    : "bg-gradient-warm text-primary-foreground shadow-warm hover:shadow-lg hover:scale-[1.02]"
                }`}
              >
                {bill.paymentStatus === "paid" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Paid ✓
                  </>
                ) : (
                  <>
                    <IndianRupee className="w-4 h-4" />
                    Pay Now
                  </>
                )}
              </button>
              <button
                onClick={() => setShowBreakdown(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors border border-border"
              >
                <Eye className="w-4 h-4" />
                View Breakdown
              </button>
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors border border-border">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-5 shadow-card border border-border"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center mb-3">
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">₹{bill.baseMess.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Base Mess Charges</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-2xl p-5 shadow-card border border-border"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">₹{bill.extrasTotal.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Extra Items Total</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl p-5 shadow-card border border-border"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-emerald flex items-center justify-center mb-3">
              <TrendingDown className="w-5 h-5 text-primary-foreground" />
            </div>
            <p className="text-2xl font-display font-bold text-emerald">-₹{bill.rebateDeductions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Rebate Savings</p>
          </motion.div>
        </div>

        {/* Past Bills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card rounded-2xl shadow-card border border-border overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Past Bills
            </h3>
          </div>
          <div className="divide-y divide-border">
            {pastBills.map((pb) => (
              <div key={pb.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{pb.semester}</p>
                    <p className="text-xs text-muted-foreground">Paid on {formatDate(pb.paidOn)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-foreground">₹{pb.total.toLocaleString()}</span>
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Breakdown Modal */}
      <AnimatePresence>
        {showBreakdown && <BreakdownModal bill={bill} onClose={() => setShowBreakdown(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default BillingPage;
