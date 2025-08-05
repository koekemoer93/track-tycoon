import '../theme.css';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const TopNav = () => {
  const [tabs, setTabs] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    let unsubscribeLeaves = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setPendingCount(0);
      if (unsubscribeLeaves) {
        unsubscribeLeaves();
        unsubscribeLeaves = null;
      }
      if (!user) {
        setTabs([]);
        return;
      }

      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = snap.exists() ? snap.data() : {};
      const isAdmin =
        data?.isAdmin || data?.role === 'owner' || data?.role === 'manager';

      if (isAdmin) {
        setTabs([
          { path: '/track-dashboard', label: '🏠 Dashboard' },
          { path: '/employee-dashboard', label: '🧑‍🔧 Employee' },
          { path: '/stockroom', label: '📦 Stock Room' },
          { path: '/leave-tracker', label: '⛱️ Leave' },
        ]);

        const pendingQuery = query(
          collection(db, 'leaveRequests'),
          where('status', '==', 'pending')
        );
        unsubscribeLeaves = onSnapshot(pendingQuery, (snapshot) => {
          setPendingCount(snapshot.size);
        });
      } else {
        setTabs([
          { path: '/employee-dashboard', label: '🧑‍🔧 Employee' },
          { path: '/clock-in', label: '🕒 Clock' },
          { path: '/leave', label: '⛱️ Leave' },
        ]);
      }
    });

    return () => {
      if (unsubscribeLeaves) unsubscribeLeaves();
      unsubscribe();
    };
  }, []);

  if (tabs.length === 0) return null;

  return (
    <nav
      className="top-nav"
      style={{
        display: 'flex',
        background: '#111',
        padding: '12px 20px',
        gap: 15,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
      }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          style={({ isActive }) => ({
            color: isActive ? '#fff' : '#bbb',
            fontWeight: isActive ? 'bold' : 'normal',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 8,
            background: isActive ? 'rgba(255, 165, 0, 0.2)' : 'transparent',
            transition: '0.2s ease',
          })}
        >
          {tab.path === '/leave-tracker' && pendingCount > 0
            ? `${tab.label} (${pendingCount})`
            : tab.label}
        </NavLink>
      ))}

      <button
        onClick={() => {
          const auth = getAuth();
          auth.signOut().then(() => (window.location.href = '/auth'));
        }}
        style={{
          marginLeft: 'auto',
          background: 'rgba(255,165,0,0.2)',
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
