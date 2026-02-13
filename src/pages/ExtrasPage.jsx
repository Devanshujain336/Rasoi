import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, User, X, Delete, Check, Clock, ShoppingBag, Minus } from "lucide-react";

const extraItems = [
  { id: "1", name: "Ice Cream", price: 20, category: "desserts" },
  { id: "2", name: "Gulab Jamun (2pc)", price: 25, category: "sweets" },
  { id: "3", name: "Rasmalai", price: 30, category: "sweets" },
  { id: "4", name: "Dahi", price: 10, category: "dairy" },
  { id: "5", name: "Cold Coffee", price: 25, category: "beverages" },
  { id: "6", name: "Lassi", price: 20, category: "beverages" },
  { id: "7", name: "Samosa (2pc)", price: 15, category: "snacks" },
  { id: "8", name: "Bread Pakora", price: 20, category: "snacks" },
  { id: "9", name: "Cold Drink", price: 20, category: "beverages" },
  { id: "10", name: "Chocolate Milk", price: 25, category: "beverages" },
];

const studentDB = [
  { id: "s1", roll: "2024CS001", name: "Arjun Sharma", photo: null, floor: 2, monthExtras: 450 },
  { id: "s2", roll: "2024CS002", name: "Priya Patel", photo: null, floor: 3, monthExtras: 320 },
  { id: "s3", roll: "2024ME015", name: "Rahul Kumar", photo: null, floor: 1, monthExtras: 180 },
  { id: "s4", roll: "2024EE010", name: "Sneha Gupta", photo: null, floor: 2, monthExtras: 560 },
];

const categoryGradients = {
  desserts: "from-pink-500 to-rose-400",
  sweets: "from-amber-500 to-orange-400",
  dairy: "from-sky-500 to-blue-400",
  beverages: "from-teal-500 to-cyan-400",
  snacks: "from-violet-500 to-purple-400",
  other: "from-slate-500 to-gray-400",
};

const categoryBorders = {
  desserts: "border-pink-300/50",
  sweets: "border-amber-300/50",
  dairy: "border-sky-300/50",
  beverages: "border-teal-300/50",
  snacks: "border-violet-300/50",
  other: "border-slate-300/50",
};

const ExtrasPage = () => {
  const [rollNumber, setRollNumber] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [items, setItems] = useState(extraItems);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", price: "", category: "desserts" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([
    { student: "Arjun Sharma", roll: "2024CS001", items: ["Ice Cream", "Lassi"], total: 40, time: "2:30 PM" },
    { student: "Priya Patel", roll: "2024CS002", items: ["Gulab Jamun"], total: 25, time: "2:15 PM" },
    { student: "Rahul Kumar", roll: "2024ME015", items: ["Cold Coffee", "Samosa"], total: 40, time: "1:50 PM" },
    { student: "Sneha Gupta", roll: "2024EE010", items: ["Rasmalai", "Dahi"], total: 40, time: "1:30 PM" },
  ]);

  const handleNumberClick = (num) => {
    if (rollNumber.length < 12) setRollNumber(prev => prev + num);
  };

  const handleBackspace = () => setRollNumber(prev => prev.slice(0, -1));
  const handleClear = () => setRollNumber("");

  const searchStudent = () => {
    const found = studentDB.find(s => s.roll.toLowerCase() === rollNumber.toLowerCase());
    if (found) {
      setSelectedStudent(found);
      setSelectedItems([]);
    }
  };

  const handleItemSelect = (item) => {
    const existing = selectedItems.find(i => i.id === item.id);
    if (existing) {
      setSelectedItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setSelectedItems(prev => [...prev, { ...item, quantity: 1 }]);
    }
  };

  const decrementItem = (id) => {
    setSelectedItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item && item.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const removeItem = (id) => setSelectedItems(prev => prev.filter(i => i.id !== id));

  const totalAmount = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleConfirm = () => {
    setRecentTransactions(prev => [{
      student: selectedStudent.name,
      roll: selectedStudent.roll,
      items: selectedItems.map(i => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`),
      total: totalAmount,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }, ...prev.slice(0, 9)]);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedStudent(null);
      setSelectedItems([]);
      setRollNumber("");
    }, 2500);
  };

  const handleCancel = () => {
    setSelectedStudent(null);
    setSelectedItems([]);
    setRollNumber("");
  };

  const addNewItem = () => {
    if (!newItem.name || !newItem.price) return;
    const id = String(items.length + 1);
    setItems(prev => [...prev, { id, name: newItem.name, price: Number(newItem.price), category: newItem.category }]);
    setNewItem({ name: "", price: "", category: "desserts" });
    setShowAddItem(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Extra Items Billing System</h1>
          <p className="text-muted-foreground">Quick digital billing — no more paper registers</p>
        </motion.div>

        {/* Success Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
            >
              <div className="bg-card rounded-3xl p-10 shadow-elevated text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-gradient-emerald flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-10 h-10 text-primary-foreground" />
                </motion.div>
                <p className="text-2xl font-display font-bold text-foreground">₹{totalAmount} Billed</p>
                <p className="text-muted-foreground mt-1">to {selectedStudent?.name}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Number Pad / Student Card */}
            <AnimatePresence mode="wait">
              {!selectedStudent ? (
                <motion.div
                  key="numpad"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-card rounded-2xl p-6 shadow-card border border-border"
                >
                  {/* Roll Number Input */}
                  <div className="flex gap-2 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={rollNumber}
                        readOnly
                        placeholder="Enter Roll Number"
                        className="w-full pl-10 pr-4 py-4 rounded-xl bg-muted border border-border text-foreground text-lg font-mono tracking-widest placeholder:text-muted-foreground placeholder:tracking-normal placeholder:font-sans focus:outline-none"
                      />
                    </div>
                    <button onClick={handleClear} className="px-4 py-3 rounded-xl bg-muted border border-border text-muted-foreground font-medium text-sm hover:bg-destructive/10 hover:text-destructive transition-colors">
                      Clear
                    </button>
                    <button onClick={searchStudent} className="px-6 py-3 rounded-xl bg-gradient-warm text-primary-foreground font-semibold text-sm shadow-warm hover:scale-[1.02] transition-transform">
                      Search
                    </button>
                  </div>

                  {/* Number Pad */}
                  <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <motion.button
                        key={num}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleNumberClick(String(num))}
                        className="h-[72px] rounded-2xl bg-muted border border-border text-foreground text-2xl font-semibold hover:bg-primary/10 hover:border-primary/30 active:bg-primary/20 transition-all"
                      >
                        {num}
                      </motion.button>
                    ))}
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleNumberClick("0")}
                      className="h-[72px] rounded-2xl bg-muted border border-border text-foreground text-2xl font-semibold hover:bg-primary/10 hover:border-primary/30 transition-all col-start-2"
                    >
                      0
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={handleBackspace}
                      className="h-[72px] rounded-2xl bg-muted border border-border text-muted-foreground text-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all col-start-3 flex items-center justify-center"
                    >
                      <Delete className="w-6 h-6" />
                    </motion.button>
                    {/* Letter shortcuts for common prefixes */}
                    <div className="col-span-3 flex gap-2 mt-2">
                      {["2024CS", "2024ME", "2024EE"].map(prefix => (
                        <button
                          key={prefix}
                          onClick={() => setRollNumber(prefix)}
                          className="flex-1 py-2 rounded-xl bg-muted/50 border border-border text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {prefix}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="student"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Student Card */}
                  <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-warm flex items-center justify-center shadow-warm">
                        <User className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-display font-bold text-foreground">{selectedStudent.name}</h2>
                        <p className="text-sm text-muted-foreground">{selectedStudent.roll} • Floor {selectedStudent.floor}</p>
                        <p className="text-xs mt-1">
                          <span className="text-muted-foreground">Month's Extras: </span>
                          <span className="font-semibold text-primary">₹{selectedStudent.monthExtras}</span>
                        </p>
                      </div>
                      <button onClick={handleCancel} className="p-2 rounded-xl hover:bg-muted transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Items Grid */}
                  <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                    <h3 className="font-display font-semibold text-foreground mb-4">Tap to add items</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {items.map((item, i) => (
                        <motion.button
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleItemSelect(item)}
                          className={`relative p-4 rounded-2xl border ${categoryBorders[item.category] || categoryBorders.other} bg-card hover:shadow-card transition-all text-left group overflow-hidden`}
                        >
                          <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${categoryGradients[item.category] || categoryGradients.other}`} />
                          <span className="block text-sm font-medium text-foreground">{item.name}</span>
                          <span className="block text-lg font-bold text-primary mt-1">₹{item.price}</span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.category}</span>
                          {/* Quantity badge if already in cart */}
                          {selectedItems.find(si => si.id === item.id) && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-warm text-primary-foreground text-xs font-bold flex items-center justify-center"
                            >
                              {selectedItems.find(si => si.id === item.id).quantity}
                            </motion.span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Items Summary / Cart */}
                  <AnimatePresence>
                    {selectedItems.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-card rounded-2xl p-6 shadow-card border border-border"
                      >
                        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5 text-primary" /> Selected Items
                        </h3>
                        <div className="space-y-2 mb-4">
                          {selectedItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                              <span className="text-sm font-medium text-foreground flex-1">{item.name}</span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => decrementItem(item.id)} className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center hover:bg-destructive/10 transition-colors">
                                  <Minus className="w-3 h-3 text-muted-foreground" />
                                </button>
                                <span className="text-sm font-semibold text-foreground w-6 text-center">{item.quantity}</span>
                                <button onClick={() => handleItemSelect(item)} className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center hover:bg-emerald/10 transition-colors">
                                  <Plus className="w-3 h-3 text-muted-foreground" />
                                </button>
                              </div>
                              <span className="text-sm font-bold text-primary w-16 text-right">₹{item.price * item.quantity}</span>
                              <button onClick={() => removeItem(item.id)} className="ml-2 p-1 rounded-lg hover:bg-destructive/10 transition-colors">
                                <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center border-t border-border pt-4 mb-4">
                          <span className="font-semibold text-foreground">Total</span>
                          <span className="text-2xl font-display font-bold text-gradient-warm">₹{totalAmount}</span>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={handleCancel} className="flex-1 py-3 rounded-xl bg-muted border border-border text-muted-foreground font-medium hover:bg-destructive/10 hover:text-destructive transition-colors">
                            Cancel
                          </button>
                          <button onClick={handleConfirm} className="flex-[2] py-3 rounded-xl bg-gradient-warm text-primary-foreground font-semibold shadow-warm hover:scale-[1.02] transition-transform">
                            Confirm & Bill — ₹{totalAmount}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar — Recent Transactions */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
              <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Recent Transactions
              </h3>
              <div className="space-y-3">
                {recentTransactions.map((tx, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-xl bg-muted/50 border border-border"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.student}</p>
                        <p className="text-xs text-muted-foreground">{tx.roll}</p>
                      </div>
                      <span className="text-sm font-bold text-primary">₹{tx.total}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{tx.items.join(", ")}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{tx.time}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAB — Add New Item */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddItem(true)}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-gradient-emerald text-primary-foreground shadow-elevated flex items-center justify-center z-40"
        >
          <Plus className="w-6 h-6" />
        </motion.button>

        {/* Add Item Modal */}
        <AnimatePresence>
          {showAddItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
              onClick={() => setShowAddItem(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-card rounded-2xl p-8 shadow-elevated border border-border w-full max-w-md mx-4"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold text-foreground">Add New Item</h2>
                  <button onClick={() => setShowAddItem(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Item Name</label>
                    <input
                      value={newItem.name}
                      onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="e.g., Chocolate Milk"
                      maxLength={50}
                      className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Price (₹)</label>
                    <input
                      value={newItem.price}
                      onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                      placeholder="e.g., 25"
                      type="number"
                      min={1}
                      step={0.5}
                      className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                    <select
                      value={newItem.category}
                      onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="desserts">Desserts</option>
                      <option value="beverages">Beverages</option>
                      <option value="snacks">Snacks</option>
                      <option value="dairy">Dairy Products</option>
                      <option value="sweets">Sweets</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowAddItem(false)} className="flex-1 py-3 rounded-xl bg-muted border border-border text-muted-foreground font-medium hover:bg-destructive/10 transition-colors">
                    Cancel
                  </button>
                  <button onClick={addNewItem} className="flex-1 py-3 rounded-xl bg-gradient-emerald text-primary-foreground font-semibold hover:scale-[1.02] transition-transform">
                    Add Item
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExtrasPage;
