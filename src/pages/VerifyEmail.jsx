import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing from the URL.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await api.verifyEmail(token);
        setStatus("success");
        setMessage(res.message || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.error || err.message || "Failed to verify email. The link may have expired.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4 pt-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-xl border-2 border-border text-center"
      >
        <div className="mb-6 flex justify-center">
          {status === "loading" && <Loader2 className="w-16 h-16 text-primary animate-spin" />}
          {status === "success" && <CheckCircle2 className="w-16 h-16 text-emerald-500" />}
          {status === "error" && <XCircle className="w-16 h-16 text-destructive" />}
        </div>
        
        <h2 className="text-2xl font-black font-display text-foreground mb-4">
          {status === "loading" ? "Verifying..." : status === "success" ? "Verification Complete!" : "Verification Failed"}
        </h2>
        
        <p className="text-muted-foreground mb-8">
          {message}
        </p>

        {status !== "loading" && (
          <button 
            onClick={() => navigate("/auth")}
            className="w-full py-3 rounded-xl bg-gradient-warm text-white font-semibold flex items-center justify-center shadow-md hover:scale-[1.02] transition-transform"
          >
            Go to Login
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
