import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Building2, Upload, Users, Plus, Shield, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

const AdminPage = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [hostels, setHostels] = useState([]);
  const [newHostel, setNewHostel] = useState({ name: "", code: "" });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [importRole, setImportRole] = useState("student");
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(null); // ID of hostel being deleted
  const fileRef = useRef(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    if (role !== "admin") {
      console.log("🚫 Not an admin, redirecting...");
      // navigate("/"); 
    }

    fetchHostels();
  }, [role, authLoading]);

  useEffect(() => {
    if (selectedHostel) {
      fetchHostelEmails(selectedHostel);
    } else {
      setAllowedEmails([]);
    }
  }, [selectedHostel]);

  const fetchHostelEmails = async (id) => {
    setLoadingEmails(true);
    try {
      const data = await api.getHostelEmails(id);
      setAllowedEmails(data || []);
    } catch (err) {
      console.error("Error fetching emails:", err);
    } finally {
      setLoadingEmails(false);
    }
  };

  const fetchHostels = async () => {
    setLoading(true);
    try {
      const data = await api.getHostels();
      setHostels(data || []);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const addHostel = async (e) => {
    e.preventDefault();
    if (!newHostel.name.trim() || !newHostel.code.trim()) return;
    try {
      await api.createHostel(newHostel);
      setMsg({ type: "success", text: `Hostel "${newHostel.name}" created!` });
      setNewHostel({ name: "", code: "" });
      fetchHostels();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  };

  const deleteHostel = async (e, id, name) => {
    e.stopPropagation(); // Don't select the hostel when clicking delete

    const confirmDelete = window.confirm(
      `⚠️ WARNING: This will permanently delete the hostel "${name}" and ALL its data (Allowed Emails, Profiles, Forum Posts, Comments, and Notifications). This action CANNOT be undone.\n\nAre you absolutely sure?`
    );

    if (!confirmDelete) return;

    setDeleting(id);
    setMsg({ type: "", text: "" });

    try {
      const res = await api.deleteHostel(id);
      setMsg({ type: "success", text: res.message });
      if (selectedHostel === id) setSelectedHostel(null);
      fetchHostels();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setDeleting(null);
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedHostel) return;
    setImporting(true);
    setMsg({ type: "", text: "" });

    const text = await file.text();
    const emails = text
      .split(/[\n,;]/)
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l.includes("@"));

    if (emails.length === 0) {
      setMsg({ type: "error", text: "No valid emails found in the file." });
      setImporting(false);
      return;
    }

    try {
      const data = await api.importStudents({ hostel_id: selectedHostel, emails, role: importRole });
      setMsg({ type: "success", text: `Successfully imported ${data.imported} emails as ${importRole}s.` });
      fetchHostelEmails(selectedHostel); // Refresh list
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }

    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-1">Admin Panel</h1>
          <p className="text-muted-foreground mb-8">Manage hostels and import students</p>

          {msg.text && (
            <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm mb-6 ${msg.type === "error" ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-secondary/10 border-secondary/20 text-secondary"}`}>
              {msg.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              {msg.text}
            </div>
          )}

          {/* Add Hostel */}
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border mb-6">
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Add Hostel
            </h2>
            <form onSubmit={addHostel} className="flex gap-3 flex-wrap">
              <input value={newHostel.name} onChange={(e) => setNewHostel((f) => ({ ...f, name: e.target.value }))} placeholder="Hostel Name (e.g. Boys Hostel 1)" required
                className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input value={newHostel.code} onChange={(e) => setNewHostel((f) => ({ ...f, code: e.target.value }))} placeholder="Code (e.g. BH1)" required
                className="w-28 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-warm text-primary-foreground font-semibold text-sm">
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>
          </div>

          {/* Hostels List */}
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border mb-6">
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Hostels ({hostels.length})
            </h2>
            {hostels.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hostels created yet. Add one above.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hostels.map((h) => (
                  <div key={h._id} className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${selectedHostel === h._id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                    onClick={() => setSelectedHostel(h._id)}>
                    <p className="font-semibold text-foreground text-sm">{h.name}</p>
                    <p className="text-xs text-muted-foreground">Code: {h.code}</p>
                    <button
                      onClick={(e) => deleteHostel(e, h._id, h.name)}
                      disabled={deleting === h._id}
                      className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                    >
                      {deleting === h._id ? (
                        <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Import Students */}
          {selectedHostel && (
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" /> Import to {hostels.find((h) => h._id === selectedHostel)?.name}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</label>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {["student", "mhmc", "munimji"].map((r) => (
                        <button key={r} onClick={() => setImportRole(r)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${importRole === r ? "bg-gradient-warm text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {r === "mhmc" ? <><Shield className="w-3.5 h-3.5 inline mr-1" />MHMC</> : r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upload CSV / TXT</label>
                    <p className="text-xs text-muted-foreground mb-2">File with one email per line or comma-separated emails</p>
                    <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleCSVUpload} disabled={importing}
                      className="w-full text-sm text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-warm file:text-primary-foreground hover:file:cursor-pointer" />
                  </div>
                  {importing && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </div>
                  )}
                </div>
              </motion.div>

              {/* View Records */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-6 shadow-card border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" /> Approved Emails ({allowedEmails.length})
                  </h2>
                  {loadingEmails && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {allowedEmails.length === 0 ? (
                    <p className="p-8 text-center text-sm text-muted-foreground">No emails approved for this hostel yet.</p>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 font-semibold text-muted-foreground">Email</th>
                          <th className="px-6 py-3 font-semibold text-muted-foreground">Role</th>
                          <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Added</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {allowedEmails.map((a) => (
                          <tr key={a._id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4 font-medium text-foreground">{a.email}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${a.role === "mhmc" ? "bg-secondary/10 text-secondary border border-secondary/20" : "bg-primary/10 text-primary border border-primary/20"}`}>
                                {a.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-muted-foreground text-xs">
                              {new Date(a.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;
