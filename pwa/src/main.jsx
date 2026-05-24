import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

// Register Service Worker for PWA (provided by vite-plugin-pwa)
import { registerSW } from 'virtual:pwa-register';
registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
