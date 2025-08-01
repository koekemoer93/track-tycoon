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

  // Fetch the current track info
  useEffect(() => {
    const fetchTrack = async () => {
      const ref = doc(db, 'tracks', trackId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setTrack(snap.data());
      }
    };
    fetchTrack();
  }, [trackId]);

  // Fetch the logged-in user's role
  useEffect(() => {
    const fetchUserRole = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserRole(data.role);
      }
    };
    fetchUserRole();
  }, []);

  // Fetch the checklist template for today
  useEffect(() => {
    const fetchChecklistTemplate = async () => {
      if (!track || !userRole) return;

      const today = format(new Date(), 'EEEE').toLowerCase(); // e.g. 'monday'
      const docId = `${trackId}_${userRole.toLowerCase()}_${today}`;
      const templateRef = doc(db, 'templates', docId);
      const templateSnap = await getDoc(templateRef);

      if (templateSnap.exists()) {
        const data = templateSnap.data();
        setChecklist(data.tasks || []);
      } else {
        setChecklist([]); // no tasks found
      }
    };
    fetchChecklistTemplate();
  }, [track, userRole, trackId]);

  if (!track) return <p style={{ color: '#fff', padding: 20 }}>Loading track...</p>;

  return (
    <div style={{ padding: 20, color: '#fff' }}>
      <h2>{track.name}</h2>
      <p><strong>Total Tasks:</strong> {track.totalTasks}</p>
      <p><strong>Completed:</strong> {track.completedTasks}</p>
      <p><strong>Progress:</strong> {Math.round((track.completedTasks / track.totalTasks) * 100)}%</p>

      <hr />
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
  );
};

export default TrackPage;
