// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrackDashboard from './TrackDashboard';
import TrackPage from './TrackPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrackDashboard />} />
        <Route path="/track/:trackId" element={<TrackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
