import './theme.css';
// ----------- TRACKPAGE.JS -----------
// src/TrackPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getAuth } from 'firebase/auth';
import { format } from 'date-fns';

const TrackPage = () => {
  const { trackId } = useParams();
  const [track, setTrack] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [checklist, setChecklist] = useState([]);

  useEffect(() => {
    const fetchTrack = async () => {
      const ref = doc(db, 'tracks', trackId);
      const snap = await getDoc(ref);
      if (snap.exists()) setTrack(snap.data());
    };
    fetchTrack();
  }, [trackId]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) setUserRole(userSnap.data().role);
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchChecklistTemplate = async () => {
      if (!track || !userRole) return;
      const today = format(new Date(), 'EEEE').toLowerCase();
      const docId = `${trackId}_${userRole.toLowerCase()}_${today}`;
      const templateRef = doc(db, 'templates', docId);
      const templateSnap = await getDoc(templateRef);
      setChecklist(templateSnap.exists() ? templateSnap.data().tasks || [] : []);
    };
    fetchChecklistTemplate();
  }, [track, userRole, trackId]);

  if (!track) return <p style={{ color: '#fff', padding: 20 }}>Loading track...</p>;

  return (
  <div className="page">
    <div className="glass-card">
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a)',
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 20
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)', borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.08)', padding: 24,
        width: '100%', maxWidth: 700, color: '#fff'
      }}>
        <h2>{track.name}</h2>
        <p><strong>Total Tasks:</strong> {track.totalTasks}</p>
        <p><strong>Completed:</strong> {track.completedTasks}</p>
        <p><strong>Progress:</strong> {Math.round((track.completedTasks / track.totalTasks) * 100)}%</p>

        <hr style={{ borderColor: '#444' }} />
        <h3>📝 Today's Checklist</h3>
        {checklist.length === 0 ? (
          <p>No tasks found for today.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {checklist.map((task) => (
              <li key={task.id} style={{ marginBottom: 10 }}>
                <label>
                  <input type="checkbox" disabled />
                  <span style={{ marginLeft: 8 }}>{task.title}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  
    </div>
  </div>
);
};

export default TrackPage;