// ============================================================
// Auth Hooks – TanStack Query wrappers for auth operations
// ============================================================
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../api/services/authService";
import { clearSession } from "../api/client";
import type { AuthUser, ChangePasswordPayload, LoginPasswordPayload, VerifyOtpPayload, ResetPasswordPayload } from "../types";

export const AUTH_KEYS = {
  me: ["auth", "me"] as const,
};

// ── Current User ────────────────────────────────────────────
export function useMe() {
  const token = localStorage.getItem("token");
  return useQuery<AuthUser>({
    queryKey: AUTH_KEYS.me,
    queryFn: authService.getMe,
    enabled: !!token,
    staleTime: 5 * 60_000, // 5 min
    retry: 1,
  });
}

// ── Password Login ──────────────────────────────────────────
export function useLoginWithPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPasswordPayload) => authService.loginWithPassword(payload),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_role", data.role);
      localStorage.setItem("user_name", data.name || "");
      localStorage.setItem("user_department", data.department || "");
      localStorage.setItem("user_designation", data.designation || "");
      localStorage.setItem("userId", data.id || "");
      qc.setQueryData(AUTH_KEYS.me, data);
    },
  });
}

// ── OTP Send ────────────────────────────────────────────────
export function useSendOtp() {
  return useMutation({
    mutationFn: (identifier: string) => authService.sendOtp({ identifier }),
  });
}

// ── OTP Verify ──────────────────────────────────────────────
export function useVerifyOtp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authService.verifyOtp(payload),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_role", data.role);
      localStorage.setItem("user_name", data.name || "");
      localStorage.setItem("user_department", data.department || "");
      localStorage.setItem("user_designation", data.designation || "");
      localStorage.setItem("userId", data.id || "");
      qc.setQueryData(AUTH_KEYS.me, data);
    },
  });
}

// ── Resend OTP ──────────────────────────────────────────────
export function useResendOtp() {
  return useMutation({
    mutationFn: (identifier: string) => authService.resendOtp(identifier),
  });
}

// ── Forgot Password ─────────────────────────────────────────
export function useForgotPassword() {
  return useMutation({
    mutationFn: (identifier: string) => authService.forgotPassword(identifier),
  });
}

// ── Reset Password ──────────────────────────────────────────
export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
  });
}

// ── Change Password ─────────────────────────────────────────
export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload),
  });
}

// ── Update Profile ──────────────────────────────────────────
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AuthUser>) => authService.updateProfile(data),
    onSuccess: (data) => {
      qc.setQueryData(AUTH_KEYS.me, (old: AuthUser | undefined) =>
        old ? { ...old, ...data.profile } : data.profile
      );
    },
  });
}

// ── Update Profile Image ────────────────────────────────────
export function useUpdateProfileImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => authService.updateProfileImage(formData),
    onSuccess: (data) => {
      qc.setQueryData(AUTH_KEYS.me, (old: AuthUser | undefined) =>
        old ? { ...old, profileImage: data.profileImage } : old
      );
    },
  });
}

// ── Logout ──────────────────────────────────────────────────
export function useLogout() {
  const qc = useQueryClient();
  return () => {
    clearSession();
    qc.clear();
    window.location.href = "/";
  };
}
