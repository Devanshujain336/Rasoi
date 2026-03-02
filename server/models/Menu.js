/**
 * Menu.js
 * 
 * @description Mongoose Data Model for Menu.
 * @usage Import this model in routes & controllers to interact with the Menu MongoDB collection.
 * @details Defines schema structure, field validations, and potentially pre/post hooks for database operations.
 */

import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
    data: { type: Object, required: true }, // Store the entire { Monday: { Breakfast: [...]}, ... }
    updated_at: { type: Date, default: Date.now }
});

const Menu = mongoose.model("Menu", menuSchema);
export default Menu;
