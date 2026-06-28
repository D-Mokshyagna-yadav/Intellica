// ============================================================
// Auth Service – all auth-related API calls
// ============================================================
import { apiFetch } from "../client";
import type {
  AuthResponse,
  AuthUser,
  LoginPasswordPayload,
  LoginOtpPayload,
  VerifyOtpPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from "../../types";

export const authService = {
  /** Send OTP to identifier (email or employeeId) */
  sendOtp: (payload: LoginOtpPayload) =>
    apiFetch<{ message: string; expiresAt: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** Login with email/employeeId + password */
  loginWithPassword: (payload: LoginPasswordPayload) =>
    apiFetch<AuthResponse>("/auth/login-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** Verify OTP and get auth token */
  verifyOtp: (payload: VerifyOtpPayload) =>
    apiFetch<AuthResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** Resend OTP */
  resendOtp: (identifier: string) =>
    apiFetch<{ message: string; expiresAt: string }>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ identifier }),
    }),

  /** Send OTP for password reset */
  forgotPassword: (identifier: string) =>
    apiFetch<{ message: string; expiresAt: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ identifier }),
    }),

  /** Reset password using OTP */
  resetPassword: (payload: ResetPasswordPayload) =>
    apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** Change password (authenticated) */
  changePassword: (payload: ChangePasswordPayload) =>
    apiFetch<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** Get current user profile */
  getMe: () => apiFetch<AuthUser>("/auth/me"),

  /** Update profile */
  updateProfile: (data: Partial<AuthUser>) =>
    apiFetch<{ message: string; profile: AuthUser }>("/auth/update-profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** Update profile image */
  updateProfileImage: (formData: FormData) =>
    apiFetch<{ message: string; profileImage: string }>("/auth/update-profile-image", {
      method: "PUT",
      body: formData,
    }),
};
