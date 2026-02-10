import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Scan, Flame, Beef, Wheat, Droplets, Apple, Zap, Heart, Activity } from "lucide-react";

const sampleAnalysis = {
  name: "Dal Chawal with Roti & Mixed Veg",
  calories: 520,
  rating: 7.5,
  macros: { protein: 18, carbs: 72, fat: 14, fiber: 8 },
  micros: [
    { name: "Vitamin A", value: "25%", icon: Apple },
    { name: "Iron", value: "35%", icon: Zap },
    { name: "Calcium", value: "15%", icon: Heart },
    { name: "Vitamin C", value: "20%", icon: Activity },
  ],
  burnEquivalent: "45 min jogging",
  glycemicIndex: "Medium (55)",
  suggestions: [
    "Add a serving of curd for extra protein & probiotics",
    "Include a green salad for more fiber and vitamins",
    "This meal covers 26% of your daily caloric needs",
  ],
};

const NutritionPage = () => {
  const [scanned, setScanned] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleScan = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setScanned(true);
    }, 2000);
  };

  const data = sampleAnalysis;
  const totalMacros = data.macros.protein + data.macros.carbs + data.macros.fat;

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">AI Nutrition Scanner</h1>
          <p className="text-muted-foreground">Snap your meal and get instant nutritional insights</p>
        </motion.div>

        {/* Scanner */}
        {!scanned && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-10 shadow-card border border-border text-center"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-warm mx-auto flex items-center justify-center mb-6">
              {analyzing ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Scan className="w-10 h-10 text-primary-foreground" />
                </motion.div>
              ) : (
                <Camera className="w-10 h-10 text-primary-foreground" />
              )}
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              {analyzing ? "Analyzing your meal..." : "Take a photo of your meal"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {analyzing ? "Our AI is identifying ingredients and calculating nutrients" : "Point your camera at the food for instant analysis"}
            </p>
            {!analyzing && (
              <button onClick={handleScan} className="px-8 py-3.5 rounded-xl bg-gradient-warm text-primary-foreground font-semibold shadow-warm hover:scale-105 transition-transform">
                <span className="flex items-center gap-2"><Camera className="w-4 h-4" /> Scan Meal</span>
              </button>
            )}
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {scanned && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Header Card */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">{data.name}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{data.burnEquivalent} to burn</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-warm flex items-center justify-center">
                      <span className="text-xl font-bold text-primary-foreground">{data.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">Health Score</span>
                  </div>
                </div>

                {/* Calories */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 mb-4">
                  <Flame className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-2xl font-display font-bold text-foreground">{data.calories}</p>
                    <p className="text-xs text-muted-foreground">Total Calories</p>
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Protein", value: data.macros.protein, icon: Beef, color: "bg-emerald/20 text-emerald" },
                    { label: "Carbs", value: data.macros.carbs, icon: Wheat, color: "bg-accent/30 text-accent-foreground" },
                    { label: "Fat", value: data.macros.fat, icon: Droplets, color: "bg-primary/20 text-primary" },
                    { label: "Fiber", value: data.macros.fiber, icon: Apple, color: "bg-emerald/20 text-emerald" },
                  ].map(macro => (
                    <div key={macro.label} className="text-center p-3 rounded-xl bg-muted/50">
                      <macro.icon className={`w-5 h-5 mx-auto mb-1 ${macro.color.split(" ")[1]}`} />
                      <p className="text-lg font-bold text-foreground">{macro.value}g</p>
                      <p className="text-xs text-muted-foreground">{macro.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Macro Distribution Bar */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h3 className="font-display font-semibold text-foreground mb-3">Macro Distribution</h3>
                <div className="h-4 rounded-full overflow-hidden flex">
                  <div style={{ width: `${(data.macros.protein / totalMacros) * 100}%` }} className="bg-emerald" />
                  <div style={{ width: `${(data.macros.carbs / totalMacros) * 100}%` }} className="bg-accent" />
                  <div style={{ width: `${(data.macros.fat / totalMacros) * 100}%` }} className="bg-primary" />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald" /> Protein {Math.round((data.macros.protein / totalMacros) * 100)}%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> Carbs {Math.round((data.macros.carbs / totalMacros) * 100)}%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Fat {Math.round((data.macros.fat / totalMacros) * 100)}%</span>
                </div>
              </div>

              {/* Micronutrients */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h3 className="font-display font-semibold text-foreground mb-3">Micronutrients (% Daily)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {data.micros.map(micro => (
                    <div key={micro.name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <micro.icon className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground">{micro.name}</span>
                          <span className="font-semibold text-foreground">{micro.value}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted mt-1">
                          <div className="h-full rounded-full bg-gradient-warm" style={{ width: micro.value }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h3 className="font-display font-semibold text-foreground mb-3">💡 AI Recommendations</h3>
                <ul className="space-y-2">
                  {data.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-primary font-bold">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              <button onClick={() => setScanned(false)} className="w-full py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors">
                Scan Another Meal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NutritionPage;
