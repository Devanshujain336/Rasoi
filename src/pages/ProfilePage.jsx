import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Hash, Home, Save, AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

const ProfilePage = () => {
  const { user, profile, role, refetchProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    roll_number: profile?.roll_number || "",
    room_number: profile?.room_number || "",
    phone: profile?.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true); setSuccess(false);
    try {
      await api.updateProfile(user.id, form);
      setSuccess(true);
      refetchProfile();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    }
    setLoading(false);
  };

  const roleColors = { student: "bg-primary/10 text-primary", mhmc: "bg-secondary/10 text-secondary", admin: "bg-destructive/10 text-destructive" };

  const InputRow = ({ icon: Icon, label, value, onChange, placeholder, readOnly = false }) => (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text" value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${readOnly
              ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
              : "bg-background border-border text-foreground focus:ring-2 focus:ring-primary/30"
            }`}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information</p>
        </motion.div>

        {/* Avatar & Role Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-warm flex items-center justify-center flex-shrink-0 shadow-warm">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-foreground">{profile?.full_name || "Student"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-3 h-3 text-muted-foreground" />
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${roleColors[role] || roleColors.student}`}>
                  {role === "mhmc" ? "MHMC Member" : role}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border mb-6">
          <h3 className="font-display text-lg font-bold text-foreground mb-5">Personal Information</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <InputRow icon={User} label="Full Name" value={form.full_name} onChange={set("full_name")} placeholder="Your full name" />
            <InputRow icon={Mail} label="Email" value={user?.email || ""} readOnly placeholder="Email" />
            <InputRow icon={Hash} label="Roll Number" value={form.roll_number} onChange={set("roll_number")} placeholder="e.g. 2210110001" />
            <InputRow icon={Home} label="Room Number" value={form.room_number} onChange={set("room_number")} placeholder="e.g. A-204" />
            <InputRow icon={Phone} label="Phone Number" value={form.phone} onChange={set("phone")} placeholder="e.g. 9876543210" />

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Profile updated successfully!
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-warm text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-warm hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-60">
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </motion.div>

        {/* Account Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Account Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member since</span>
              <span className="text-foreground font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hostel</span>
              <span className="text-foreground font-medium">{profile?.hostel_id?.name || "Not assigned"}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
