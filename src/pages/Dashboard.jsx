import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, IndianRupee, UtensilsCrossed,
  Coffee, Sun, Moon, Calendar, ChevronDown, ChevronRight,
  ShoppingBag, X, Utensils, Users
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

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
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${data.taken ? colors.active : "bg-muted text-muted-foreground border-border line-through opacity-60"
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

// Modern playful components
const FloatingFeedbackButton = () => (
  <motion.button
    whileHover={{ scale: 1.1, rotate: 10 }}
    whileTap={{ scale: 0.9 }}
    className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-warm rounded-full shadow-warm flex items-center justify-center text-3xl z-50 border-4 border-white"
  >
    💬
  </motion.button>
);

const TodayMealCard = ({ type, items, time, isNext }) => {
  const gradients = {
    Breakfast: "bg-gradient-to-br from-[#FFD194] to-[#70E1F5]",
    Lunch: "bg-gradient-to-br from-[#f6d365] to-[#fda085]",
    Dinner: "bg-gradient-to-br from-[#84fab0] to-[#8fd3f4]"
  };

  const emojis = { Breakfast: "☕", Lunch: "🍛", Dinner: "🥘" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`relative rounded-[2rem] p-6 shadow-card overflow-hidden ${isNext ? 'border-4 border-primary' : 'border-2 border-border'} bg-white`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-20 ${gradients[type]} blur-3xl rounded-full`} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <span className="text-4xl filter drop-shadow-md">{emojis[type]}</span>
          <div>
            <h3 className="font-display font-bold text-2xl text-foreground">{type}</h3>
            <p className="text-sm font-bold text-primary">{time}</p>
          </div>
        </div>
        {isNext && (
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Up Next</span>
        )}
      </div>

      <div className="space-y-2 mb-6 relative z-10">
        {items.map((item, idx) => (
          <p key={idx} className="text-foreground font-medium text-lg flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" /> {item}
          </p>
        ))}
      </div>

      {/* Ratings */}
      <div className="border-t border-border/50 pt-4 relative z-10 flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rate this meal</span>
        <div className="flex gap-2">
          {['🔥', '😐', '😢'].map(emoji => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-border"
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const WeeklyMenuCard = ({ day, meals }) => (
  <div className="min-w-[280px] bg-white rounded-[2rem] p-5 shadow-sm border-2 border-border snap-center hover:border-primary/30 transition-colors">
    <h4 className="font-display font-bold text-xl mb-4 text-foreground text-center border-b border-border/50 pb-2">{day}</h4>
    <div className="space-y-4">
      <div className="bg-[#FFF8F0] p-3 rounded-2xl">
        <p className="text-xs font-bold text-primary mb-1">☕ Breakfast</p>
        <p className="font-medium text-sm text-foreground">{meals.breakfast.items.join(', ')}</p>
      </div>
      <div className="bg-[#F0FFF4] p-3 rounded-2xl">
        <p className="text-xs font-bold text-emerald mb-1">🍛 Lunch</p>
        <p className="font-medium text-sm text-foreground">{meals.lunch.items.join(', ')}</p>
      </div>
      <div className="bg-[#F0F8FF] p-3 rounded-2xl">
        <p className="text-xs font-bold text-blue-500 mb-1">🥘 Dinner</p>
        <p className="font-medium text-sm text-foreground">{meals.dinner.items.join(', ')}</p>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, profile, role } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const data = await api.getBillingSummary();
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (role === "munimji") {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-[#FFF8F0]">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-5xl font-black text-foreground">MunimJi Panel 📋</h1>
            <p className="text-xl text-muted-foreground mt-2 font-medium">Hello, {profile?.full_name || "MunimJi"}. Manage extras and view menu.</p>
          </motion.div>

          {/* Munimji controls kept similar but styled up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2rem] p-8 shadow-card border-2 border-border flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-all cursor-pointer hover:-translate-y-2"
              onClick={() => window.location.href = "/extras"}>
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🛍️</div>
              <h2 className="font-display text-2xl font-bold text-foreground">Manage Extras</h2>
              <p className="font-medium text-muted-foreground mt-2">Add and track extra food items</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] p-8 shadow-card border-2 border-border flex flex-col items-center justify-center text-center group hover:border-emerald/50 transition-all cursor-pointer hover:-translate-y-2"
              onClick={() => window.location.href = "/menu"}>
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📅</div>
              <h2 className="font-display text-2xl font-bold text-foreground">Menu & Polls</h2>
              <p className="font-medium text-muted-foreground mt-2">View mess menu and stats</p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#FFF8F0]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-foreground">
              What's cooking today? 👨‍🍳
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-2 font-medium">
              Hey {profile?.full_name?.split(' ')[0] || 'Foodie'}, here is your mess update.
            </p>
          </div>
          <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border-2 border-border inline-flex items-center gap-2 mx-auto lg:mx-0">
            <span className="text-2xl">💰</span>
            <div className="text-left">
              <p className="text-xs font-bold text-muted-foreground uppercase">Current Bill</p>
              <p className="font-display font-bold text-xl text-primary">{loading ? "..." : `₹${summary?.net_bill || 0}`}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content: Today's Menu */}
          <div className="xl:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TodayMealCard
                type="Breakfast"
                time="08:00 AM - 10:00 AM"
                items={["Poha", "Jalebi", "Milk & Tea", "Boiled Egg"]}
                isNext={false}
              />
              <TodayMealCard
                type="Lunch"
                time="01:00 PM - 02:30 PM"
                items={["Dal Makhani", "Jeera Rice", "Mix Veg", "Raita"]}
                isNext={true}
              />
              <TodayMealCard
                type="Dinner"
                time="08:00 PM - 09:30 PM"
                items={["Paneer Butter Masala", "Tandoori Roti", "Ice Cream", "Salad"]}
                isNext={false}
              />
            </div>

            {/* Weekly Swipeable Area */}
            <div className="mt-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
                This Week's Menu 📅
              </h2>
              <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scroll">
                {[
                  { day: 'Mon', label: 'Feb 10', m: treeData[3].meals },
                  { day: 'Tue', label: 'Feb 11', m: treeData[2].meals },
                  { day: 'Wed', label: 'Feb 12', m: treeData[1].meals },
                  { day: 'Thu', label: 'Feb 13 (Today)', m: treeData[0].meals },
                  { day: 'Fri', label: 'Feb 14', m: treeData[6].meals },
                  { day: 'Sat', label: 'Feb 15', m: treeData[5].meals },
                ].map((item, i) => (
                  <WeeklyMenuCard key={i} day={`${item.day}, ${item.label}`} meals={{
                    breakfast: { items: item.m.breakfast.items || ['Standard Breakfast'] },
                    lunch: { items: item.m.lunch.items || ['Standard Lunch'] },
                    dinner: { items: item.m.dinner.items || ['Standard Dinner'] },
                  }} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Bill & Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-card border-2 border-border">
              <h3 className="font-display text-2xl font-bold text-foreground mb-6 text-center">Your Money Stuff 💸</h3>

              <div className="space-y-4">
                <div className="bg-[#FFF8F0] p-4 rounded-2xl flex justify-between items-center group hover:bg-[#FFE8D1] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🍔</div>
                    <span className="font-bold text-foreground">Base Fee</span>
                  </div>
                  <span className="font-bold text-foreground text-lg">₹{summary?.base_fee || 0}</span>
                </div>

                <div className="bg-[#FFF8F0] p-4 rounded-2xl flex justify-between items-center group hover:bg-[#FFE8D1] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🍦</div>
                    <span className="font-bold text-foreground">Extras</span>
                  </div>
                  <span className="font-bold text-accent text-lg">+₹{summary?.extras_total || 0}</span>
                </div>

                <div className="bg-[#F0FFF4] p-4 rounded-2xl flex justify-between items-center group hover:bg-[#D1FFE2] transition-colors border border-emerald/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl group-hover:scale-110 transition-transform">✨</div>
                    <span className="font-bold text-emerald">Rebates Saved</span>
                  </div>
                  <span className="font-bold text-emerald text-lg">-₹{summary?.rebate_total || 0}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t-2 border-border border-dashed flex justify-between items-center">
                <span className="font-bold text-muted-foreground uppercase tracking-wider text-sm">Net Payable</span>
                <span className="font-display font-black text-4xl text-primary">₹{summary?.net_bill || 0}</span>
              </div>
            </div>

            {/* Teaser for Food Analytics */}
            <div className="bg-gradient-warm rounded-[2rem] p-8 shadow-warm text-white relative overflow-hidden group cursor-pointer" onClick={() => window.location.href = "/extras"}>
              <div className="absolute -right-6 -bottom-6 text-8xl opacity-20 group-hover:rotate-12 transition-transform">📈</div>
              <h3 className="font-display text-2xl font-bold mb-2 relative z-10">Food Analytics</h3>
              <p className="font-medium opacity-90 relative z-10 mb-4">See where your money goes and what you eat most.</p>
              <span className="inline-flex items-center bg-white/20 px-4 py-2 rounded-xl font-bold backdrop-blur-sm">View Details →</span>
            </div>
          </div>
        </div>
      </div>

      <FloatingFeedbackButton />
    </div>
  );
};

export default Dashboard;
