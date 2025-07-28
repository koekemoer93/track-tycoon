// src/RoleRedirect.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const RoleRedirect = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = async () => {
      const user = getAuth().currentUser;
      if (!user) return navigate('/'); // stays on AuthPage if not logged in

      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const data = snap.exists() ? snap.data() : {};

      if (data.role === 'owner') {
        navigate('/dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    };

    checkRole();
  }, [navigate]);

  return <p style={{ color: '#fff', padding: 20 }}>Redirecting...</p>;
};

export default RoleRedirect;
