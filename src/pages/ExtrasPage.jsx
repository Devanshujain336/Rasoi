import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, User, X } from "lucide-react";

const extraItems = [
  { name: "Ice Cream", price: 30, category: "Desserts" },
  { name: "Gulab Jamun (2pc)", price: 20, category: "Desserts" },
  { name: "Rasmalai", price: 40, category: "Desserts" },
  { name: "Dahi", price: 15, category: "Dairy" },
  { name: "Cold Coffee", price: 25, category: "Beverages" },
  { name: "Lassi", price: 20, category: "Beverages" },
  { name: "Samosa (2pc)", price: 15, category: "Snacks" },
  { name: "Bread Pakora", price: 20, category: "Snacks" },
];

const studentDB = [
  { roll: "2024CS001", name: "Arjun Sharma", photo: null, floor: 2 },
  { roll: "2024CS002", name: "Priya Patel", photo: null, floor: 3 },
  { roll: "2024ME015", name: "Rahul Kumar", photo: null, floor: 1 },
];

const ExtrasPage = () => {
  const [rollSearch, setRollSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [cart, setCart] = useState([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", price: "", category: "Desserts" });
  const [items, setItems] = useState(extraItems);
  const [history, setHistory] = useState([]);

  const handleSearch = () => {
    const found = studentDB.find(s => s.roll.toLowerCase() === rollSearch.toLowerCase());
    setSelectedStudent(found || null);
    setCart([]);
  };

  const addToCart = (item) => {
    setCart([...cart, { ...item, timestamp: new Date().toLocaleTimeString() }]);
  };

  const confirmBill = () => {
    const total = cart.reduce((sum, i) => sum + i.price, 0);
    setHistory([{ student: selectedStudent, items: [...cart], total, date: new Date().toLocaleDateString() }, ...history]);
    setCart([]);
    setSelectedStudent(null);
    setRollSearch("");
  };

  const addNewItem = () => {
    if (!newItem.name || !newItem.price) return;
    setItems([...items, { name: newItem.name, price: Number(newItem.price), category: newItem.category }]);
    setNewItem({ name: "", price: "", category: "Desserts" });
    setShowAddItem(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Extra Items Billing</h1>
          <p className="text-muted-foreground">Quick digital billing — no more paper registers</p>
        </motion.div>

        {/* Search */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={rollSearch}
                onChange={e => setRollSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Enter Roll Number (e.g., 2024CS001)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button onClick={handleSearch} className="px-6 py-3 rounded-xl bg-gradient-warm text-primary-foreground font-medium text-sm">
              Search
            </button>
          </div>

          {/* Student Card */}
          <AnimatePresence>
            {selectedStudent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 rounded-xl bg-muted/50 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-warm flex items-center justify-center">
                  <User className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedStudent.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedStudent.roll} • Floor {selectedStudent.floor}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Item Buttons & Cart */}
        {selectedStudent && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-foreground">Tap to add items</h2>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald/10 text-emerald text-xs font-medium hover:bg-emerald/20 transition-colors"
                >
                  <Plus className="w-3 h-3" /> New Item
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map(item => (
                  <button
                    key={item.name}
                    onClick={() => addToCart(item)}
                    className="px-4 py-2.5 rounded-xl bg-muted border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-sm"
                  >
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="text-primary ml-2 font-semibold">₹{item.price}</span>
                  </button>
                ))}
              </div>

              {/* Add New Item Modal */}
              <AnimatePresence>
                {showAddItem && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 rounded-xl bg-muted border border-border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-sm text-foreground">Add New Item</span>
                      <button onClick={() => setShowAddItem(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="Item name" className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      <input value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} placeholder="Price" type="number" className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option>Desserts</option><option>Beverages</option><option>Snacks</option><option>Dairy</option>
                      </select>
                    </div>
                    <button onClick={addNewItem} className="mt-3 px-4 py-2 rounded-lg bg-gradient-emerald text-secondary-foreground text-sm font-medium">Add Item</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            {cart.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h3 className="font-display font-semibold text-foreground mb-3">Current Bill</h3>
                <div className="space-y-2 mb-4">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm p-2 rounded-lg bg-muted/50">
                      <span className="text-foreground">{item.name}</span>
                      <span className="text-primary font-medium">₹{item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center border-t border-border pt-3 mb-4">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-display font-bold text-gradient-warm">₹{cart.reduce((s, i) => s + i.price, 0)}</span>
                </div>
                <button onClick={confirmBill} className="w-full py-3 rounded-xl bg-gradient-warm text-primary-foreground font-semibold hover:scale-[1.02] transition-transform">
                  Confirm & Save
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExtrasPage;
