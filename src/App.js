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


function App() {
  return (
    <Router>
      <TopNav />
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<TrackDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/import-stock" element={<StockImportPage />} />
        <Route path="/stockroom" element={<StockRoomPage />} />
        <Route path="/track/:trackId" element={<TrackPage />} />
        <Route path="/admin-panel" element={<UserAdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
