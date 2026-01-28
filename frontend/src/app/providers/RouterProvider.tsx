import React from 'react';
import {BrowserRouter, Navigate, Outlet, Route, Routes} from 'react-router-dom';
import {useAuthStore} from '@/entities/user/model/store';
import {LoginPage} from '@/pages/login/LoginPage';
import {DashboardPage} from '@/pages/dashboard/DashboardPage';
import {AdminPage} from '@/pages/admin/AdminPage';

// Protected Route Wrapper
const RequireAuth: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet/> : <Navigate to="/login" replace/>;
};

// Public Route Wrapper (Redirects to dashboard if already logged in)
const RedirectIfAuthenticated: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace/> : <Outlet/>;
};

export const AppRouter: React.FC = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route element={<RedirectIfAuthenticated/>}>
            <Route path="/login" element={<LoginPage/>}/>
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
