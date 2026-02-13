import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, IndianRupee, UtensilsCrossed,
  Coffee, Sun, Moon, Calendar, ChevronDown, ChevronRight,
  ShoppingBag, X, Utensils
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const treeData = [
  {
    date: "2026-02-13",
    dayLabel: "Feb 13 (Thu)",
    meals: {
      breakfast: { taken: true, items: ["Poha", "Jalebi", "Tea"], time: "08:30" },
      lunch: { taken: true, items: ["Dal", "Rice", "Sabzi", "Roti"], time: "13:15" },
      dinner: { taken: true, items: ["Paneer Curry", "Roti", "Rice"], time: "20:00", extras: [{ item: "Ice Cream", price: 20 }] },
    },
  },
  {
    date: "2026-02-12",
    dayLabel: "Feb 12 (Wed)",
    meals: {
      breakfast: { taken: true, items: ["Idli", "Sambar", "Chutney"], time: "08:15" },
      lunch: { taken: true, items: ["Chole", "Rice", "Salad"], time: "13:00" },
      dinner: { taken: false, reason: "Rebate - Home visit" },
    },
  },
  {
    date: "2026-02-11",
    dayLabel: "Feb 11 (Tue)",
    meals: {
      breakfast: { taken: false, reason: "Skipped" },
      lunch: { taken: true, items: ["Rajma", "Rice", "Raita"], time: "13:30" },
      dinner: { taken: true, items: ["Mix Veg", "Roti"], time: "20:15", extras: [{ item: "Gulab Jamun", price: 25 }, { item: "Lassi", price: 20 }] },
    },
  },
  {
    date: "2026-02-10",
    dayLabel: "Feb 10 (Mon)",
    meals: {
      breakfast: { taken: true, items: ["Paratha", "Curd", "Tea"], time: "08:45" },
      lunch: { taken: true, items: ["Dal Fry", "Rice", "Papad"], time: "12:50" },
      dinner: { taken: true, items: ["Egg Curry", "Roti", "Rice"], time: "19:45" },
    },
  },
  {
    date: "2026-02-09",
    dayLabel: "Feb 9 (Sun)",
    meals: {
      breakfast: { taken: true, items: ["Chole Bhature", "Lassi"], time: "09:00" },
      lunch: { taken: true, items: ["Biryani", "Raita"], time: "13:00", extras: [{ item: "Cold Drink", price: 20 }] },
      dinner: { taken: true, items: ["Paneer Tikka", "Naan", "Dal"], time: "20:30" },
    },
  },
  {
    date: "2026-02-08",
    dayLabel: "Feb 8 (Sat)",
    meals: {
      breakfast: { taken: true, items: ["Aloo Paratha", "Butter"], time: "08:30" },
      lunch: { taken: false, reason: "Rebate" },
      dinner: { taken: true, items: ["Kadhi", "Rice"], time: "20:00", extras: [{ item: "Rasmalai", price: 30 }] },
    },
  },
  {
    date: "2026-02-07",
    dayLabel: "Feb 7 (Fri)",
    meals: {
      breakfast: { taken: true, items: ["Upma", "Tea"], time: "08:20" },
      lunch: { taken: true, items: ["Sambar Rice", "Appalam"], time: "13:10" },
      dinner: { taken: true, items: ["Butter Chicken", "Naan"], time: "20:00", extras: [{ item: "Ice Cream", price: 20 }] },
    },
  },
];

const dailyExtrasChart = [
  { day: "Feb 7", amount: 20 },
  { day: "Feb 8", amount: 30 },
  { day: "Feb 9", amount: 20 },
  { day: "Feb 10", amount: 0 },
  { day: "Feb 11", amount: 45 },
  { day: "Feb 12", amount: 0 },
  { day: "Feb 13", amount: 20 },
];

const categoryBreakdown = [
  { name: "Desserts", value: 70, color: "hsl(340, 70%, 55%)" },
  { name: "Beverages", value: 40, color: "hsl(175, 60%, 45%)" },
  { name: "Sweets", value: 55, color: "hsl(35, 90%, 55%)" },
  { name: "Dairy", value: 10, color: "hsl(205, 70%, 55%)" },
];

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
};

const mealColors = {
  breakfast: { active: "bg-accent/20 text-accent-foreground border-accent/30", dot: "bg-accent" },
  lunch: { active: "bg-emerald/20 text-emerald border-emerald/30", dot: "bg-emerald" },
  dinner: { active: "bg-primary/20 text-primary border-primary/30", dot: "bg-primary" },
};

const StatCard = ({ icon: Icon, label, value, trend, trendUp, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card rounded-2xl p-5 shadow-card border border-border"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
      {trend && (
        <span className={`text-xs font-medium flex items-center gap-0.5 ${trendUp ? "text-emerald" : "text-destructive"}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </span>
      )}
    </div>
    <p className="text-2xl font-display font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
  </motion.div>
);

const MealNode = ({ type, data }) => {
  const Icon = mealIcons[type];
  const colors = mealColors[type];
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetail(!showDetail)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
          data.taken ? colors.active : "bg-muted text-muted-foreground border-border line-through opacity-60"
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="capitalize">{type}</span>
        {data.extras?.length > 0 && (
          <span className="ml-1 w-4 h-4 rounded-full bg-gradient-warm text-primary-foreground text-[10px] font-bold flex items-center justify-center">
            +
          </span>
        )}
      </button>
      <AnimatePresence>
        {showDetail && data.taken && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 z-20 bg-card rounded-xl p-4 shadow-elevated border border-border min-w-[200px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-foreground capitalize">{type}</span>
              <button onClick={() => setShowDetail(false)}>
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
            {data.time && <p className="text-[10px] text-muted-foreground mb-2">{data.time}</p>}
            <div className="space-y-1">
              {data.items?.map((item, i) => (
                <p key={i} className="text-xs text-foreground">• {item}</p>
              ))}
            </div>
            {data.extras?.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-[10px] font-semibold text-primary mb-1">Extras:</p>
                {data.extras.map((e, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex justify-between">
                    <span>{e.item}</span>
                    <span className="text-primary font-medium">₹{e.price}</span>
                  </p>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {!data.taken && data.reason && (
        <p className="text-[10px] text-destructive mt-1 ml-1">{data.reason}</p>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [expandedDays, setExpandedDays] = useState(new Set([treeData[0].date]));
  const [selectedMonth] = useState("February 2026");

  const toggleDay = (date) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Arjun! Here's your mess summary.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={IndianRupee} label="Total Bill (Feb)" value="₹4,670" trend="-5%" trendUp={false} gradient="bg-gradient-warm" />
          <StatCard icon={Utensils} label="Meals Consumed" value="84/90" trend="+3" trendUp={true} gradient="bg-gradient-emerald" />
          <StatCard icon={ShoppingBag} label="Extras Spent" value="₹850" gradient="bg-gradient-warm" />
          <StatCard icon={Calendar} label="Rebate Days" value="2" gradient="bg-gradient-emerald" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Consumption Tree */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-card border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Consumption Tree
              </h2>
              <span className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">{selectedMonth}</span>
            </div>

            <div className="space-y-1">
              {treeData.map((day, i) => {
                const isExpanded = expandedDays.has(day.date);
                const dayExtras = Object.values(day.meals).reduce((sum, m) => sum + (m.extras?.reduce((s, e) => s + e.price, 0) || 0), 0);
                const mealsCount = Object.values(day.meals).filter(m => m.taken).length;

                return (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    {/* Day Row (tree trunk) */}
                    <button
                      onClick={() => toggleDay(day.date)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isExpanded ? "bg-primary/5 border border-primary/20" : "hover:bg-muted"
                      }`}
                    >
                      {/* Tree connector */}
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${mealsCount === 3 ? "bg-emerald" : mealsCount > 0 ? "bg-accent" : "bg-destructive"}`} />
                        <div className="w-6 h-px bg-border" />
                      </div>

                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}

                      <span className="text-sm font-semibold text-foreground min-w-[120px] text-left">{day.dayLabel}</span>

                      {/* Quick meal indicators */}
                      <div className="flex gap-1.5">
                        {["breakfast", "lunch", "dinner"].map(type => {
                          const colors = mealColors[type];
                          return (
                            <div
                              key={type}
                              className={`w-2.5 h-2.5 rounded-full ${day.meals[type].taken ? colors.dot : "bg-muted"}`}
                            />
                          );
                        })}
                      </div>

                      <span className="text-xs text-muted-foreground ml-auto">
                        {mealsCount}/3 meals
                        {dayExtras > 0 && <span className="text-primary ml-2">+₹{dayExtras}</span>}
                      </span>
                    </button>

                    {/* Expanded: Tree Branches */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-[22px] pl-6 border-l-2 border-border py-3">
                            <div className="flex flex-wrap gap-3">
                              {["breakfast", "lunch", "dinner"].map(type => (
                                <div key={type} className="relative">
                                  {/* Branch connector */}
                                  <div className="absolute -left-6 top-1/2 w-6 h-px bg-border" />
                                  <MealNode type={type} data={day.meals[type]} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Daily Extras Bar Chart */}
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Daily Extras Spending</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dailyExtrasChart}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(20 10% 45%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(20 10% 45%)" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip
                    contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(35 20% 88%)", borderRadius: "12px", fontSize: "12px" }}
                    formatter={(value) => [`₹${value}`, "Extras"]}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="hsl(28 85% 52%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Pie Chart */}
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Extras by Category</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                    {categoryBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value}`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {categoryBreakdown.map((cat, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                    {cat.name} ₹{cat.value}
                  </span>
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-gradient-dark rounded-2xl p-6">
              <h3 className="font-display text-sm font-semibold text-primary-foreground mb-4">Bill Summary</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Base Mess Charge</span><span>₹4,000</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Extra Items</span><span>₹850</span>
                </div>
                <div className="flex justify-between text-emerald">
                  <span>Rebate (-2 days)</span><span>-₹180</span>
                </div>
                <hr className="border-border my-2" />
                <div className="flex justify-between text-primary-foreground font-bold text-sm">
                  <span>Current Total</span><span>₹4,670</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
