// src/LeaveRequestPage.js
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * LeaveRequestPage allows non-admin users to request leave by specifying
 * a start date, end date and a reason. Before submission the component
 * checks Firestore for overlapping requests at the same track and
 * notifies the user if any exist. Upon successful submission the
 * request is stored in the `leaveRequests` collection with a status
 * of "pending".  The UI follows the glassy card style used
 * throughout the rest of Track Tycoon.
 */
const LeaveRequestPage = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [overlapWarning, setOverlapWarning] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Fetch the current user's basic info (name, assigned track, uid)
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      // Load user record from Firestore
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setUserInfo({ id: user.uid, ...snap.data() });
      }
    });
    return unsubscribe;
  }, []);

  /**
   * Check Firestore for overlapping leave at the same track. A leave is
   * considered overlapping if the new start is on or before an existing
   * end and the new end is on or after an existing start. Only pending
   * or approved requests are considered conflicts; denied leave does
   * not block new requests.
   */
  const checkOverlap = async (start, end, track) => {
    // Query all leave requests for the same track
    const q = query(collection(db, 'leaveRequests'), where('track', '==', track));
    const snapshot = await getDocs(q);
    const overlaps = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.status === 'denied') return;
      const existingStart = data.fromDate.toDate();
      const existingEnd = data.toDate.toDate();
      // Overlap condition: start <= existingEnd && end >= existingStart
      if (start <= existingEnd && end >= existingStart) {
        overlaps.push({ id: docSnap.id, ...data });
      }
    });
    return overlaps;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    setOverlapWarning('');
    if (!userInfo) {
      setStatusMsg('Unable to submit: user information not loaded.');
      return;
    }
    if (!fromDate || !toDate) {
      setStatusMsg('Please select both From and To dates.');
      return;
    }
    // Convert ISO date strings to Date objects at midnight local time
    const start = new Date(fromDate);
    const end = new Date(toDate);
    // Ensure start <= end
    if (start > end) {
      setStatusMsg('End date must be on or after the start date.');
      return;
    }
    // Check for overlaps
    const overlaps = await checkOverlap(start, end, userInfo.assignedTrack);
    if (overlaps.length > 0) {
      setOverlapWarning(
        `⚠️ There is already leave booked for this period at ${userInfo.assignedTrack}.`);
      // We continue with submission; user still may submit overlapping leave
    }
    // Build Firestore document
    try {
      await addDoc(collection(db, 'leaveRequests'), {
        userId: userInfo.id,
        userName: userInfo.name,
        track: userInfo.assignedTrack,
        fromDate: Timestamp.fromDate(start),
        toDate: Timestamp.fromDate(end),
        reason: reason.trim(),
        status: 'pending',
        createdAt: new Date(),
      });
      setStatusMsg('✅ Leave request submitted successfully.');
      // Reset form fields
      setFromDate('');
      setToDate('');
      setReason('');
    } catch (err) {
      console.error('Error submitting leave:', err);
      setStatusMsg('❌ Failed to submit leave request. Please try again.');
    }
  };

  if (!userInfo) {
    return (
      <p style={{ color: '#fff', padding: 20 }}>Loading user information…</p>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a)',
        padding: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
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
          maxWidth: 600,
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
        }}
      >
        <h2>⛱️ Request Leave</h2>
        <p>
          Submitting leave for <strong>{userInfo.name}</strong> at track{' '}
          <strong>{userInfo.assignedTrack}</strong>
        </p>
        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            From:
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              required
              style={{
                display: 'block',
                marginTop: 4,
                padding: '6px 8px',
                borderRadius: 8,
                border: '1px solid #444',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            To:
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              required
              style={{
                display: 'block',
                marginTop: 4,
                padding: '6px 8px',
                borderRadius: 8,
                border: '1px solid #444',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Reason:
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{
                display: 'block',
                marginTop: 4,
                padding: '6px 8px',
                borderRadius: 8,
                border: '1px solid #444',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                minHeight: 80,
                width: '100%',
              }}
            />
          </label>
          {overlapWarning && (
            <p style={{ color: '#e6a700', marginBottom: 8 }}>{overlapWarning}</p>
          )}
          <button
            type="submit"
            style={{
              background: 'rgba(225, 6, 0, 0.8)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 12,
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: 10,
            }}
          >
            Submit Leave Request
          </button>
        </form>
        {statusMsg && <p style={{ marginTop: 12 }}>{statusMsg}</p>}
      </div>
    </div>
  );
};

export default LeaveRequestPage;