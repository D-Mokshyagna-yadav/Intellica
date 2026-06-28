// ============================================================
// Intellica – Global Type Definitions
// All API entities are typed here. Import from this file only.
// ============================================================

// ── Auth ────────────────────────────────────────────────────
export type UserRole = "FACULTY" | "HOD" | "ADMIN";

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  department: string;
  departmentName: string;
  designation: string;
  googleScholar: string;
  vidwanId: string;
  scopusId: string;
  profileImage: string;
}

export interface LoginPasswordPayload {
  identifier: string;
  password: string;
}

export interface LoginOtpPayload {
  identifier: string;
}

export interface VerifyOtpPayload {
  identifier: string;
  otp: string;
}

export interface ResetPasswordPayload {
  identifier: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword: string;
}

export interface AuthResponse extends AuthUser {
  token: string;
  message: string;
}

// ── Faculty ──────────────────────────────────────────────────
export interface Faculty {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  departmentName: string;
  designation: string;
  role: "FACULTY";
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISCUSSION";
  profileImage: string;
  googleScholar?: string;
  vidwanId?: string;
  scopusId?: string;
  profileCompleted?: boolean;
  createdAt: string;
}

// ── HOD ──────────────────────────────────────────────────────
export interface HOD {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  departmentName: string;
  designation: string;
  role: "HOD";
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISCUSSION";
  profileImage: string;
  createdAt: string;
}

// ── Department ───────────────────────────────────────────────
export interface Department {
  _id: string;
  code: string;
  name: string;
  shortName?: string;
}

// ── Achievement Category ─────────────────────────────────────
export interface AchievementCategory {
  _id: string;
  name: string;
  slug: string;
  basePoints: number;
  weightage: number;
  description?: string;
}

// ── Academic Year / Semester ─────────────────────────────────
export interface AcademicYear {
  _id: string;
  label: string;
  startYear: number;
  endYear: number;
  isCurrent: boolean;
}

export interface Semester {
  _id: string;
  label: string;
  number: number;
  academicYear: string;
  isCurrent: boolean;
}

// ── Upload / Achievement ─────────────────────────────────────
export type UploadStatus =
  | "FACULTY_SUBMITTED"
  | "HOD_COMMENT"
  | "HOD_APPROVED"
  | "HOD_SUBMITTED"
  | "ADMIN_COMMENT"
  | "ADMIN_APPROVED"
  | "REJECTED"
  | "RETURNED_FOR_REVISION";

export interface Upload {
  _id: string;
  faculty: string | Faculty;
  facultyName: string;
  createdByRole: UserRole;
  department: string;
  departmentName: string;
  category: string | AchievementCategory;
  categoryName: string;
  academicYear: string | AcademicYear;
  semester: string | Semester;
  title: string;
  description: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  credits: number;
  basePoints: number;
  weightage: number;
  year: number;
  status: UploadStatus;
  hodComment: string;
  adminComment: string;
  rejectionReason: string;
  metadata: Record<string, any>;
  approvedBy?: string;
  approvedByRole?: "HOD" | "ADMIN";
  approvedAt?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Leaderboard ──────────────────────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  faculty: string;
  facultyId: string;
  department: string;
  departmentName: string;
  totalCredits: number;
  totalUploads: number;
}

export interface DepartmentRankEntry {
  rank: number;
  department: string;
  departmentName: string;
  totalCredits: number;
  facultyCount: number;
}

// ── Notification ─────────────────────────────────────────────
export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  audienceRoles?: string[];
  audienceDepartment?: string | null;
}

// ── Announcement ─────────────────────────────────────────────
export interface Announcement {
  _id: string;
  title: string;
  body: string;
  audienceRoles: UserRole[];
  audienceDepartment?: string;
  expiresAt?: string;
  createdAt: string;
}

// ── Settings ─────────────────────────────────────────────────
export interface AppSettings {
  _id: string;
  key: string;
  value: any;
  description?: string;
}

// ── Pagination ───────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

// ── Report ───────────────────────────────────────────────────
export interface ReportFilters {
  department?: string;
  academicYear?: string;
  semester?: string;
  category?: string;
  status?: UploadStatus;
  fromDate?: string;
  toDate?: string;
}

// ── API Errors ───────────────────────────────────────────────
export interface ApiError {
  message: string;
  code?: string;
  errors?: string[];
}
