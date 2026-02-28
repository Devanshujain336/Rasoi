import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed, LayoutDashboard, Receipt, Vote,
  ScanLine, MessageSquare, Menu, X, CalendarCheck, CreditCard, IndianRupee,
  User, LogOut, Settings, ChevronDown, Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";

const navItems = [
  { path: "/", label: "Home", icon: UtensilsCrossed },
  { path: "/menu", label: "Menu & Polls", icon: CalendarCheck, roles: ["student", "mhmc", "admin", "munimji"] },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["student", "mhmc", "admin", "munimji"] },
  { path: "/extras", label: "Extras", icon: CreditCard, roles: ["admin", "munimji"] },
  { path: "/rebate", label: "Rebate", icon: Receipt, roles: ["student", "mhmc", "admin", "munimji"] },
  { path: "/billing", label: "Billing", icon: IndianRupee, roles: ["student", "mhmc", "admin"] },
  { path: "/mhmc", label: "MHMC", icon: Vote, roles: ["mhmc", "admin"] },
  { path: "/nutrition", label: "AI Nutrition", icon: ScanLine, roles: ["student", "mhmc", "admin"] },
  { path: "/forum", label: "Forum", icon: MessageSquare, roles: ["student", "mhmc", "admin"] },
  { path: "/admin", label: "Admin Panel", icon: Shield, roles: ["admin"] },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, hostel, signOut } = useAuth();

  const handleSignOut = async () => {
    setProfileOpen(false);
    await signOut();
    navigate("/auth");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="text-3xl group-hover:rotate-12 transition-transform drop-shadow-sm">🍲</div>
            <span className="font-display font-black text-2xl text-foreground">
              Rasoi
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    } ${item.roles && !item.roles.includes(role) ? "hidden" : ""}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Profile / Auth */}
          <div className="hidden lg:flex items-center gap-2">
            {user && <NotificationBell />}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-warm flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground leading-none">{profile?.full_name || "Student"}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {hostel?.name ? `${hostel.name} • ` : ""}
                      {role === "mhmc" ? "MHMC Member" : role === "munimji" ? "MunimJi" : role}
                    </p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-card rounded-2xl shadow-elevated border border-border overflow-hidden z-50"
                    >
                      {/* Profile header */}
                      <div className="p-4 border-b-2 border-border bg-[#FFF8F0]">
                        <p className="text-sm font-semibold text-foreground">{profile?.full_name || "Student"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        {profile?.roll_number && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">Roll: {profile.roll_number}</p>
                        )}
                      </div>
                      {/* Links */}
                      <div className="p-2">
                        <Link to="/profile" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors">
                          <Settings className="w-4 h-4 text-muted-foreground" />
                          Edit Profile
                        </Link>
                        <Link to="/dashboard" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors">
                          <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                          My Dashboard
                        </Link>
                        <Link to="/billing" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors">
                          <IndianRupee className="w-4 h-4 text-muted-foreground" />
                          My Billing
                        </Link>
                        {role === "mhmc" && (
                          <Link to="/mhmc" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            MHMC Panel
                          </Link>
                        )}
                        {role === "admin" && (
                          <Link to="/admin" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors font-bold text-primary">
                            <Shield className="w-4 h-4 text-primary" />
                            Admin Panel
                          </Link>
                        )}
                        <button onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors mt-1 border-t border-border">
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/auth"
                className="px-4 py-2 rounded-xl bg-gradient-warm text-primary-foreground text-sm font-semibold shadow-warm hover:shadow-lg hover:scale-[1.02] transition-all">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3 space-y-1">
              {/* Mobile profile header */}
              {user && (
                <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-muted/50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-gradient-warm flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{profile?.full_name || "Student"}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {role === "mhmc" ? "MHMC Member" : role === "munimji" ? "MunimJi" : role}
                    </p>
                  </div>
                </div>
              )}

              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      } ${item.roles && !item.roles.includes(role) ? "hidden" : ""}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}

              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === "/profile" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                    <Settings className="w-4 h-4" /> Profile Settings
                  </Link>
                  <button onClick={() => { setMobileOpen(false); handleSignOut(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 mx-4 py-2.5 rounded-xl bg-gradient-warm text-primary-foreground text-sm font-semibold">
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
