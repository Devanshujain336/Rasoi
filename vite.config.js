/**
 * vite.config.js
 * 
 * @description General Javascript/React File.
 * @usage Used as a module within the application.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
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
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            devOptions: {
                enabled: true // Enable SW in dev for testing
            },
            manifest: {
                name: "Rasoi - Mess Management",
                short_name: "Rasoi",
                description: "Hostel Mess Management System for Offline Sync",
                theme_color: "#ffffff",
                background_color: "#ffffff",
                display: "standalone",
                start_url: "/",
                icons: [
                    {
                        src: "/logo.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable"
                    }
                ]
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
                runtimeCaching: [
                    {
                        urlPattern: /\/api\/billing\/extras/i,
                        handler: "NetworkOnly",
                        method: "POST"
                    },
                    {
                        urlPattern: /\/api\/.*/i,
                        handler: "NetworkFirst",
                        method: "GET",
                        options: {
                            cacheName: "api-cache",
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 24 * 60 * 60 // Cache for 24 hours
                            }
                        }
                    }
                ]
            }
        })
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    test: {
        globals: true,
        // React component tests use jsdom; server tests override with 'node'
        environment: "jsdom",
        setupFiles: ["./src/tests/setup.js"],
        include: ["src/tests/**/*.test.{js,jsx}", "server/tests/**/*.test.js"],
        environmentMatchGlobs: [
            // server-side tests run in Node (no DOM needed)
            ["server/tests/**", "node"],
        ],
        coverage: {
            provider: "v8",
            reporter: ["text", "lcov"],
        },
    },
}));
