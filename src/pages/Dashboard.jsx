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

// Modern playful components

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

const TodayMealCard = ({ type, items, time, isNext, userRating, onRate }) => {
  const gradients = {
    Breakfast: "bg-gradient-to-br from-[#FFD194] to-[#70E1F5]",
    Lunch: "bg-gradient-to-br from-[#f6d365] to-[#fda085]",
    Dinner: "bg-gradient-to-br from-[#84fab0] to-[#8fd3f4]"
  };

  const emojis = { Breakfast: "☕", Lunch: "🍛", Dinner: "🥘" };
  const ratingMap = { 1: "🔥", 0: "😐", "-1": "😢" };

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
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {userRating !== undefined ? "Your Rating" : "Rate this meal"}
        </span>
        <div className="flex gap-2">
          {[
            { s: 1, e: '🔥' },
            { s: 0, e: '😐' },
            { s: -1, e: '😢' }
          ].map(({ s, e }) => (
            <motion.button
              key={e}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRate(type, s)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all border ${userRating === s
                ? "bg-primary text-white border-primary shadow-md scale-110"
                : "bg-muted hover:bg-white hover:shadow-md border-transparent hover:border-border"
                }`}
            >
              {e}
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
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMeal, setActiveMeal] = useState("");
  const [userRatings, setUserRatings] = useState({});

  useEffect(() => {
    fetchSummary();
    fetchMenu();
    fetchMyRatings();
    determineActiveMeal();
  }, []);

  const fetchMyRatings = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await api.getMyRatings(today);
      const ratingsMap = {};
      data.forEach(r => {
        ratingsMap[r.meal] = r.score;
      });
      setUserRatings(ratingsMap);
    } catch (err) {
      console.error("Failed to fetch ratings:", err);
    }
  };

  const handleRate = async (meal, score) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.submitRating({ date: today, meal, score });
      setUserRatings(prev => ({ ...prev, [meal]: score }));
    } catch (err) {
      console.error("Failed to submit rating:", err);
    }
  };

  const fetchMenu = async () => {
    try {
      const data = await api.getMenu();
      if (data && data.menu) {
        setMenu(data.menu);
      }
    } catch (err) {
      console.error("Failed to fetch menu:", err);
    }
  };

  const determineActiveMeal = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const time = hour * 60 + minute;

    if (time < 10 * 60) setActiveMeal("Breakfast");
    else if (time < 14 * 60 + 30) setActiveMeal("Lunch");
    else setActiveMeal("Dinner");
  };

  const getWeekDates = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
      const dayShort = d.toLocaleDateString("en-US", { weekday: "short" });
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const isToday = d.toDateString() === now.toDateString();
      return { dayName, dayShort, label, isToday };
    });
  };

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
                items={menu ? (menu[new Date().toLocaleDateString("en-US", { weekday: "long" })]?.Breakfast || ["Standard Breakfast"]) : ["Poha", "Jalebi", "Milk & Tea", "Boiled Egg"]}
                isNext={activeMeal === "Breakfast"}
                userRating={userRatings["Breakfast"]}
                onRate={handleRate}
              />
              <TodayMealCard
                type="Lunch"
                time="01:00 PM - 02:30 PM"
                items={menu ? (menu[new Date().toLocaleDateString("en-US", { weekday: "long" })]?.Lunch || ["Standard Lunch"]) : ["Dal Makhani", "Jeera Rice", "Mix Veg", "Raita"]}
                isNext={activeMeal === "Lunch"}
                userRating={userRatings["Lunch"]}
                onRate={handleRate}
              />
              <TodayMealCard
                type="Dinner"
                time="08:00 PM - 09:30 PM"
                items={menu ? (menu[new Date().toLocaleDateString("en-US", { weekday: "long" })]?.Dinner || ["Standard Dinner"]) : ["Paneer Butter Masala", "Tandoori Roti", "Ice Cream", "Salad"]}
                isNext={activeMeal === "Dinner"}
                userRating={userRatings["Dinner"]}
                onRate={handleRate}
              />
            </div>

            {/* Weekly Swipeable Area */}
            <div className="mt-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
                This Week's Menu 📅
              </h2>
              <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scroll">
                {getWeekDates().map((item, i) => {
                  const dayMenu = menu ? menu[item.dayName] : null;
                  return (
                    <WeeklyMenuCard
                      key={i}
                      day={`${item.dayShort}, ${item.label}${item.isToday ? ' (Today)' : ''}`}
                      meals={{
                        breakfast: { items: dayMenu?.Breakfast || ['Standard Breakfast'] },
                        lunch: { items: dayMenu?.Lunch || ['Standard Lunch'] },
                        dinner: { items: dayMenu?.Dinner || ['Standard Dinner'] },
                      }}
                    />
                  );
                })}
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
