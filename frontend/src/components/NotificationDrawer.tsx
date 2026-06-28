import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, X, Info, CheckCircle, AlertTriangle, AlertCircle, Megaphone } from "lucide-react";
import { useNotifications, useMarkAsRead, useMarkAllAsRead, type Notification } from "../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

function typeIcon(type: Notification["type"]) {
  const cls = "w-4 h-4 shrink-0 mt-0.5";
  switch (type) {
    case "success": return <CheckCircle className={`${cls} text-emerald-500`} />;
    case "warning": return <AlertTriangle className={`${cls} text-amber-500`} />;
    case "error":   return <AlertCircle className={`${cls} text-red-500`} />;
    default:        return <Info className={`${cls} text-indigo-500`} />;
  }
}

function typeBg(type: Notification["type"]) {
  switch (type) {
    case "success": return "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-800";
    case "warning": return "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-800";
    case "error":   return "bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-800";
    default:        return "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-800";
  }
}

function timeAgo(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
}

interface Props {
  onClose: () => void;
}

export default function NotificationDrawer({ onClose }: Props) {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markOne } = useMarkAsRead();
  const { markAll } = useMarkAllAsRead();
  const drawerRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) markOne(n._id);
    if (n.actionUrl) {
      onClose();
      navigate(n.actionUrl);
    }
  };

  return (
    <div
      ref={drawerRef}
      className="absolute right-0 top-full mt-2 w-96 max-h-[80vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-indigo-500" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={() => markAll(notifications)}
              title="Mark all as read"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <Bell className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">You're all caught up!</p>
            <p className="text-xs text-slate-300">No notifications yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((n) => (
              <li
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`flex gap-3 px-5 py-4 cursor-pointer transition-colors ${
                  n.actionUrl ? "hover:bg-slate-50 dark:hover:bg-slate-800/50" : "cursor-default"
                } ${!n.isRead ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""}`}
              >
                {/* Icon */}
                <div className={`mt-0.5 p-1.5 rounded-lg border ${typeBg(n.type)} shrink-0`}>
                  {typeIcon(n.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  {n.title && (
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {n.title}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(n.createdAt)}</p>
                </div>

                {/* Unread dot + mark-read */}
                <div className="flex flex-col items-center gap-2 shrink-0 pt-0.5">
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  )}
                  {!n.isRead && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markOne(n._id); }}
                      title="Mark as read"
                      className="p-1 rounded text-slate-300 hover:text-indigo-500 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => { onClose(); navigate("/notifications"); }}
            className="w-full text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            View all notifications →
          </button>
        </div>
      )}
    </div>
  );
}
