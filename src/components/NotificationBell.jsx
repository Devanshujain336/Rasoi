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
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) return;
    setSending(true);
    try {
      await api.broadcastNotification({ title: broadcastForm.title, message: broadcastForm.message });
      setBroadcastForm({ title: "", message: "" });
      setShowBroadcast(false);
      fetchNotifications();
    } catch { }
    setSending(false);
  };

  if (!user || !hostel) return null;

  return (
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
                  <button onClick={() => setShowBroadcast(true)} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Send Broadcast">
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

      {/* Broadcast Modal */}
      <AnimatePresence>
        {showBroadcast && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setShowBroadcast(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-card rounded-2xl shadow-elevated border border-border w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-display font-bold text-foreground">Send Broadcast</h3>
                <button onClick={() => setShowBroadcast(false)} className="p-1 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleBroadcast} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</label>
                  <input value={broadcastForm.title} onChange={(e) => setBroadcastForm((f) => ({ ...f, title: e.target.value }))} required maxLength={100}
                    placeholder="Notification title"
                    className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</label>
                  <textarea value={broadcastForm.message} onChange={(e) => setBroadcastForm((f) => ({ ...f, message: e.target.value }))} required maxLength={1000} rows={4}
                    placeholder="Write your announcement..."
                    className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
                <p className="text-[11px] text-muted-foreground">This will be sent to all students in <strong>{hostel?.name}</strong></p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowBroadcast(false)} className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium">Cancel</button>
                  <button type="submit" disabled={sending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-warm text-primary-foreground text-sm font-semibold disabled:opacity-50">
                    <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
