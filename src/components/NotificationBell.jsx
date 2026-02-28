import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Megaphone, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

const POLL_INTERVAL_MS = 15000;

const timeAgo = (ts) => {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationBell = () => {
  const { user, hostel, isMHMC } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: "", message: "" });
  const [sending, setSending] = useState(false);
  const [broadcastError, setBroadcastError] = useState(null);
  const pollRef = useRef(null);

  const unreadCount = notifications.filter((n) => !readIds.has(n._id)).length;

  const fetchNotifications = async () => {
    if (!user || !hostel) return;
    try {
      const { notifications: notifs, readIds: rIds } = await api.getNotifications();
      setNotifications(notifs || []);
      setReadIds(new Set(rIds || []));
    } catch {
      // Silently fail on polling errors
    }
  };

  useEffect(() => {
    if (!user || !hostel) return;
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [user, hostel]);

  const markAsRead = async (notifId) => {
    if (readIds.has(notifId)) return;
    try {
      await api.markRead([notifId]);
      setReadIds((prev) => new Set([...prev, notifId]));
    } catch { }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !readIds.has(n._id)).map((n) => n._id);
    if (unread.length === 0) return;
    try {
      await api.markRead(unread);
      setReadIds(new Set(notifications.map((n) => n._id)));
    } catch { }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Just in case
    console.log("🔥 SUBMIT CLICKED", broadcastForm);
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      alert("Please fill in both title and message.");
      return;
    }
    setSending(true);
    setBroadcastError(null);
    console.log("⏳ Sending broadcast request...");
    try {
      await api.broadcastNotification({ title: broadcastForm.title, message: broadcastForm.message });
      setBroadcastForm({ title: "", message: "" });
      setShowBroadcast(false);
      fetchNotifications();
    } catch (err) {
      console.error("Broadcast failed:", err);
      setBroadcastError(err?.message ?? "Failed to send broadcast");
    }
    setSending(false);
  };

  if (!user || !hostel) return null;

  return (
    <>
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              className="absolute right-0 top-full mt-2 w-80 bg-card rounded-2xl shadow-elevated border border-border overflow-hidden z-50"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-display font-bold text-foreground text-sm">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[11px] text-primary hover:underline">Mark all read</button>
                  )}
                  {isMHMC && (
                    <button onClick={() => { setShowBroadcast(true); setOpen(false); }} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Send Broadcast">
                      <Megaphone className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">No notifications yet</div>
                ) : (
                  notifications.map((n) => {
                    const isRead = readIds.has(n._id);
                    return (
                      <div
                        key={n._id}
                        onClick={() => markAsRead(n._id)}
                        className={`px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-colors ${isRead ? "bg-card" : "bg-primary/5"}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground">{n.title}</p>
                          {!isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Broadcast Modal - Now outside of the relative wrapper */}
      {showBroadcast && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '30px',
            borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            border: '2px solid #ef4444',
            width: '100%',
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            color: '#000000',
            animation: 'modalEnter 0.3s ease-out'
          }}>
            <style>{`
              @keyframes modalEnter {
                from { opacity: 0; transform: scale(0.9) translateY(20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}</style>

            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-2xl font-black text-gray-900">Broadcast Message</h3>
              <button onClick={() => setShowBroadcast(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-red-600 uppercase tracking-widest">Notification Title</label>
              <input
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Important Announcement"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 outline-none text-lg font-semibold"
                style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-red-600 uppercase tracking-widest">Message Body</label>
              <textarea
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Type your message for all students..."
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 outline-none text-base resize-none"
                style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}
              />
            </div>

            {broadcastError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 font-bold">
                ⚠️ Error: {broadcastError}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => { setShowBroadcast(false); setBroadcastError(null); }}
                className="flex-1 py-4 text-gray-500 font-black hover:bg-gray-100 rounded-xl transition-all uppercase tracking-tighter"
              >
                Discard
              </button>
              <button
                type="button"
                disabled={sending}
                onClick={handleBroadcast}
                className={`flex-1 py-4 font-black rounded-xl shadow-2xl transition-all active:scale-95 uppercase tracking-tighter ${sending ? 'bg-gray-300' : 'bg-red-600 hover:bg-red-700 shadow-red-200'} text-white`}
              >
                {sending ? 'Sending...' : 'Send to Everyone'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationBell;
