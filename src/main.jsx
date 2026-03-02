/**
 * main.jsx
 * 
 * @description React DOM Render Entry Point.
 * @usage Invoked by the bundler (Vite/Webpack) to inject the App into the HTML file.
 */

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
createRoot(document.getElementById("root")).render(<App />);
