/**
 * MenuPage.jsx
 * 
 * @description React Page Component: MenuPage.
 * @usage Rendered by react-router-dom as a full-page view.
 * @details Often contains state management, useEffect hooks for fetching initial data, and renders multiple smaller components.
 */

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import VideoBackground from "@/components/menu/VideoBackground";
import MenuCard from "@/components/menu/MenuCard";
import ActivePolls from "@/components/menu/ActivePolls";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Coffee, Sun, Moon, Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import api from "@/lib/api";

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

const initialPolls = [
  { id: 1, suggestion: "Masala Dosa for Sunday Breakfast", day: "Sunday", meal: "Breakfast", votes: 178, totalStudents: 250, by: "Rahul K.", daysLeft: 22, votedBy: [] },
  { id: 2, suggestion: "Pasta Night every Wednesday", day: "Wednesday", meal: "Dinner", votes: 145, totalStudents: 250, by: "Priya S.", daysLeft: 18, votedBy: [] },
  { id: 3, suggestion: "Fresh Fruit Salad with Lunch", day: "Friday", meal: "Lunch", votes: 198, totalStudents: 250, by: "Amit R.", daysLeft: 25, votedBy: [] },
  { id: 4, suggestion: "South Indian Special on Saturdays", day: "Saturday", meal: "Lunch", votes: 120, totalStudents: 250, by: "Deepa M.", daysLeft: 14, votedBy: [] },
];

const MenuPage = () => {
  const [menu, setMenu] = useState(sampleMenu);
  const [polls, setPolls] = useState(initialPolls);
  const [loading, setLoading] = useState(true);
  const [suggestionsLeft, setSuggestionsLeft] = useState(2);
  const [stats, setStats] = useState({});
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString("en-US", { weekday: "long" }));
  const { user, role } = useAuth();
  const isManagement = role === "mhmc" || role === "admin" || role === "munimji";
  const currentUserId = user?.id || "current_user";
  const dayPickerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/menu`, { withCredentials: true });
        if (res.data.menu) {
          const formattedMenu = {};
          for (const d in res.data.menu) {
            formattedMenu[d] = {};
            for (const m in res.data.menu[d]) {
              formattedMenu[d][m] = Array.isArray(res.data.menu[d][m])
                ? res.data.menu[d][m].join(", ")
                : res.data.menu[d][m];
            }
          }
          setMenu(formattedMenu);
        }
        if (res.data.polls) setPolls(res.data.polls.filter(p => p.status === "active"));
      } catch (error) {
        console.error("Error fetching menu data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    if (isManagement) fetchStats();
  }, [isManagement]);

  const fetchStats = async () => {
    try {
      const month = new Date().toISOString().slice(0, 7); // YYYY-MM
      const res = await api.getRatingStats(month);
      setStats(res);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const getDayDate = (dayName) => {
    const now = new Date();
    const currentDay = now.getDay();
    const targetDay = DAYS.indexOf(dayName) + 1; // Monday is 1
    const diff = targetDay - (currentDay === 0 ? 7 : currentDay);
    const d = new Date(now);
    d.setDate(now.getDate() + diff);
    return d.toISOString().split('T')[0];
  };

  const getPollForSlot = (day, meal) => polls.find(p => p.day === day && p.meal === meal);

  const handleCreatePoll = async (day, meal, suggestion) => {
    if (suggestionsLeft <= 0) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/menu/polls`, { day, meal, suggestion }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setPolls(prev => [res.data, ...prev]);
      setSuggestionsLeft(prev => prev - 1);
    } catch (error) {
      console.error("Failed to suggest poll", error);
    }
  };

  const handleVote = async (pollId) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/menu/polls/${pollId}/vote`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setPolls(prev => prev.map(p => (p._id || p.id) === pollId ? res.data : p));
    } catch (error) {
      console.error("Failed to vote", error);
    }
  };

  const getMealIcon = (meal) => {
    if (meal === "Breakfast") return <Coffee className="w-5 h-5" />;
    if (meal === "Lunch") return <Sun className="w-5 h-5" />;
    return <Moon className="w-5 h-5" />;
  };

  return (
    <div className="relative min-h-screen">
      <VideoBackground />

      <div className="relative z-10 pt-24 md:pb-16 pb-[85px] px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 md:mb-10"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
              Mess Menu
            </h1>
            <p className="text-white/80 text-sm md:text-base font-medium">
              Vibrant, Fresh & Healthy Meals Everyday ✨
            </p>
          </motion.div>

          {/* MOBILE INTERFACE: Day Picker & Vertical List */}
          <div className="md:hidden space-y-6">
            {/* Day Picker */}
            <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-4 px-4 snap-x" ref={dayPickerRef}>
              {DAYS.map((day) => {
                const isSelected = selectedDay === day;
                const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }) === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-2xl transition-all snap-center border-2 ${isSelected
                      ? "bg-gradient-warm border-white text-white shadow-warm scale-105"
                      : "bg-white/10 backdrop-blur-md border-white/20 text-white/70 hover:bg-white/20"
                      }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">
                      {day.slice(0, 3)}
                    </span>
                    <span className="text-xl">
                      {day === "Sunday" ? "🎉" : day === "Saturday" ? "🥤" : "🍲"}
                    </span>
                    {isToday && !isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Meal Stack for Selected Day */}
            <div className="space-y-4">
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="space-y-4"
              >
                {MEALS.map((meal) => {
                  const date = getDayDate(selectedDay);
                  const satisfaction = stats[date]?.[meal];
                  return (
                    <div key={meal} className="relative">
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <div className={`p-1.5 rounded-lg ${meal === 'Breakfast' ? 'bg-orange-100/20 text-orange-200' : meal === 'Lunch' ? 'bg-emerald-100/20 text-emerald-200' : 'bg-blue-100/20 text-blue-200'}`}>
                          {getMealIcon(meal)}
                        </div>
                        <h3 className="text-white font-black uppercase tracking-widest text-xs">{meal}</h3>
                      </div>
                      <MenuCard
                        day={selectedDay}
                        meal={meal}
                        items={menu[selectedDay]?.[meal] || sampleMenu[selectedDay][meal]}
                        poll={getPollForSlot(selectedDay, meal)}
                        suggestionsLeft={suggestionsLeft}
                        onCreatePoll={handleCreatePoll}
                        onVote={handleVote}
                        currentUserId={currentUserId}
                      />
                      {isManagement && satisfaction !== undefined && (
                        <div className="absolute top-10 right-3 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full shadow-sm border border-border z-20">
                          <span className={`text-[10px] font-black ${satisfaction >= 70 ? "text-emerald" : satisfaction >= 40 ? "text-orange-500" : "text-destructive"}`}>
                            {satisfaction}% Rating
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>

          {/* DESKTOP INTERFACE: Grid Table (Hidden on small screens) */}
          <div className="hidden md:block">
            <div className="overflow-x-auto mb-8 bg-black/20 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
              <div className="min-w-[800px]">
                {/* Column headers */}
                <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-4 mb-6">
                  <div />
                  {MEALS.map(meal => (
                    <div key={meal} className="flex flex-col items-center gap-2">
                      <div className="p-3 rounded-2xl bg-white/10 text-white">
                        {getMealIcon(meal)}
                      </div>
                      <div className="text-center text-xs font-black text-white/60 uppercase tracking-[0.2em]">
                        {meal}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="grid grid-cols-[140px_1fr_1fr_1fr] gap-4 mb-4"
                  >
                    <div className="flex items-center rounded-2xl backdrop-blur-md bg-white/10 px-6 py-4 border border-white/10 group hover:bg-white/20 transition-all cursor-default relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
                      <span className="font-display font-black text-sm text-white uppercase tracking-wider">{day}</span>
                    </div>
                    {MEALS.map(meal => {
                      const date = getDayDate(day);
                      const satisfaction = stats[date]?.[meal];
                      return (
                        <div key={`${day}-${meal}`} className="relative">
                          <MenuCard
                            day={day}
                            meal={meal}
                            items={menu[day]?.[meal] || sampleMenu[day][meal]}
                            poll={getPollForSlot(day, meal)}
                            suggestionsLeft={suggestionsLeft}
                            onCreatePoll={handleCreatePoll}
                            onVote={handleVote}
                            currentUserId={currentUserId}
                          />
                          {isManagement && satisfaction !== undefined && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-border z-20">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">Rate:</span>
                              <span className={`text-xs font-black ${satisfaction >= 70 ? "text-emerald" : satisfaction >= 40 ? "text-orange-500" : "text-destructive"}`}>
                                {satisfaction}%
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Polls - Common Section */}
          <div className="mt-12">
            <ActivePolls polls={polls} onVote={handleVote} currentUserId={currentUserId} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MenuPage;
