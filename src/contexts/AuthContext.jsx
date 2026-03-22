/**
 * AuthContext.jsx
 * 
 * @description React Context Provider.
 * @usage Wrap around the application or sub-components to provide global state.
 * @details Contains state variables and updater functions that avoid prop-drilling. Uses React.createContext and useContext.
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { setToken } from "@/lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  const loadSession = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    try {
      console.log("🔄 Loading session...");
      const data = await api.me();
      console.log("✅ Session loaded. User:", data.user?.email, "Role:", data.role);
      setUser(data.user);
      setProfile(data.profile);
      setRole(data.role);
      setHostel(data.hostel);
      setIsBlocked(data.isBlocked || false);
    } catch (err) {
      console.error("❌ Session load failed:", err);
      // Token invalid or expired — clear it
      setToken(null);
      setUser(null);
      setProfile(null);
      setRole(null);
      setHostel(null);
      setIsBlocked(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const signIn = async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.token);
    // Use the data returned directly from login to save a network request
    setUser(data.user);
    setProfile(data.profile);
    setRole(data.role);
    setHostel(data.hostel);
    setIsBlocked(data.isBlocked || false);
  };

  const signUp = async (body) => {
    const data = await api.signup(body);
    return data;
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    setRole(null);
    setHostel(null);
    setIsBlocked(false);
  };

  const refetchProfile = () => loadSession();
  const isMHMC = role === "mhmc" || role === "admin";

  return (
    <AuthContext.Provider value={{
      user, profile, role, loading, signIn, signUp, signOut,
      isMHMC, hostel, isBlocked, refetchProfile,
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
