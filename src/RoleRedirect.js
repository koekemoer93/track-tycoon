import './theme.css';
// src/RoleRedirect.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const RoleRedirect = () => {
  // We no longer need a loading state here; navigation happens immediately.
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = async () => {
      const user = getAuth().currentUser;
      // If the user is not logged in, send them to the login page
      if (!user) {
        navigate('/auth');
        return;
      }

      // Fetch the user's Firestore record to determine their role/admin status
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const data = snap.exists() ? snap.data() : {};

      // Determine if this user has admin privileges
      const isAdmin =
        data?.isAdmin || data?.role === 'owner' || data?.role === 'manager';

      // Redirect based on admin status
      if (isAdmin) {
        // Owners and other admins go to the track dashboard
        navigate('/track-dashboard');
      } else {
        // Non‑admins go to the employee dashboard
        navigate('/employee-dashboard');
      }
    };

    checkRole();
  }, [navigate]);

  return <p style={{ color: '#fff', padding: 20 }}>Redirecting...</p>;
};

export default RoleRedirect;
