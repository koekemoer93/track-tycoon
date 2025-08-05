// src/App.js
import './theme.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import AuthPage from './AuthPage';
import TopNav from './components/TopNav';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRedirect from './RoleRedirect';

import Dashboard from './Dashboard'; // 🆕 Your new dashboard goes here
import TrackPage from './TrackPage';
import StockRoomPage from './StockRoomPage';
import StockImportPage from './StockImportPage';
import UploadPage from './UploadPage';
import AdminRegisterUser from './AdminRegisterUser';
import UserAdminPage from './UserAdminPage';
import TaskHistory from './TaskHistory';
import ClockInPage from './ClockInPage';
import LeaveRequestPage from './LeaveRequestPage';
import LeaveTrackerPage from './LeaveTrackerPage';

// Wrapper to access location
const AppWrapper = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="main-app-wrapper">
      {!isAuthPage && <TopNav />}

      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* New universal dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/track/:trackId" element={<TrackPage />} />
        <Route path="/stockroom" element={
          <ProtectedRoute requireAdmin={true}>
            <StockRoomPage />
          </ProtectedRoute>
        } />
        <Route path="/import-stock" element={<StockImportPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/admin-register" element={<AdminRegisterUser />} />
        <Route path="/admin-panel" element={<UserAdminPage />} />
        <Route path="/task-history" element={<TaskHistory />} />
        <Route path="/leave" element={
          <ProtectedRoute>
            <LeaveRequestPage />
          </ProtectedRoute>
        } />
        <Route path="/clock-in" element={
          <ProtectedRoute>
            <ClockInPage />
          </ProtectedRoute>
        } />
        <Route path="/leave-tracker" element={
          <ProtectedRoute requireAdmin={true}>
            <LeaveTrackerPage />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};


function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
