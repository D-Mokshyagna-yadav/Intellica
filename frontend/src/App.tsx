import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import FacultyDashboard from './features/faculty/FacultyDashboard';
import HodDashboard from './features/hod/HodDashboard';
import AdminDashboard from './features/admin/AdminDashboard';
import Leaderboard from './features/leaderboard/Leaderboard';
import OnboardingWizard from './features/onboarding/OnboardingWizard';
import NotificationsPage from './features/notifications/NotificationsPage';
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
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY', 'HOD', 'ADMIN']}>
                    <NotificationsPage />
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
