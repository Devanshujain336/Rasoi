import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MenuPage from "./pages/MenuPage";
import Dashboard from "./pages/Dashboard";
import ExtrasPage from "./pages/ExtrasPage";
import RebatePage from "./pages/RebatePage";
import MHMCPage from "./pages/MHMCPage";
import NutritionPage from "./pages/NutritionPage";
import ForumPage from "./pages/ForumPage";
import BillingPage from "./pages/BillingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/extras" element={<ExtrasPage />} />
          <Route path="/rebate" element={<RebatePage />} />
          <Route path="/mhmc" element={<MHMCPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
