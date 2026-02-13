import React from 'react';
import {BrowserRouter, Navigate, Outlet, Route, Routes} from 'react-router-dom';
import {useAuthStore} from '@/entities/user/model/store';
import {LoginPage} from '@/pages/login/LoginPage';
import {DashboardPage} from '@/pages/dashboard/DashboardPage';
import {AdminPage} from '@/pages/admin/AdminPage';
import {ChangePasswordPage} from '@/pages/change-password/ChangePasswordPage';

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
        <Routes>
          <Route element={<RedirectIfAuthenticated/>}>
            <Route path="/login" element={<LoginPage/>}/>
          </Route>

          <Route element={<RequirePasswordChange/>}>
            <Route path="/change-password" element={<ChangePasswordPage/>}/>
          </Route>

          {/* Protected Routes */}
          <Route element={<RequireAuth/>}>
            <Route path="/" element={<DashboardPage/>}/>
            <Route path="/admin" element={<AdminPage/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
  );
};
