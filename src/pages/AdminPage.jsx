import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Building2, Upload, Users, Plus, Trash2, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [hostels, setHostels] = useState([]);
  const [newHostel, setNewHostel] = useState({ name: "", code: "" });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [importRole, setImportRole] = useState("student");
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (role !== "admin") { navigate("/"); return; }
    fetchHostels();
  }, [role]);

  const fetchHostels = async () => {
    const { data } = await supabase.from("hostels").select("*").order("name");
    setHostels(data || []);
    setLoading(false);
  };

  const addHostel = async (e) => {
    e.preventDefault();
    if (!newHostel.name.trim() || !newHostel.code.trim()) return;
    const { error } = await supabase.from("hostels").insert(newHostel);
    if (error) setMsg({ type: "error", text: error.message });
    else { setMsg({ type: "success", text: `Hostel "${newHostel.name}" created!` }); setNewHostel({ name: "", code: "" }); fetchHostels(); }
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

    const { data, error } = await supabase.functions.invoke("import-students", {
      body: { hostel_id: selectedHostel, emails, role: importRole },
    });

    if (error) setMsg({ type: "error", text: error.message });
    else setMsg({ type: "success", text: `Successfully imported ${data.imported} emails as ${importRole}s.` });

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
                  <div key={h.id} className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedHostel === h.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                    onClick={() => setSelectedHostel(h.id)}>
                    <p className="font-semibold text-foreground text-sm">{h.name}</p>
                    <p className="text-xs text-muted-foreground">Code: {h.code}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Import Students */}
          {selectedHostel && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border">
              <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" /> Import Students to {hostels.find((h) => h.id === selectedHostel)?.name}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</label>
                  <div className="flex gap-2 mt-1.5">
                    {["student", "mhmc"].map((r) => (
                      <button key={r} onClick={() => setImportRole(r)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${importRole === r ? "bg-gradient-warm text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {r === "mhmc" ? <><Shield className="w-3.5 h-3.5 inline mr-1" />MHMC</> : "Student"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upload CSV / TXT</label>
                  <p className="text-xs text-muted-foreground mb-2">File with one email per line or comma-separated emails</p>
                  <input ref={fileRef} type="file" accept=".csv,.txt,.xlsx" onChange={handleCSVUpload} disabled={importing}
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
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;
