// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrackDashboard from './TrackDashboard';
import TrackPage from './TrackPage';
import StockRoomPage from './StockRoomPage';
import StockImportPage from './StockImportPage';
import EmployeeDashboard from './EmployeeDashboard';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/import-stock" element={<StockImportPage />} />
        <Route path="/stockroom" element={<StockRoomPage />} />
        <Route path="/" element={<TrackDashboard />} />
        <Route path="/track/:trackId" element={<TrackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
