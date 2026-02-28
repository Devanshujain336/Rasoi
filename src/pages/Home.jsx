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

const RevolvingFood = ({ emoji, delay, radius = 250, size = 'text-5xl', speed = 20 }) => (
  <motion.div
    animate={{
      rotate: 360
    }}
    transition={{
      duration: speed,
      repeat: Infinity,
      ease: "linear"
    }}
    style={{
      position: 'absolute',
      width: `${radius * 2}px`,
      height: `${radius * 2}px`,
      top: `50%`,
      left: `50%`,
      marginLeft: `-${radius}px`,
      marginTop: `-${radius}px`,
      zIndex: 0,
      pointerEvents: 'none',
    }}
  >
    <motion.div
      animate={{
        rotate: -360
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        marginLeft: '-30px',
        marginTop: '-30px',
      }}
      className={`${size} filter drop-shadow-md`}
    >
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: delay }}
      >
        {emoji}
      </motion.div>
    </motion.div>
  </motion.div>
);

const Home = () => {
  return (
    <div className="min-h-screen bg-[#FFF8F0] overflow-hidden">
      {/* Playful Hero Section */}
      <section className="relative pt-32 pb-20 min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Abstract Blob Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-emerald/10 rounded-full blur-3xl opacity-60"></div>
        </div>

        {/* Outer Orbit */}
        <div className="absolute top-1/2 left-[30%] opacity-20 hidden lg:block">
          <RevolvingFood emoji="🍕" delay={0} radius={350} size="text-7xl" speed={30} />
        </div>

        <div className="absolute top-1/2 right-[30%] opacity-20 hidden lg:block">
          {/* Note: In CSS setting animation starts staggered is tricky without multiple divs, but doing 2 orbits creates fun! */}
          <RevolvingFood emoji="🍔" delay={1} radius={400} size="text-8xl" speed={35} />
        </div>

        {/* Central revolving rings */}
        <div className="absolute top-1/2 left-1/2">
          <RevolvingFood emoji="🍲" delay={0} radius={220} size="text-5xl" speed={15} />
          <RevolvingFood emoji="🥘" delay={0} radius={220} size="text-5xl" speed={15} />
          {/* Positioned at opposite ends due to CSS matrix but let's fake it with rotation wrappers manually if needed.
             Or simpler: just make unique radius rings! */}
          <RevolvingFood emoji="🍝" delay={1} radius={320} size="text-6xl" speed={25} />
          <RevolvingFood emoji="🥗" delay={2} radius={420} size="text-4xl" speed={35} />
          <RevolvingFood emoji="🍦" delay={1.5} radius={150} size="text-6xl" speed={18} />
          <RevolvingFood emoji="🍱" delay={0.5} radius={500} size="text-7xl" speed={40} />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white shadow-sm border border-border rounded-full px-5 py-2 mb-8 rotate-[-2deg] hover:rotate-0 transition-transform cursor-default">
              <span className="text-xl">🔥</span>
              <span className="text-sm font-bold text-primary">Made for students, by students</span>
            </div>

            <h1 className="font-display text-6xl md:text-8xl font-black text-foreground mb-6 leading-[1.1] tracking-tight">
              Hostel Food,<br />
              <span className="text-gradient-warm relative inline-block mt-2">
                But Better 😋
                <svg className="absolute w-full h-4 -bottom-1 left-0 text-accent opacity-50 z-[-1]" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="8" fill="transparent" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto mb-10">
              No more boring paper registers. Check today's menu, vote for new dishes, and manage your mess bills—all from your phone.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link
                to="/menu"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-warm text-white px-10 py-5 rounded-2xl md:rounded-[2rem] text-xl font-bold shadow-warm hover:scale-105 hover:shadow-[0_20px_50px_-10px_rgba(255,87,34,0.4)] transition-all active:scale-95"
              >
                Check Today's Menu 🍲
              </Link>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-foreground border-2 border-border px-8 py-5 rounded-2xl md:rounded-[2rem] text-xl font-bold hover:bg-muted hover:scale-105 transition-all active:scale-95 shadow-sm"
              >
                My Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Vibrant Cards */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground mb-6">
              Why you'll love it 💖
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                className="bg-white rounded-[2rem] p-8 shadow-card border-2 border-transparent hover:border-primary/20 hover:shadow-elevated hover:-translate-y-2 transition-all group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-${feature.gradient === 'warm' ? 'gradient-warm' : 'gradient-emerald'} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform rotate-3 group-hover:rotate-0`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-white border-t border-border mt-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">Rasoi 👨‍🍳</h2>
          <p className="text-muted-foreground font-medium">A step towards Ghar ka khana</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
