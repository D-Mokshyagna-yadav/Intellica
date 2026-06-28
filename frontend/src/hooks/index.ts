// ============================================================
// Hooks barrel – import all hooks from here
// Usage: import { useMe, useMyUploads, useDepartments } from "@/hooks"
// ============================================================

// Auth
export * from "./useAuth";

// Uploads + Approval workflow
export * from "./useUploads";

// Notifications
export * from "./useNotifications";

// Reference data (departments, categories, academic years)
export * from "./useReferenceData";

// Leaderboard
export * from "./useLeaderboard";

// Admin
export * from "./useAdmin";

// HOD
export * from "./useHod";

// Responsive
export { useResponsive } from "./useResponsive";
