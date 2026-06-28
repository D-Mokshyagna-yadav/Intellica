import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import FacultyDashboard from './features/faculty/FacultyDashboard';
import HodDashboard from './features/hod/HodDashboard';
import AdminDashboard from './features/admin/AdminDashboard';
import Leaderboard from './features/leaderboard/Leaderboard';
import OnboardingWizard from './features/onboarding/OnboardingWizard';
import NotificationsPage from './features/notifications/NotificationsPage';
import ApprovalCenter from './features/approvals/ApprovalCenter';
import FacultyAchievementPortfolio from './features/achievements/FacultyAchievementPortfolio';
import DepartmentPerformanceRankings from './features/rankings/DepartmentPerformanceRankings';
import ReportsAnalytics from './features/reports/ReportsAnalytics';
import UserManagement from './features/users/UserManagement';
import AnnouncementsNoticeBoard from './features/announcements/AnnouncementsNoticeBoard';
import InstitutionalSettings from './features/settings/InstitutionalSettings';
import AIInsightsPersonalization from './features/ai/AIInsightsPersonalization';
import CertificateDocumentGallery from './features/certificates/CertificateDocumentGallery';
import CVReports from './features/cv/CVReports';
import SecurityAccountSettings from './features/security/SecurityAccountSettings';
import FacultyGoalsProgressTracker from './features/goals/FacultyGoalsProgressTracker';
import FacultyLeaderboardRanking from './features/rankings/FacultyLeaderboardRanking';
import PublicAcademicProfile from './features/profile/PublicAcademicProfile';
import JournalPublications from './features/publications/JournalPublications';
import GlobalSearchActivityTimeline from './features/search/GlobalSearchActivityTimeline';
import PDFExportDocumentCustomizer from './features/documents/PDFExportDocumentCustomizer';
import SystemHealthMonitoring from './features/system/SystemHealthMonitoring';
import NAACInstitutionalReportBuilder from './features/naac/NAACInstitutionalReportBuilder';
import ApprovalDiscussionReviewSystem from './features/approvals/ApprovalDiscussionReviewSystem';
import InsightsDashboard from './features/insights/InsightsDashboard';
import FacultyDepartmentManagement from './features/departments/FacultyDepartmentManagement';
import CustomizationSupportCenter from './features/support/CustomizationSupportCenter';
import DocumentPreviewApprovalTimeline from './features/approvals/DocumentPreviewApprovalTimeline';
import ToastViewport from './components/ToastViewport';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import { ThemeProvider } from './components/ThemeProvider';
import { QueryProvider } from './providers/QueryProvider';

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('user_role');
  const profileCompleted = localStorage.getItem('profileCompleted') === 'true';

  if (!token) return <Navigate to="/" replace />;

  // Enforce onboarding for Faculty
  if (role === 'FACULTY' && !profileCompleted && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'HOD') return <Navigate to="/hod" replace />;
    if (role === 'FACULTY') return <Navigate to="/faculty" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <OnboardingWizard />
                </ProtectedRoute>
              }
            />

            <Route element={<AuthenticatedLayout />}>
              <Route
                path="/faculty"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY']}>
                    <FacultyDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hod"
                element={
                  <ProtectedRoute allowedRoles={['HOD']}>
                    <HodDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/leaderboard"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute allowedRoles={['HOD', 'ADMIN']}>
                    <ApprovalCenter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/achievements"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <FacultyAchievementPortfolio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rankings"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <DepartmentPerformanceRankings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={['HOD', 'ADMIN']}>
                    <ReportsAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/announcements"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <AnnouncementsNoticeBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <InstitutionalSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-insights"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <AIInsightsPersonalization />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/certificates"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <CertificateDocumentGallery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cv-reports"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <CVReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/security"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <SecurityAccountSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <FacultyGoalsProgressTracker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty-rankings"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <FacultyLeaderboardRanking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <PublicAcademicProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/publications"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <JournalPublications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <GlobalSearchActivityTimeline />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <PDFExportDocumentCustomizer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/system-health"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <SystemHealthMonitoring />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/naac-reports"
                element={
                  <ProtectedRoute allowedRoles={['HOD', 'ADMIN']}>
                    <NAACInstitutionalReportBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approval-discussions"
                element={
                  <ProtectedRoute allowedRoles={['HOD', 'ADMIN']}>
                    <ApprovalDiscussionReviewSystem />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/insights"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <InsightsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/departments"
                element={
                  <ProtectedRoute allowedRoles={['HOD', 'ADMIN']}>
                    <FacultyDepartmentManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <CustomizationSupportCenter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approval-documents"
                element={
                  <ProtectedRoute allowedRoles={['HOD', 'ADMIN']}>
                    <DocumentPreviewApprovalTimeline />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
          <ToastViewport />
        </BrowserRouter>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
