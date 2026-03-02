/**
 * utils.js
 * 
 * @description Frontend Library / Utility Helper Functions.
 * @usage Imported where needed for repeated tasks like API fetching wrappers or classname merges (cn).
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
