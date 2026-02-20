import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", fullName: "", rollNumber: "", confirmPassword: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    setLoading(false);
    if (error) setError(error.message);
    else navigate("/dashboard");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, roll_number: form.rollNumber }, emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) setError(error.message);
    else { setSuccess("Account created! Please check your email to verify your account."); setMode("login"); }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: `${window.location.origin}/reset-password` });
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess("Password reset link sent! Check your email.");
  };

  const InputField = ({ icon: Icon, type = "text", placeholder, value, onChange, right }) => (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full pl-10 pr-10 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
      />
      {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-warm flex items-center justify-center mx-auto mb-3 shadow-warm">
            <UtensilsCrossed className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Mess<span className="text-gradient-warm">Hub</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Student Mess Management System</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors relative ${
                  mode === m ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
                {mode === m && (
                  <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-warm" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Error / Success */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-sm mb-4">
                  ✓ {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* LOGIN */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <InputField icon={Mail} type="email" placeholder="Email address" value={form.email} onChange={set("email")} />
                <InputField
                  icon={Lock} type={showPassword ? "text" : "password"} placeholder="Password"
                  value={form.password} onChange={set("password")}
                  right={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  }
                />
                <div className="text-right">
                  <button type="button" onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}
                    className="text-xs text-primary hover:underline">Forgot password?</button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-warm text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-warm hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-60">
                  {loading ? "Signing in..." : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}

            {/* SIGNUP */}
            {mode === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                <InputField icon={User} placeholder="Full Name" value={form.fullName} onChange={set("fullName")} />
                <InputField icon={Mail} type="email" placeholder="Email address" value={form.email} onChange={set("email")} />
                <input
                  type="text" placeholder="Roll Number (optional)"
                  value={form.rollNumber} onChange={set("rollNumber")}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <InputField
                  icon={Lock} type={showPassword ? "text" : "password"} placeholder="Password (min 6 chars)"
                  value={form.password} onChange={set("password")}
                  right={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  }
                />
                <InputField icon={Lock} type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={set("confirmPassword")} />
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-warm text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-warm hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-60">
                  {loading ? "Creating account..." : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}

            {/* FORGOT */}
            {mode === "forgot" && (
              <form onSubmit={handleForgot} className="space-y-4">
                <p className="text-sm text-muted-foreground">Enter your email and we'll send a reset link.</p>
                <InputField icon={Mail} type="email" placeholder="Email address" value={form.email} onChange={set("email")} />
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-warm text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-warm hover:scale-[1.01] transition-all disabled:opacity-60">
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <button type="button" onClick={() => setMode("login")} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← Back to sign in
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
