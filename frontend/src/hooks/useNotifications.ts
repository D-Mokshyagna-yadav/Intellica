// ============================================================
// Notification Hooks – TanStack Query with optimistic updates
// ============================================================
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../api/services/notificationService";
import type { Notification } from "../types";

export const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
};

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: NOTIFICATION_KEYS.all,
    queryFn: notificationService.getAll,
    refetchInterval: 60_000, // poll every minute
    staleTime: 30_000,
  });
}

export function useUnreadCount() {
  const { data = [] } = useNotifications();
  return data.filter((n) => !n.isRead).length;
}

// ── Mark single as read (optimistic) ────────────────────────
export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: NOTIFICATION_KEYS.all });
      const previous = qc.getQueryData<Notification[]>(NOTIFICATION_KEYS.all);
      qc.setQueryData<Notification[]>(NOTIFICATION_KEYS.all, (old = []) =>
        old.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(NOTIFICATION_KEYS.all, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all }),
  });
}

// ── Mark ALL as read (optimistic) ────────────────────────────
export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: NOTIFICATION_KEYS.all });
      const previous = qc.getQueryData<Notification[]>(NOTIFICATION_KEYS.all);
      qc.setQueryData<Notification[]>(NOTIFICATION_KEYS.all, (old = []) =>
        old.map((n) => ({ ...n, isRead: true }))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(NOTIFICATION_KEYS.all, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all }),
  });
}

// ── Delete notification (optimistic) ────────────────────────
export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.deleteOne(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: NOTIFICATION_KEYS.all });
      const previous = qc.getQueryData<Notification[]>(NOTIFICATION_KEYS.all);
      qc.setQueryData<Notification[]>(NOTIFICATION_KEYS.all, (old = []) =>
        old.filter((n) => n._id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(NOTIFICATION_KEYS.all, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all }),
  });
}
