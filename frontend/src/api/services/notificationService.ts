// ============================================================
// Notification Service
// ============================================================
import { apiFetch } from "../client";
import type { Notification } from "../../types";

export const notificationService = {
  getAll: () => apiFetch<Notification[]>("/notifications"),

  markAsRead: (id: string) =>
    apiFetch<{ message: string }>(`/notifications/${id}/read`, { method: "PUT" }),

  markAllAsRead: () =>
    apiFetch<{ message: string }>("/notifications/read-all", { method: "PUT" }),

  deleteOne: (id: string) =>
    apiFetch<{ message: string }>(`/notifications/${id}`, { method: "DELETE" }),
};
