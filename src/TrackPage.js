// src/TrackPage.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const TrackPage = () => {
  const { trackId } = useParams();
  const [track, setTrack] = useState(null);

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

  if (!track) return <p style={{ color: '#fff', padding: 20 }}>Loading track...</p>;

  return (
    <div style={{ padding: 20, color: '#fff' }}>
      <h2>{track.name}</h2>
      <p><strong>Total Tasks:</strong> {track.totalTasks}</p>
      <p><strong>Completed:</strong> {track.completedTasks}</p>
      <p><strong>Progress:</strong> {Math.round((track.completedTasks / track.totalTasks) * 100)}%</p>
    </div>
  );
};

export default TrackPage;
