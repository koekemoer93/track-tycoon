// src/TrackPage.js
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './firebase';

const TrackPage = () => {
  const { trackId } = useParams();
  const [track, setTrack] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [checkedTasks, setCheckedTasks] = useState([]);
  const userRole = 'Marshal'; // TODO: replace with real role later
  const userId = 'demo-user'; // TODO: replace with real auth later

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

  useEffect(() => {
    const fetchChecklist = async () => {
      if (!track) return;

      // Step 1: Load checklist template based on track + role
      const q = query(
        collection(db, 'checklistTemplates'),
        where('role', '==', userRole),
        where('track', '==', track.name)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        const tasks = docData.tasks || [];
        setChecklist(tasks);

        // Step 2: Load saved user progress (if any)
        const savedRef = doc(db, 'users', userId, 'checklists', trackId);
        const savedSnap = await getDoc(savedRef);

        if (savedSnap.exists()) {
          const savedData = savedSnap.data();
          setCheckedTasks(savedData.checklist || tasks.map(() => false));
        } else {
          setCheckedTasks(tasks.map(() => false)); // Default: all unchecked
        }
      }
    };

    fetchChecklist();
  }, [track]);

  const handleSave = async () => {
    const ref = doc(db, 'users', userId, 'checklists', trackId);
    await setDoc(ref, {
      track: track.name,
      role: userRole,
      checklist: checkedTasks,
      updatedAt: serverTimestamp()
    });
    alert('Checklist progress saved!');
  };

  if (!track) return <p style={{ color: '#fff', padding: 20 }}>Loading track...</p>;

  return (
    <div style={{ padding: 20, color: '#fff' }}>
      <h2>{track.name}</h2>
      <p><strong>Total Tasks:</strong> {track.totalTasks}</p>
      <p><strong>Completed:</strong> {track.completedTasks}</p>
      <p><strong>Progress:</strong> {Math.round((track.completedTasks / track.totalTasks) * 100)}%</p>

      <h3 style={{ marginTop: 30 }}>Checklist for {userRole}</h3>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {checklist.map((task, i) => (
          <li key={i}>
            <label>
              <input
                type="checkbox"
                checked={checkedTasks[i] || false}
                onChange={() => {
                  const updated = [...checkedTasks];
                  updated[i] = !updated[i];
                  setCheckedTasks(updated);
                }}
              />
              {' '}
              {task}
            </label>
          </li>
        ))}
      </ul>

      <button
        style={{
          marginTop: 20,
          padding: '10px 20px',
          backgroundColor: '#00c853',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer'
        }}
        onClick={handleSave}
      >
        Save Progress
      </button>
    </div>
  );
};

export default TrackPage;
