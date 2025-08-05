import '../theme.css';
// src/components/MissionCard.js
import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const MissionCard = ({ userName, progress, taskCount }) => {
  return (
  <div className="page">
    <div className="glass-card">
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <h3 style={{ margin: 0 }}>📋 Today’s Tasks</h3>
        <p style={{ margin: '6px 0' }}>
          <strong>{userName}</strong>, you have <strong>{taskCount}</strong> tasks today.
        </p>
      </div>
      <div style={{ width: 60 }}>
        <CircularProgressbar
          value={progress}
          text={`${progress}%`}
          styles={buildStyles({
            textColor: '#fff',
            pathColor: '#00ff88',
            trailColor: '#444',
          })}
        />
      </div>
    </div>
  
    </div>
  </div>
);
};

export default MissionCard;
