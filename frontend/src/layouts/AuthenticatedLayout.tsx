import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useLogout } from '../hooks/useAuth';
import NotificationDrawer from '../components/NotificationDrawer';

export default function AuthenticatedLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('user_role');
  const name = localStorage.getItem('user_name') || 'User';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Notifications badge count
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => logout();

  const getDashboardPath = () => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'HOD') return '/hod';
    return '/faculty';
  };

  const getLeaderboardPath = () => {
    if (role === 'ADMIN') return '/admin/leaderboard';
    return '/leaderboard';
  };

  const navItems = [
    { path: getDashboardPath(), label: 'Dashboard', icon: 'dashboard' },
    { path: getLeaderboardPath(), label: 'Leaderboard', icon: 'leaderboard' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={`h-full rounded-[32px] border border-slate-200/70 bg-white/75 p-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl flex flex-col ${mobile ? 'w-72' : 'w-64'}`}>
      <div className="mb-8 flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Intellica</h1>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Faculty Portal</p>
        </div>
      </div>

      <ul className="flex-1 space-y-2">
        {navItems.map(({ path, label, icon }) => {
          const active = isActive(path);
          return (
            <li key={path}>
              <button
                onClick={() => { navigate(path); setMobileMenuOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(37,99,235,0.2)]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                <span className="text-sm font-semibold">{label}</span>
              </button>
            </li>
          );
        })}

        <li>
          <button
            onClick={() => { navigate('/notifications'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
              isActive('/notifications')
                ? 'bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(37,99,235,0.2)]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/notifications') ? "'FILL' 1" : "'FILL' 0" }}>notifications</span>
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </li>
      </ul>

      <div className="mt-auto space-y-2 border-t border-slate-200/70 pt-4">
        <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
          <span className="material-symbols-outlined text-[18px]">settings</span>
          Settings
        </button>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600">
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Logout
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-4 p-0 lg:p-4">
        <aside className="hidden lg:flex w-72 shrink-0">
          <Sidebar />
        </aside>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 p-3">
              <Sidebar mobile />
            </aside>
          </div>
        )}

        <div className="flex-1 py-0 lg:py-0">
          <header className="rounded-[24px] border border-slate-200/70 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  className="rounded-full border border-slate-200/70 p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Overview</p>
                  <h2 className="text-xl font-semibold text-slate-900">{role === 'ADMIN' ? 'Administration' : role === 'HOD' ? 'Department Leadership' : 'Faculty Workspace'}</h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative hidden md:block">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  <input className="w-64 rounded-full border border-slate-200/70 bg-slate-50/70 py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Search records..." type="text" />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setNotifOpen((v) => !v)}
                    className="relative rounded-full border border-slate-200/70 p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    title="Notifications"
                  >
                    <span className="material-symbols-outlined">notifications</span>
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500"></span>
                    )}
                  </button>
                  {notifOpen && (
                    <NotificationDrawer onClose={() => setNotifOpen(false)} />
                  )}
                </div>

                <button className="flex items-center gap-2 rounded-full border border-slate-200/70 bg-slate-50/70 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                  <span className="hidden sm:block">{name}</span>
                </button>
              </div>
            </div>
          </header>

          <main className="mt-4 rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
