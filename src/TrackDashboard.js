// src/TrackDashboard.js
import AnalyticsCards from './components/AnalyticsCards';
import React, { useEffect, useState } from 'react';
import './TrackDashboard.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';
import RingCard from './components/RingCard';

const TrackDashboard = () => {
  const [tracks, setTracks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const trackCollection = collection(db, 'tracks');
        const snapshot = await getDocs(trackCollection);
        const data = snapshot.docs.map(doc => {
          const d = doc.data();
          const completion = d.totalTasks > 0
            ? Math.round((d.completedTasks / d.totalTasks) * 100)
            : 0;

          return {
            id: doc.id,
            name: d.name,
            completion,
            lastUpdated: 'Today 14:30', // placeholder for now
          };
        });

        setTracks(data);
      } catch (err) {
        console.error('Error fetching tracks:', err);
      }
    };

    fetchTracks();
  }, []);

  return (
    <div className="dashboard">
      <div style={{ marginBottom: 20 }}>
        <p style={{ color: '#aaa', fontSize: 14 }}>
          {new Date().toLocaleDateString('en-ZA', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
          })}
        </p>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>Track Tycoon Summary</h1>
      </div>

      <AnalyticsCards
        totalTasks={125}
        completedTasks={97}
        leastCompletedTrack="Parkview"
        mostActiveRole="Marshal"
      />

      <div style={{ display: 'flex', marginBottom: 30 }}>
        <RingCard label="Tasks Done" value={97} target={125} color="#ff2d55" unit="" />
        <RingCard label="Shopping Requests" value={3} target={10} color="#5ac8fa" unit="" />
        <RingCard label="Cleanliness" value={88} target={100} color="#34c759" unit="%" />
      </div>

      <div style={{ marginTop: 20 }}>
        {tracks.map((track, i) => (
          <div
            key={i}
            onClick={() => navigate(`/track/${track.id}`)}
            style={{
              background: '#1c1c1e',
              padding: '15px 20px',
              borderRadius: 14,
              marginBottom: 12,
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }}
          >
            <div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>{track.name}</p>
              <p style={{ fontSize: 12, color: '#aaa' }}>Completion: {track.completion}%</p>
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              {track.lastUpdated || '—'}
            </div>
          </div>
        ))}

        {/* Store Room Card */}
<div
  onClick={() => navigate('/stockroom')}
  style={{
    background: '#1c1c1e',
    padding: '15px 20px',
    borderRadius: 14,
    marginBottom: 12,
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
  }}
>
  <div>
    <p style={{ fontSize: 16, fontWeight: 600 }}>Store Room</p>
    <p style={{ fontSize: 12, color: '#aaa' }}>Central Stock Manager</p>
  </div>
  <div style={{ fontSize: 12, color: '#666' }}>—</div>
</div>

      </div>
    </div>
  );
};

export default TrackDashboard;
