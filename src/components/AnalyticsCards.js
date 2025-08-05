import '../theme.css';
// src/components/AnalyticsCards.js
import React from 'react';

const cardStyle = {
  background: '#1e1e1e',
  padding: '20px',
  borderRadius: '12px',
  flex: 1,
  margin: '10px',
  textAlign: 'center',
  color: '#fff',
  fontFamily: 'Helvetica'
};

const containerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '20px',
  flexWrap: 'wrap'
};

const AnalyticsCards = ({ totalTasks, completedTasks, leastCompletedTrack, mostActiveRole }) => {
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
  <div className="page">
    <div className="glass-card">
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h3>Total Tasks Today</h3>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalTasks}</p>
      </div>
      <div style={cardStyle}>
        <h3>% Completed</h3>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{percentage}%</p>
      </div>
      <div style={cardStyle}>
        <h3>Least Completed Track</h3>
        <p style={{ fontSize: '20px' }}>{leastCompletedTrack || '—'}</p>
      </div>
      <div style={cardStyle}>
        <h3>Most Active Role</h3>
        <p style={{ fontSize: '20px' }}>{mostActiveRole || '—'}</p>
      </div>
    </div>
  
    </div>
  </div>
);
};

export default AnalyticsCards;
