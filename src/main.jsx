/**
 * main.jsx
 * 
 * @description React DOM Render Entry Point.
 * @usage Invoked by the bundler (Vite/Webpack) to inject the App into the HTML file.
 */

import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";

if ("serviceWorker" in navigator) {
    registerSW({ immediate: true });
}

createRoot(document.getElementById("root")).render(<App />);
