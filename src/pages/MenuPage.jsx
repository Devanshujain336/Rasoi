import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import VideoBackground from "@/components/menu/VideoBackground";
import MenuCard from "@/components/menu/MenuCard";
import ActivePolls from "@/components/menu/ActivePolls";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const currentUserId = user?.id || "current_user";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/menu", { withCredentials: true });
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
  }, []);

  const getPollForSlot = (day, meal) => polls.find(p => p.day === day && p.meal === meal);

  const handleCreatePoll = async (day, meal, suggestion) => {
    if (suggestionsLeft <= 0) return;
    try {
      const res = await axios.post("http://localhost:3001/api/menu/polls", { day, meal, suggestion }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setPolls(prev => [res.data, ...prev]);
      setSuggestionsLeft(prev => prev - 1);
    } catch (error) {
      console.error("Failed to suggest poll", error);
    }
  };

  const handleVote = async (pollId) => {
    try {
      const res = await axios.post(`http://localhost:3001/api/menu/polls/${pollId}/vote`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setPolls(prev => prev.map(p => p.id === pollId ? res.data : p));
    } catch (error) {
      console.error("Failed to vote", error);
    }
  };

  return (
    <div className="relative min-h-screen">
      <VideoBackground />

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
              Weekly Menu
            </h1>
            <p className="text-white/70 text-sm md:text-base">
              Click any meal to suggest alternatives • {suggestionsLeft} suggestion{suggestionsLeft !== 1 ? "s" : ""} remaining this week
            </p>
          </motion.div>

          {/* Menu Grid */}
          <div className="overflow-x-auto mb-8">
            <div className="min-w-[750px]">
              {/* Column headers */}
              <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-3 mb-3">
                <div />
                {MEALS.map(meal => (
                  <div key={meal} className="text-center text-sm font-semibold text-white/80 uppercase tracking-wider">
                    {meal}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {DAYS.map((day, di) => (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: di * 0.05 }}
                  className="grid grid-cols-[120px_1fr_1fr_1fr] gap-3 mb-3"
                >
                  <div className="flex items-center rounded-xl backdrop-blur-md bg-white/15 px-4 py-3">
                    <span className="font-display font-bold text-sm text-white">{day}</span>
                  </div>
                  {MEALS.map(meal => (
                    <MenuCard
                      key={`${day}-${meal}`}
                      day={day}
                      meal={meal}
                      items={menu[day]?.[meal] || sampleMenu[day][meal]}
                      poll={getPollForSlot(day, meal)}
                      suggestionsLeft={suggestionsLeft}
                      onCreatePoll={handleCreatePoll}
                      onVote={handleVote}
                      currentUserId={currentUserId}
                    />
                  ))}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Active Polls */}
          <ActivePolls polls={polls} onVote={handleVote} currentUserId={currentUserId} />
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
