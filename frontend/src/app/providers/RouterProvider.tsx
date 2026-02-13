import React, {Suspense} from 'react';
import {BrowserRouter, Navigate, Outlet, Route, Routes} from 'react-router-dom';
import {useAuthStore} from '@/entities/user/model/store';
import {AppShell} from '@/shared/ui/AppShell';

const LoginPage = React.lazy(() => import('@/pages/login/LoginPage').then(m => ({default: m.LoginPage})));
const DashboardPage = React.lazy(() => import('@/pages/dashboard/DashboardPage').then(m => ({default: m.DashboardPage})));
const AdminPage = React.lazy(() => import('@/pages/admin/AdminPage').then(m => ({default: m.AdminPage})));
const ChangePasswordPage = React.lazy(() => import('@/pages/change-password/ChangePasswordPage').then(m => ({default: m.ChangePasswordPage})));

// Protected Route Wrapper
const RequireAuth: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mustChangePassword = useAuthStore((state) => state.mustChangePassword);

  if (!isAuthenticated) return <Navigate to="/login" replace/>;
  if (mustChangePassword) return <Navigate to="/change-password" replace/>;

  return <Outlet/>;
};

const RequirePasswordChange: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mustChangePassword = useAuthStore((state) => state.mustChangePassword);

  if (!isAuthenticated) return <Navigate to="/login" replace/>;
  if (!mustChangePassword) return <Navigate to="/" replace/>;

  return <Outlet/>;
};

const ProtectedLayout: React.FC = () => {
  return (
    <AppShell>
      <Outlet/>
    </AppShell>
  );
};

// Public Route Wrapper (Redirects to dashboard if already logged in)
const RedirectIfAuthenticated: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mustChangePassword = useAuthStore((state) => state.mustChangePassword);
  if (!isAuthenticated) return <Outlet/>;
  return <Navigate to={mustChangePassword ? '/change-password' : '/'} replace/>;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route element={<RedirectIfAuthenticated/>}>
            <Route path="/login" element={<LoginPage/>}/>
          </Route>

          <Route element={<RequirePasswordChange/>}>
            <Route path="/change-password" element={<ChangePasswordPage/>}/>
          </Route>

          {/* Protected Routes */}
          <Route element={<RequireAuth/>}>
            <Route element={<ProtectedLayout/>}>
              <Route path="/" element={<DashboardPage/>}/>
              <Route path="/admin" element={<AdminPage/>}/>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
