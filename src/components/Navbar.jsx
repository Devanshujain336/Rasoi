import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed, LayoutDashboard, Receipt, Vote,
  MessageSquare, Menu, X, CalendarCheck, CreditCard, IndianRupee,
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
  { path: "/forum", label: "Forum", icon: MessageSquare, roles: ["student", "mhmc", "admin"] },
  { path: "/admin", label: "Admin Panel", icon: Shield, roles: ["admin"] },
];

const mobileBottomNavItems = [
  { path: "/", label: "Home", icon: UtensilsCrossed },
  { path: "/menu", label: "Menu", icon: CalendarCheck, roles: ["student", "mhmc", "admin", "munimji"] },
  { path: "/dashboard", label: "Dash", icon: LayoutDashboard, roles: ["student", "mhmc", "admin", "munimji"] },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, hostel, signOut } = useAuth();

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await signOut();
    navigate("/auth");
  };

  return (
    <>
      {/* DESKTOP NAVBAR */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="text-3xl group-hover:rotate-12 transition-transform drop-shadow-sm">🍲</div>
              <span className="font-display font-black text-2xl text-foreground">
                Rasoi
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="flex items-center gap-1">
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
            <div className="flex items-center gap-2">
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
                    <div className="text-left hidden lg:block">
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
          </div>
        </div>
      </nav>

      {/* MOBILE APP BAR (TOP) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-border shadow-sm z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="text-2xl drop-shadow-sm">🍲</div>
          <span className="font-display font-black text-xl text-foreground">Rasoi</span>
        </Link>
        <div className="flex items-center gap-3">
          {user && <NotificationBell />}
          {user ? (
            <Link to="/profile">
              <div className="w-8 h-8 rounded-full bg-gradient-warm flex items-center justify-center flex-shrink-0 shadow-sm border border-orange-200">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            </Link>
          ) : (
            <Link to="/auth" className="px-3 py-1.5 rounded-lg bg-gradient-warm text-primary-foreground text-xs font-semibold shadow-warm">
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_25px_-5px_rgba(0,0,0,0.1)] pb-safe">
        <div className="flex items-center justify-around h-[70px] px-2 relative">
          {mobileBottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            if (item.roles && !item.roles.includes(role)) return null;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`relative flex flex-col items-center justify-center w-16 h-full gap-1 transition-all ${isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute -top-[1px] w-10 h-1 bg-primary rounded-b-[4px] shadow-[0_4px_10px_rgba(255,87,34,0.5)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={`w-6 h-6 ${isActive ? 'fill-primary/10' : ''}`} />
                <span className={`text-[10px] font-semibold ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              </Link>
            );
          })}

          {/* More Action */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all ${mobileOpen ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <div className={`transition-transform duration-300 ${mobileOpen ? 'rotate-90' : ''}`}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </div>
            <span className={`text-[10px] font-semibold ${mobileOpen ? 'font-bold' : ''}`}>More</span>
          </button>
        </div>
      </div>

      {/* MOBILE FULL SCREEN "MORE" MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-x-0 bottom-[70px] top-14 z-40 bg-background/95 backdrop-blur-2xl flex flex-col overflow-y-auto"
          >
            <div className="container mx-auto px-4 py-8 space-y-2 pb-32">
              {user && (
                <div className="flex items-center gap-4 px-4 py-4 mb-6 bg-white rounded-2xl border border-border shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center flex-shrink-0 shadow-warm">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-base font-black text-foreground font-display">{profile?.full_name || "Student"}</p>
                    <p className="text-xs text-muted-foreground capitalize font-medium">
                      {role === "mhmc" ? "MHMC Member" : role === "munimji" ? "MunimJi" : role}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-8">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const isBottomNative = mobileBottomNavItems.find(bn => bn.path === item.path);
                  if (item.roles && !item.roles.includes(role)) return null;
                  if (isBottomNative) return null;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex flex-col max-w-full items-start gap-3 p-4 rounded-2xl text-sm font-bold transition-all ${isActive ? "bg-primary text-white shadow-warm" : "bg-white text-foreground hover:bg-muted border border-border shadow-sm"
                        }`}
                    >
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <span className="truncate w-full text-base">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {user && (
                <div className="space-y-3 pt-6 border-t font-display border-border">
                  <Link to="/profile" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-4 bg-white rounded-2xl border border-border shadow-sm text-base font-bold transition-colors text-foreground hover:bg-muted">
                    <Settings className="w-6 h-6 text-muted-foreground" /> Profile Settings
                  </Link>
                  <button onClick={() => { setMobileOpen(false); handleSignOut(); }}
                    className="w-full flex items-center gap-3 px-4 py-4 bg-white rounded-2xl border border-transparent border-red-100 shadow-sm text-base font-bold text-destructive hover:bg-destructive/5 transition-colors">
                    <LogOut className="w-6 h-6" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
