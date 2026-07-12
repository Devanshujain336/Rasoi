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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Protected Routes */}
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/extras" element={<ProtectedRoute><ExtrasPage /></ProtectedRoute>} />
            <Route path="/rebate" element={<ProtectedRoute><RebatePage /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
            <Route path="/mhmc" element={<ProtectedRoute><MHMCPage /></ProtectedRoute>} />
            <Route path="/forum" element={<ProtectedRoute><ForumPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;
