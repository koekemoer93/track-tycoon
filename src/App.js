// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrackDashboard from './TrackDashboard';
import TrackPage from './TrackPage';
import StockRoomPage from './StockRoomPage';
import StockImportPage from './StockImportPage';
import EmployeeDashboard from './EmployeeDashboard';
import AuthPage from './AuthPage'; // Combined login/register page
import UserAdminPage from './UserAdminPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin-panel" element={<UserAdminPage />} />
        <Route path="/" element={<AuthPage />} /> {/* 👈 Default route shows login/register */}
        <Route path="/dashboard" element={<TrackDashboard />} /> {/* 👈 Owner route */}
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/import-stock" element={<StockImportPage />} />
        <Route path="/stockroom" element={<StockRoomPage />} />
        <Route path="/track/:trackId" element={<TrackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
