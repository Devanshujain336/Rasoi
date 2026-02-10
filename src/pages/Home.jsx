import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  CalendarCheck, LayoutDashboard, Receipt, Vote, 
  ScanLine, MessageSquare, CreditCard, ArrowRight, Sparkles
} from "lucide-react";
import heroFood from "@/assets/hero-food.jpg";
import FeatureCard from "@/components/FeatureCard";

const features = [
  { icon: CalendarCheck, title: "Weekly Menu & Polls", description: "View the weekly menu and vote on food suggestions from fellow students. Your voice shapes the menu!", gradient: "warm" },
  { icon: LayoutDashboard, title: "Consumption Dashboard", description: "Track your daily meals, expenses, and nutrition with an interactive visual tree.", gradient: "emerald" },
  { icon: CreditCard, title: "Extra Items Billing", description: "Digital billing for extras like ice cream, sweets & more. No more paper registers!", gradient: "warm" },
  { icon: Receipt, title: "Online Rebate Filing", description: "File rebates before leave and watch your bill adjust automatically in real-time.", gradient: "emerald" },
  { icon: Vote, title: "MHMC Elections", description: "Nominate, campaign, and vote for your mess committee representatives democratically.", gradient: "warm" },
  { icon: ScanLine, title: "AI Nutrition Scanner", description: "Snap a photo of your meal and get instant nutritional analysis powered by AI.", gradient: "emerald" },
  { icon: MessageSquare, title: "Community Forum", description: "Discuss, suggest, and collaborate with fellow students to improve mess services.", gradient: "warm" },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroFood} alt="Hostel mess dining" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-primary-foreground">Smart Hostel Mess Management</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
              Your Mess,{" "}
              <span className="text-gradient-warm">Your Rules</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              A student-driven platform that transforms hostel dining with democratic menus, 
              smart billing, AI nutrition tracking, and transparent governance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/menu"
                className="inline-flex items-center justify-center gap-2 bg-gradient-warm text-primary-foreground px-8 py-3.5 rounded-xl font-semibold shadow-warm hover:scale-105 transition-transform"
              >
                Explore Menu <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 glass text-foreground px-8 py-3.5 rounded-xl font-semibold hover:scale-105 transition-transform"
              >
                My Dashboard
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/40 flex items-start justify-center pt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A complete ecosystem for hostel mess management, built by students, for students.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-dark">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: "500+", label: "Students" },
              { value: "21", label: "Meals/Week" },
              { value: "98%", label: "Satisfaction" },
              { value: "0", label: "Paper Registers" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl md:text-4xl font-display font-bold text-gradient-warm mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 MessHub — Built for students, by students.
        </div>
      </footer>
    </div>
  );
};

export default Home;
