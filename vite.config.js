/**
 * vite.config.js
 * 
 * @description General Javascript/React File.
 * @usage Used as a module within the application.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
        hmr: {
            overlay: false,
        },
    },
    plugins: [react()].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
