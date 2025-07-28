// src/components/TopNav.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const tabs = [
  { path: '/track-dashboard', label: '🏠 Dashboard' },
  { path: '/employee-dashboard', label: '🧑‍🔧 Employee' },
  { path: '/stockroom', label: '📦 Stock Room' },
  // Future tabs:
  // { path: '/reports', label: '📊 Reports' },
  // { path: '/settings', label: '⚙️ Settings' },
];

const TopNav = () => {
  return (
    <nav style={{
      display: 'flex',
      background: '#1c1c1e',
      padding: '12px 20px',
      gap: 15,
      borderBottom: '1px solid #333',
      boxShadow: '0 1px 2px rgba(0,0,0,0.4)'
    }}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          style={({ isActive }) => ({
            color: isActive ? '#fff' : '#999',
            fontWeight: isActive ? 'bold' : 'normal',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 8,
            background: isActive ? '#2c2c2e' : 'transparent',
            transition: '0.2s ease'
          })}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default TopNav;
