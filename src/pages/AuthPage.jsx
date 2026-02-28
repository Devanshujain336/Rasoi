import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

const InputField = ({ icon: Icon, type = "text", placeholder, value, onChange, right, required = true, disabled = false }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="w-full pl-10 pr-10 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50"
    />
    {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
  </div>
);

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);
  const [hostelInfo, setHostelInfo] = useState(null);
  const [validatingEmail, setValidatingEmail] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", fullName: "", rollNumber: "", confirmPassword: "" });
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (k === "email" && mode === "signup") {
      setEmailValidated(false);
      setHostelInfo(null);
    }
  };

  const validateEmail = async () => {
    if (!form.email.trim()) return;
    setValidatingEmail(true);
    setError("");
    try {
      const data = await api.validateEmail(form.email.trim());
      if (data.allowed) {
        setEmailValidated(true);
        setHostelInfo(data.hostel);
      } else {
        setError(data.error || "Email not approved.");
      }
    } catch (err) {
      setError(err.message || "Could not validate email. Try again.");
    }
    setValidatingEmail(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await signIn(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!emailValidated) return setError("Please validate your email first.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await signUp({ email: form.email, password: form.password, full_name: form.fullName, roll_number: form.rollNumber });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Could not create account.");
    }
    setLoading(false);
  };

  const handleForgot = (e) => {
    e.preventDefault();
    setSuccess("Please contact your hostel admin to reset your password.");
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4 relative overflow-hidden pt-20">
      {/* Abstract background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 rotate-12 inline-block drop-shadow-md">👨‍🍳</div>
          <h1 className="font-display text-4xl font-black text-foreground">
            Rasoi
          </h1>
          <p className="text-muted-foreground font-medium mt-1">A step towards Ghar ka khana</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2rem] shadow-elevated border-2 border-border overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setSuccess(""); setEmailValidated(false); setHostelInfo(null); }}
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors relative ${mode === m ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
                <div className="space-y-2">
                  <InputField icon={Mail} type="email" placeholder="Enter your approved email" value={form.email} onChange={set("email")} />
                  {!emailValidated && (
                    <button type="button" onClick={validateEmail} disabled={validatingEmail || !form.email.trim()}
                      className="w-full py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm font-medium hover:bg-muted/80 transition-all disabled:opacity-50">
                      {validatingEmail ? "Checking..." : "Verify Email"}
                    </button>
                  )}
                  {emailValidated && hostelInfo && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-sm">
                      <Building2 className="w-4 h-4 text-secondary" />
                      <span className="text-foreground">Hostel: <strong className="text-secondary">{hostelInfo.name}</strong> ({hostelInfo.code})</span>
                    </motion.div>
                  )}
                </div>

                {emailValidated && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                    <InputField icon={User} placeholder="Full Name" value={form.fullName} onChange={set("fullName")} />
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
                  </motion.div>
                )}
              </form>
            )}

            {/* FORGOT */}
            {mode === "forgot" && (
              <form onSubmit={handleForgot} className="space-y-4">
                <p className="text-sm text-muted-foreground">Contact your hostel admin to reset your password.</p>
                <button type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-warm text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-warm hover:scale-[1.01] transition-all">
                  OK, Got it
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
