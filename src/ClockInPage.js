// src/ClockInPage.js
//
// This component implements a basic clock‑in/clock‑out system for
// employees. It uses the browser's geolocation API to fetch the
// employee's current position and compares it against a predefined
// set of coordinates for the track. If the user is within a small
// radius of the track location, they may clock in or out; otherwise,
// a warning is shown. Records are stored in the `clockInOutRecords`
// collection in Firestore with a timestamp, user ID and whether the
// entry was a clock in or out.

import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

// 🗺️ Coordinates for Epic Karting Pavilion.
//
// Replace these values with the actual latitude and longitude of
// Epic Karting Pavilion. Coordinates are expressed in decimal
// degrees. For example: { lat: -26.234567, lng: 28.123456 }
const EPIC_PAVILION_COORDS = {
  lat: -26.234567,
  lng: 28.123456,
};

// Maximum distance (in metres) an employee can be from the track
// location to clock in or out. Adjust this threshold to suit
// your operational requirements. A value of 100 means employees
// must be within 100 metres of the track.
const MAX_DISTANCE_METERS = 100;

// Helper to compute distance between two lat/lng points using
// the Haversine formula. Returns the distance in metres.
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // radius of Earth in metres
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const ClockInPage = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // On mount, determine if the current user is already clocked in
    const fetchStatus = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      const q = query(
        collection(db, 'clockInOutRecords'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const lastRecord = snap.docs[0].data();
        setIsClockedIn(lastRecord.type === 'in');
      }
      setLoading(false);
    };
    fetchStatus();
  }, []);

  const handleClock = async () => {
    setMessage('');
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setMessage('User not authenticated.');
      return;
    }
    // Request the user's current position
    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const distance = getDistanceMeters(
          latitude,
          longitude,
          EPIC_PAVILION_COORDS.lat,
          EPIC_PAVILION_COORDS.lng
        );
        if (distance > MAX_DISTANCE_METERS) {
          setMessage(
            `You are too far from the track to clock ${isClockedIn ? 'out' : 'in'}.\n` +
              `Distance: ${distance.toFixed(1)}m (max ${MAX_DISTANCE_METERS}m)`
          );
          return;
        }
        try {
          // Save the record to Firestore
          await addDoc(collection(db, 'clockInOutRecords'), {
            userId: user.uid,
            userName: user.displayName || user.email || 'Unknown',
            trackId: 'epicKartingPavilion',
            type: isClockedIn ? 'out' : 'in',
            timestamp: new Date(),
            location: {
              lat: latitude,
              lng: longitude,
              distance,
            },
          });
          // Flip the clocked in state
          setIsClockedIn((prev) => !prev);
          setMessage(
            `Successfully clocked ${isClockedIn ? 'out' : 'in'}!`
          );
        } catch (err) {
          console.error('Failed to record clock entry:', err);
          setMessage('Failed to save clock entry. Please try again.');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setMessage('Unable to retrieve your location.');
      },
      { enableHighAccuracy: true }
    );
  };

  if (loading) {
    return (
      <p style={{ color: '#fff', padding: 20 }}>Loading clock status…</p>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 20,
        color: '#fff',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 500,
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
        }}
      >
        <h2>🕒 Clock In/Out</h2>
        <p style={{ marginBottom: 20 }}>
          {isClockedIn
            ? 'You are currently clocked in.'
            : 'You are currently clocked out.'}
        </p>
        <button
          onClick={handleClock}
          style={{
            background: 'var(--accent-color)',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: 12,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {isClockedIn ? 'Clock Out' : 'Clock In'}
        </button>
        {message && (
          <p style={{ marginTop: 20, whiteSpace: 'pre-line' }}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default ClockInPage;