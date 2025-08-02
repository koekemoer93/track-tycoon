// src/TrackDashboard.js
import AnalyticsCards from './components/AnalyticsCards';
import React, { useEffect, useState } from 'react';
import './TrackDashboard.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';

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
            lastUpdated: 'Today 14:30',
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
    <div className="dashboard glass-container">
      <div style={{ marginBottom: 20 }}>
        <p className="date">
          {new Date().toLocaleDateString('en-ZA', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
          })}
        </p>
        <h1>Track Tycoon Summary</h1>
      </div>

      <AnalyticsCards
        totalTasks={125}
        completedTasks={97}
        leastCompletedTrack="Parkview"
        mostActiveRole="Marshal"
      />

      <div className="track-grid">
        {tracks.map(track => (
          <div
            key={track.id}
            className="track-card"
            onClick={() => navigate(`/track/${track.id}`)}
          >
            <div className="track-info">
              <h2>{track.name}</h2>
              <p className="label">Completion</p>
              <div className="track-bar">
                <div
                  className="track-fill"
                  style={{ width: `${track.completion}%` }}
                ></div>
              </div>
              <p className="percent-label">{track.completion}%</p>
              <p className="timestamp">Updated: {track.lastUpdated}</p>
            </div>
          </div>
        ))}

        {/* Store Room Card */}
        <div
          className="track-card"
          onClick={() => navigate('/stockroom')}
        >
          <div className="track-info">
            <h2>Store Room</h2>
            <p className="label">Central Stock Manager</p>
            <p className="timestamp">—</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackDashboard;
