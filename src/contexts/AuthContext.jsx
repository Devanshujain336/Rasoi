import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  const fetchProfileAndRole = async (userId) => {
    const [{ data: profileData }, { data: roleData }] = await Promise.all([
      supabase.from("profiles").select("*, hostels(id, name, code)").eq("user_id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId).limit(1).single(),
    ]);
    setProfile(profileData);
    setRole(roleData?.role || "student");
    setHostel(profileData?.hostels || null);

    // Check if blocked
    if (profileData?.hostel_id) {
      const { data: blockData } = await supabase
        .from("blocked_users")
        .select("id")
        .eq("user_id", userId)
        .eq("hostel_id", profileData.hostel_id)
        .maybeSingle();
      setIsBlocked(!!blockData);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfileAndRole(session.user.id);
      } else {
        setProfile(null);
        setRole(null);
        setHostel(null);
        setIsBlocked(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndRole(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = () => supabase.auth.signOut();
  const isMHMC = role === "mhmc" || role === "admin";

  return (
    <AuthContext.Provider value={{
      user, profile, role, loading, signOut, isMHMC, hostel, isBlocked,
      refetchProfile: () => user && fetchProfileAndRole(user.id)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
