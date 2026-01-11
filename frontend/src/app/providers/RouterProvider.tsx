import React from 'react';
import {BrowserRouter, Navigate, Outlet, Route, Routes} from 'react-router-dom';
import {useAuthStore} from '@/entities/user/model/store';
import {LoginPage} from '@/pages/login/LoginPage';
import {DashboardPage} from '@/pages/dashboard/DashboardPage';

// Protected Route Wrapper
const RequireAuth: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet/> : <Navigate to="/login" replace/>;
};

export const AppRouter: React.FC = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage/>}/>

          {/* Protected Routes */}
          <Route element={<RequireAuth/>}>
            <Route path="/" element={<DashboardPage/>}/>
            {/* Add more protected routes here */}
          </Route>
        </Routes>
      </BrowserRouter>
  );
};
