// ============================================================
// QueryProvider – centralized TanStack Query setup
// Global defaults: retry logic, error handling, staleTime
// ============================================================
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry on 401/403/404 – these are not transient errors
      retry: (failureCount, error: any) => {
        const message = error?.message || "";
        if (
          message.includes("Session expired") ||
          message.includes("Access denied") ||
          message.includes("not found") ||
          message.includes("Forbidden")
        ) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 60_000, // 1 min default
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

interface Props {
  children: React.ReactNode;
}

export function QueryProvider({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Export the client for direct use if needed (e.g. imperative invalidation)
export { queryClient };
