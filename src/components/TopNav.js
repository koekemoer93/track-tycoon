// src/components/TopNav.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// TopNav dynamically shows tabs based on the logged‑in user's role.
const TopNav = () => {
  const [tabs, setTabs] = useState([]);
  // Number of pending leave requests (for admin users)
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    // Listen for authentication state changes so we can update the nav when users log in/out
    let unsubscribeLeaves = null;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Reset pending count when user changes
      setPendingCount(0);
      if (unsubscribeLeaves) {
        unsubscribeLeaves();
        unsubscribeLeaves = null;
      }
      if (!user) {
        // When not logged in, there are no navigation buttons
        setTabs([]);
        return;
      }
      // Fetch the user's record from Firestore to determine if they are an admin
      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = snap.exists() ? snap.data() : {};
      const isAdmin =
        data?.isAdmin || data?.role === 'owner' || data?.role === 'manager';
      // Build the tabs array based on admin status
      if (isAdmin) {
        setTabs([
          { path: '/track-dashboard', label: '🏠 Dashboard' },
          { path: '/employee-dashboard', label: '🧑‍🔧 Employee' },
          { path: '/stockroom', label: '📦 Stock Room' },
          { path: '/leave-tracker', label: '⛱️ Leave' },
        ]);
        // Listen for pending leave requests to display a badge
        const pendingQuery = query(
          collection(db, 'leaveRequests'),
          where('status', '==', 'pending')
        );
        unsubscribeLeaves = onSnapshot(pendingQuery, (snapshot) => {
          setPendingCount(snapshot.size);
        });
      } else {
        // Non-admins get employee dashboard and leave request page
        setTabs([
          { path: '/employee-dashboard', label: '🧑‍🔧 Employee' },
          { path: '/leave', label: '⛱️ Leave' },
        ]);
      }
    });
    return () => {
      unsubscribe();
      if (unsubscribeLeaves) unsubscribeLeaves();
    };
  }, []);

  // If there are no tabs (e.g. on the login page) render nothing
  if (tabs.length === 0) return null;

  return (
    <nav
      style={{
        display: 'flex',
        background: 'var(--card-bg)',
        padding: '12px 20px',
        gap: 15,
        borderBottom: '1px solid #2c2c2e',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
      }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          style={({ isActive }) => ({
            color: isActive ? 'var(--text-color)' : 'var(--secondary-color)',
            fontWeight: isActive ? 'bold' : 'normal',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 8,
            // Highlight the active tab with a translucent accent background
            background: isActive ? 'rgba(225, 6, 0, 0.2)' : 'transparent',
            transition: '0.2s ease',
          })}
        >
          {/* Append pending count for the leave tracker tab */}
          {tab.path === '/leave-tracker' && pendingCount > 0
            ? `${tab.label} (${pendingCount})`
            : tab.label}
        </NavLink>
      ))}

      <button
  onClick={() => {
    const auth = getAuth();
    auth.signOut().then(() => window.location.href = '/auth');
  }}
  style={{
    marginLeft: 'auto',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
  }}
>
  Logout
</button>

    </nav>
  );
};

export default TopNav;
