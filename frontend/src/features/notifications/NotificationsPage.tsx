import { useState } from "react";
import { Bell, CheckCheck, Filter, Info, CheckCircle, AlertTriangle, AlertCircle, Inbox } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useNotifications, useMarkAsRead, useMarkAllAsRead, type Notification } from "../../hooks/useNotifications";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

type FilterType = "all" | "unread" | "info" | "success" | "warning" | "error";

function TypeBadge({ type }: { type: Notification["type"] }) {
  const map = {
    info:    { label: "Info",    cls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" },
    success: { label: "Success", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
    warning: { label: "Warning", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
    error:   { label: "Error",   cls: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  };
  const { label, cls } = map[type] ?? map.info;
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function TypeIcon({ type }: { type: Notification["type"] }) {
  const cls = "w-5 h-5";
  switch (type) {
    case "success": return <CheckCircle className={`${cls} text-emerald-500`} />;
    case "warning": return <AlertTriangle className={`${cls} text-amber-500`} />;
    case "error":   return <AlertCircle className={`${cls} text-red-500`} />;
    default:        return <Info className={`${cls} text-indigo-500`} />;
  }
}

function typeCardBg(type: Notification["type"]) {
  switch (type) {
    case "success": return "border-l-4 border-l-emerald-400";
    case "warning": return "border-l-4 border-l-amber-400";
    case "error":   return "border-l-4 border-l-red-400";
    default:        return "border-l-4 border-l-indigo-400";
  }
}

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markOne } = useMarkAsRead();
  const { markAll } = useMarkAllAsRead();
  const [filter, setFilter] = useState<FilterType>("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "all") return true;
    return n.type === filter;
  });

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: "all",     label: "All" },
    { key: "unread",  label: `Unread (${unreadCount})` },
    { key: "info",    label: "Info" },
    { key: "success", label: "Success" },
    { key: "warning", label: "Warning" },
    { key: "error",   label: "Error" },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll(notifications)}
            className="gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        {filterButtons.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
              filter === key
                ? "bg-primary text-white shadow-sm"
                : "bg-surface-container-low text-on-surface-variant border border-white/10 hover:border-primary/50 hover:text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
            <Inbox className="w-12 h-12 opacity-30" />
            <div className="text-center">
              <p className="font-medium text-slate-500 dark:text-slate-400">No notifications</p>
              <p className="text-sm text-slate-400 mt-1">
                {filter === "unread" ? "You have no unread notifications." : "Nothing here yet."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n._id}
              className={`relative flex gap-4 p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md ${typeCardBg(n.type)} ${
                !n.isRead ? "ring-1 ring-indigo-200 dark:ring-indigo-800" : "border-slate-200 dark:border-slate-800"
              }`}
            >
              {/* Unread pulse */}
              {!n.isRead && (
                <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-indigo-500">
                  <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75" />
                </span>
              )}

              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                <TypeIcon type={n.type} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start gap-2 flex-wrap">
                  {n.title && (
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{n.title}</h3>
                  )}
                  <TypeBadge type={n.type} />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{n.message}</p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                  <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-xs text-slate-400">
                    {format(new Date(n.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
              </div>

              {/* Mark as read */}
              {!n.isRead && (
                <button
                  onClick={() => markOne(n._id)}
                  className="shrink-0 self-start mt-0.5 p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Mark as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
