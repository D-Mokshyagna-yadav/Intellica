import { useState } from "react";
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from "../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "../types";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteOne = useDeleteNotification();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const typeIcon = (type: Notification["type"]) => {
    const map = { info: "info", success: "check_circle", warning: "warning", error: "error" };
    return map[type] || "notifications";
  };

  const typeColor = (type: Notification["type"]) => {
    const map = { info: "#3b82f6", success: "#22c55e", warning: "#f59e0b", error: "#ef4444" };
    return map[type] || "#3b82f6";
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer relative p-1 rounded-full hover:bg-surface-bright"
        title="Notifications"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent-red rounded-full border-2 border-background" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 390 }}
            onClick={() => setIsOpen(false)}
          />
          <div style={dropdownStyle}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px 12px" }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--color-on-surface)" }}>
                Notifications {unreadCount > 0 && <span style={{ color: "#ef4444" }}>({unreadCount})</span>}
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead.mutate(undefined as any)}
                  style={{ fontSize: 12, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Body */}
            <div style={{ overflowY: "auto", maxHeight: 320 }}>
              {isLoading ? (
                <div style={emptyStyle}>Loading…</div>
              ) : notifications.length === 0 ? (
                <div style={emptyStyle}>
                  <span className="material-symbols-outlined" style={{ fontSize: 32, opacity: 0.3 }}>notifications_none</span>
                  <p style={{ marginTop: 8 }}>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      marginBottom: 4,
                      background: n.isRead ? "transparent" : "rgba(59,130,246,0.07)",
                      borderLeft: n.isRead ? "3px solid transparent" : `3px solid ${typeColor(n.type)}`,
                      cursor: "default",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 18, color: typeColor(n.type), flexShrink: 0, marginTop: 2 }}
                    >
                      {typeIcon(n.type)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: "var(--color-on-surface)", marginBottom: 2, lineHeight: 1.4 }}>
                        {n.title && <strong style={{ display: "block", marginBottom: 2 }}>{n.title}</strong>}
                        {n.message}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--color-on-surface-variant)", marginTop: 2 }}>
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                      {!n.isRead && (
                        <button
                          type="button"
                          onClick={() => markAsRead.mutate(n._id)}
                          style={{ border: "none", background: "none", cursor: "pointer", padding: 2, opacity: 0.6 }}
                          title="Mark as read"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>done</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteOne.mutate(n._id)}
                        style={{ border: "none", background: "none", cursor: "pointer", padding: 2, opacity: 0.4 }}
                        title="Delete"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: 44,
  right: 0,
  width: 340,
  maxHeight: 440,
  overflowY: "hidden",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 24,
  boxShadow: "0 24px 64px rgba(15,23,42,0.12)",
  padding: 8,
  zIndex: 400,
};

const emptyStyle: React.CSSProperties = {
  padding: 24,
  textAlign: "center",
  color: "#64748b",
  fontSize: 13,
};
