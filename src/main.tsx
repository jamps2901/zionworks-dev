import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { trackBundleSize } from "./lib/performance";

// Track bundle performance in development
if (import.meta.env.DEV) {
  trackBundleSize();
}

createRoot(document.getElementById("root")!).render(<App />);
