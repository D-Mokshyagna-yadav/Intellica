import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress unrelated console errors and warnings
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  const message = String(args[0]);
  
  // Suppress unrelated browser extension errors
  if (
    message.includes("content.js") ||
    message.includes("EventError") ||
    message.includes("failed to execute")
  ) {
    return;
  }
  
  // Log real errors
  originalError(...args);
};

console.warn = (...args: any[]) => {
  const message = String(args[0]);
  
  // Suppress React DevTools warning
  if (message.includes("React DevTools") || message.includes("react-devtools")) {
    return;
  }
  
  // Log real warnings
  originalWarn(...args);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
