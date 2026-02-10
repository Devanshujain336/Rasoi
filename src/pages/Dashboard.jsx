import { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, IndianRupee, UtensilsCrossed,
  Coffee, Sun, Moon, Calendar
} from "lucide-react";

const monthlyData = [
  { day: 1, breakfast: true, lunch: true, dinner: true, extras: 30 },
  { day: 2, breakfast: true, lunch: false, dinner: true, extras: 0 },
  { day: 3, breakfast: false, lunch: true, dinner: true, extras: 50 },
  { day: 4, breakfast: true, lunch: true, dinner: false, extras: 20 },
  { day: 5, breakfast: true, lunch: true, dinner: true, extras: 0 },
  { day: 6, breakfast: false, lunch: true, dinner: true, extras: 40 },
  { day: 7, breakfast: true, lunch: true, dinner: true, extras: 60 },
];

const recentExtras = [
  { date: "Feb 7", item: "Ice Cream (Butterscotch)", price: 30 },
  { date: "Feb 6", item: "Gulab Jamun (2pc)", price: 20 },
  { date: "Feb 5", item: "Cold Coffee", price: 25 },
  { date: "Feb 3", item: "Rasmalai", price: 40 },
  { date: "Feb 1", item: "Dahi", price: 15 },
];

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

const Dashboard = () => {
  const [selectedDay, setSelectedDay] = useState(null);

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Arjun! Here's your mess summary.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={IndianRupee} label="Total Bill (Feb)" value="₹3,240" trend="-5%" trendUp={false} gradient="bg-gradient-warm" />
          <StatCard icon={UtensilsCrossed} label="Meals Eaten" value="52" trend="+3" trendUp={true} gradient="bg-gradient-emerald" />
          <StatCard icon={IndianRupee} label="Extras Spent" value="₹340" gradient="bg-gradient-warm" />
          <StatCard icon={Calendar} label="Rebate Days" value="4" gradient="bg-gradient-emerald" />
        </div>

        {/* Consumption Tree */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Breakdown */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-card border border-border">
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Daily Consumption
            </h2>
            <div className="space-y-2">
              {monthlyData.map((day, i) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedDay(selectedDay === day.day ? null : day.day)}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedDay === day.day ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                  }`}
                >
                  <span className="text-sm font-medium text-foreground w-16">Feb {day.day}</span>
                  <div className="flex gap-2">
                    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${day.breakfast ? "bg-accent/30 text-accent-foreground" : "bg-muted text-muted-foreground line-through"}`}>
                      <Coffee className="w-3 h-3" /> B
                    </span>
                    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${day.lunch ? "bg-emerald/20 text-emerald" : "bg-muted text-muted-foreground line-through"}`}>
                      <Sun className="w-3 h-3" /> L
                    </span>
                    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${day.dinner ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground line-through"}`}>
                      <Moon className="w-3 h-3" /> D
                    </span>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {day.extras > 0 && `+₹${day.extras} extras`}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Extras */}
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Recent Extras</h2>
            <div className="space-y-3">
              {recentExtras.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.item}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">₹{item.price}</span>
                </motion.div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-dark">
              <h3 className="font-display text-sm font-semibold text-primary-foreground mb-3">Bill Summary</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Mess Charges</span><span>₹2,900</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Extra Items</span><span>₹340</span>
                </div>
                <div className="flex justify-between text-emerald">
                  <span>Rebate (-4 days)</span><span>-₹400</span>
                </div>
                <hr className="border-border my-2" />
                <div className="flex justify-between text-primary-foreground font-bold text-sm">
                  <span>Total Due</span><span>₹2,840</span>
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
