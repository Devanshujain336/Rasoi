import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
    data: { type: Object, required: true }, // Store the entire { Monday: { Breakfast: [...]}, ... }
    updated_at: { type: Date, default: Date.now }
});

const Menu = mongoose.model("Menu", menuSchema);
export default Menu;
