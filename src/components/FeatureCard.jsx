import { motion } from "framer-motion";

const FeatureCard = ({ icon: Icon, title, description, gradient = "warm", delay = 0 }) => {
  const gradientClass = gradient === "warm" ? "bg-gradient-warm" : "bg-gradient-emerald";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group relative bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 border border-border"
    >
      <div className={`w-12 h-12 rounded-xl ${gradientClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
