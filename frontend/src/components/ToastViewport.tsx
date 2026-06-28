import { useEffect, useState } from "react";

// Fallback UUID generator for browsers that don't support crypto.randomUUID()
const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback implementation
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function ToastViewport() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event: any) => {
      const id = generateUUID();
      const toast = {
        id,
        type: event.detail?.type || "info",
        message: event.detail?.message || "Notification",
      };

      setToasts((current) => [...current, toast]);
      setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 3500);
    };

    window.addEventListener("app:toast", handleToast);
    return () => window.removeEventListener("app:toast", handleToast);
  }, []);

  return (
    <div style={viewportStyle}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{ ...toastStyle, ...typeStyles[toast.type] }}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

const viewportStyle = {
  position: "fixed",
  top: 16,
  right: 16,
  zIndex: 1200,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const toastStyle = {
  minWidth: 240,
  maxWidth: 360,
  padding: "12px 16px",
  borderRadius: 12,
  color: "#fff",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
  fontSize: 14,
};

const typeStyles = {
  success: { background: "#15803d" },
  error: { background: "#b91c1c" },
  info: { background: "#1d4ed8" },
};
