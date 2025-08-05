// ClockInPage.js
import './theme.css';
import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';

const CLOCK_RADIUS_METERS = 200;

const trackCoordinates = {
  "epic karting syringa": {
    latitude: -26.017348,
    longitude: 27.836445,
  },
};

const haversineDistance = (coords1, coords2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const ClockInPage = () => {
  const [status, setStatus] = useState('');
  const [distance, setDistance] = useState(null);
  const [canClockIn, setCanClockIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [lastClockLogId, setLastClockLogId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchUserInfo = async () => {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) return;

      const data = snap.data();
      const trackCoord = trackCoordinates[data.assignedTrack];
      if (!trackCoord) {
        setStatus('Track coordinates not set');
        setLoading(false);
        return;
      }

      if (data.clockedIn && data.lastClockLogId) {
        setIsClockedIn(true);
        setLastClockLogId(data.lastClockLogId);
      }

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const userCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          const dist = haversineDistance(userCoords, trackCoord);
          setDistance(dist);

          if (dist <= CLOCK_RADIUS_METERS) {
            setStatus('You are within range. Ready to clock in.');
            setCanClockIn(true);
          } else {
            setStatus(`You are too far from the track to clock in.`);
            setCanClockIn(false);
          }

          setLoading(false);
        },
        (error) => {
          setStatus('Location error: ' + error.message);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    };

    fetchUserInfo();
  }, [navigate]);

  const handleClockIn = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const now = new Date();
    const logId = now.toISOString();
    const clockRef = doc(db, 'users', user.uid, 'clockLogs', logId);
    await setDoc(clockRef, {
      clockIn: now,
    });

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      clockedIn: true,
      lastClockLogId: logId,
    });

    setStatus('Clocked in successfully!');
    setIsClockedIn(true);
    setLastClockLogId(logId);
  };

  const handleClockOut = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !lastClockLogId) return;

    const now = new Date();
    const clockRef = doc(db, 'users', user.uid, 'clockLogs', lastClockLogId);
    await updateDoc(clockRef, {
      clockOut: now,
    });

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      clockedIn: false,
      lastClockLogId: '',
    });

    setStatus('Clocked out successfully!');
    setIsClockedIn(false);
    setLastClockLogId(null);
  };

  return (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(to bottom right, #000000, #1a1a1a)',
    color: 'white',
    fontFamily: 'Helvetica, sans-serif',
    padding: '20px'
  }}>
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '20px',
      padding: '30px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
      width: '100%',
      maxWidth: '400px',
      textAlign: 'center'
    }}>
      <h2 style={{
        fontSize: '24px',
        marginBottom: '25px',
        fontWeight: '600',
        letterSpacing: '0.5px'
      }}>
        🕒 Clock In / Out
      </h2>

      {loading ? (
        <p>Getting location...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p>{status}</p>

          {distance !== null && (
            <p style={{ fontSize: '14px', color: '#ccc' }}>
              Distance: {distance.toFixed(1)}m (max {CLOCK_RADIUS_METERS}m)
            </p>
          )}

          {isClockedIn ? (
            <button
              onClick={handleClockOut}
              style={{
                padding: '12px 20px',
                backgroundColor: '#d50000',
                color: 'white',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '10px',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              Clock Out
            </button>
          ) : (
            canClockIn && (
              <button
                onClick={handleClockIn}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#00c853',
                  color: 'white',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '10px',
                  width: '100%',
                  cursor: 'pointer'
                }}
              >
                Clock In
              </button>
            )
          )}

          {isClockedIn && (
            <div style={{
              padding: '10px',
              backgroundColor: '#1e1e1e',
              borderRadius: '10px',
              border: '1px solid #00c853',
              color: '#00c853',
              fontWeight: 'bold'
            }}>
              ✅ You are Clocked In
            </div>
          )}
        </div>
      )}
    </div>
  </div>
  );
};

export default ClockInPage;
