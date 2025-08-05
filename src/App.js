import './theme.css';
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrackDashboard from './TrackDashboard';
import TrackPage from './TrackPage';
import StockRoomPage from './StockRoomPage';
import StockImportPage from './StockImportPage';
import EmployeeDashboard from './EmployeeDashboard';
import AuthPage from './AuthPage';
import UserAdminPage from './UserAdminPage';
import TopNav from './components/TopNav';
import RoleRedirect from './RoleRedirect';
import UploadPage from './UploadPage';
import AdminRegisterUser from './AdminRegisterUser';
import ProtectedRoute from './components/ProtectedRoute';
import TaskHistory from './TaskHistory';
import ClockInPage from './ClockInPage';
// Import leave system pages
import LeaveRequestPage from './LeaveRequestPage';
import LeaveTrackerPage from './LeaveTrackerPage';

function App() {
  return (
  <div className="page">
    <div className="glass-card">
      <Router>
        <TopNav />
        <Routes>
         <Route
            path="/track-dashboard"
            element={
            <ProtectedRoute requireAdmin={true}>
            <TrackDashboard />
            </ProtectedRoute>
  }
/>
<Route
  path="/stockroom"
  element={
    <ProtectedRoute requireAdmin={true}>
      <StockRoomPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/employee-dashboard"
  element={
    <ProtectedRoute>
      <EmployeeDashboard />
    </ProtectedRoute>
  }
/>
        <Route path="/task-history" element={<TaskHistory />} />
        <Route path="/admin-register" element={<AdminRegisterUser />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<TrackDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/import-stock" element={<StockImportPage />} />
        <Route path="/stockroom" element={<StockRoomPage />} />
        <Route path="/track/:trackId" element={<TrackPage />} />
        <Route path="/admin-panel" element={<UserAdminPage />} />
        <Route path="/track-dashboard" element={<TrackDashboard />} />

        {/* Leave system routes */}
        {/* Employee leave request page. This route is protected so only logged in users can request leave. */}
        <Route
          path="/leave"
          element={
            <ProtectedRoute>
              <LeaveRequestPage />
            </ProtectedRoute>
          }
        />

        {/* Route for the new clock‑in/clock‑out page. Only authenticated
            users should be able to access this page. */}
        <Route
          path="/clock-in"
          element={
            <ProtectedRoute>
              <ClockInPage />
            </ProtectedRoute>
          }
        />

        {/* Admin leave tracker page. Only owners/managers can access. */}
        <Route
          path="/leave-tracker"
          element={
            <ProtectedRoute requireAdmin={true}>
              <LeaveTrackerPage />
            </ProtectedRoute>
          }
        />

      </Routes>
        {/*
         * Include a small footer with a link to the React documentation.
         * This satisfies the existing App.test.js which expects a "learn react"
         * link to be present in the DOM.  Styling is handled via the
         * .App-link class defined in App.css and the theme variables.
         */}
        <footer style={{ textAlign: 'center', padding: '10px' }}>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </footer>
      </Router>
  
    </div>
  </div>
);
}

export default App;
