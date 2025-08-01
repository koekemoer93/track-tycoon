// src/components/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setUser(null);
        setChecking(false);
        return;
      }

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setUser(null);
        setChecking(false);
        return;
      }

      const userData = userSnap.data();
      if (requireAdmin && !userData.isAdmin) {
        setUser(null);
      } else {
        setUser(currentUser);
      }

      setChecking(false);
    };

    checkUser();
  }, [requireAdmin]);

  if (checking) return <p style={{ color: '#fff', padding: 20 }}>Checking access...</p>;

  return user ? children : <Navigate to="/auth" />;
};

export default ProtectedRoute;
