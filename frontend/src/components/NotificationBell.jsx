import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";
import { showToast } from "../utils/toast";

export default function NotificationBell() {
  const token = localStorage.getItem("token");
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const data = await apiFetch("/notifications");
        if (isMounted) {
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          showToast({ type: "error", message: error.message || "Failed to load notifications" });
        }
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [token]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  if (!token) {
    return null;
  }

  const markAsRead = async (notificationId) => {
    try {
      await apiFetch(`/notifications/${notificationId}/read`, { method: "PUT" });
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
    } catch (error) {
      showToast({ type: "error", message: error.message || "Failed to update notification" });
    }
  };

  return (
    <div style={{ position: "relative", marginRight: 120 }}>
      <button type="button" onClick={() => setIsOpen((current) => !current)} style={buttonStyle}>
        Bell
        {unreadCount > 0 && <span style={badgeStyle}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
          <div style={dropdownHeaderStyle}>Notifications</div>
          {notifications.length === 0 ? (
            <div style={emptyStyle}>No notifications yet.</div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification._id}
                type="button"
                onClick={() => markAsRead(notification._id)}
                style={{
                  ...itemStyle,
                  background: notification.isRead ? "#f8fafc" : "#eff6ff",
                }}
              >
                <strong style={{ display: "block", marginBottom: 4 }}>
                  {notification.isRead ? "Read" : "Unread"}
                </strong>
                <span>{notification.message}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const buttonStyle = {
  position: "relative",
  border: "none",
  background: "rgba(255,255,255,0.15)",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: 700,
};

const badgeStyle = {
  position: "absolute",
  top: -6,
  right: -4,
  minWidth: 20,
  height: 20,
  borderRadius: 999,
  background: "#dc2626",
  color: "#fff",
  fontSize: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 6px",
};

const dropdownStyle = {
  position: "absolute",
  top: 48,
  right: 0,
  width: 320,
  maxHeight: 360,
  overflowY: "auto",
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.2)",
  padding: 12,
  zIndex: 400,
};

const dropdownHeaderStyle = {
  fontWeight: 700,
  color: "#0f172a",
  padding: "4px 8px 12px",
};

const emptyStyle = {
  padding: 12,
  color: "#64748b",
};

const itemStyle = {
  width: "100%",
  textAlign: "left",
  border: "none",
  borderRadius: 12,
  padding: 12,
  marginBottom: 8,
  cursor: "pointer",
  color: "#0f172a",
};
