// src/components/RingCard.js
import React from 'react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const RingCard = ({ label, value, target, color, unit }) => {
  const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0;

  return (
    <div style={cardStyle}>
      <div style={{ width: 80, height: 80 }}>
        <CircularProgressbarWithChildren
          value={percentage}
          strokeWidth={10}
          styles={buildStyles({
            pathColor: color,
            trailColor: '#444',
          })}
        >
          <div style={{ fontSize: 12, color: '#fff' }}>
            <strong>{value}</strong>
            {unit && <span style={{ fontSize: 10 }}>/{target}{unit}</span>}
          </div>
        </CircularProgressbarWithChildren>
      </div>
      <p style={{ marginTop: 10, color: '#aaa', fontSize: 12 }}>{label}</p>
    </div>
  );
};

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginRight: 20,
};

export default RingCard;
