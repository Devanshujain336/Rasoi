/**
 * App.jsx
 * 
 * @description Main React Application Component.
 * @usage Mounted by the main entry DOM node (index.html -> main.jsx).
 * @details Typically contains top-level router definitions, context provider wrappers, and global layout components (Navbar/Toast container).
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MenuPage from "./pages/MenuPage";
import Dashboard from "./pages/Dashboard";
import ExtrasPage from "./pages/ExtrasPage";
import RebatePage from "./pages/RebatePage";
import MHMCPage from "./pages/MHMCPage";
import ForumPage from "./pages/ForumPage";
import BillingPage from "./pages/BillingPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";

// Setup Persistent Cache for offline usage
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // Keep query data in garbage collection for 24 hours
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 mins
    },
  },
});
const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const App = () => (<PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/extras" element={<ExtrasPage />} />
          <Route path="/rebate" element={<RebatePage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/mhmc" element={<MHMCPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </TooltipProvider>
</PersistQueryClientProvider>);
export default App;
