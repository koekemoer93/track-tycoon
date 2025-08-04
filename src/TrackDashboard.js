import AnalyticsCards from './components/AnalyticsCards';
import React, { useEffect, useState } from 'react';
import './TrackDashboard.css';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';

const isTrackOpen = (trackName) => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 (Sun) – 6 (Sat)
  const currentHour = now.getHours();

  const isWithinHours = (start, end) => currentHour >= start && currentHour < end;

  if (trackName.includes('Indykart')) {
    if (currentDay === 1) return isWithinHours(11, 18);
    if (currentDay === 0 || currentDay === 6) return isWithinHours(11, 18);
    return isWithinHours(11, 20);
  }

  if (trackName.includes('Midlands')) {
    if (currentDay === 3) return false;
    return isWithinHours(9, 17);
  }

  if (trackName.includes('Syringa')) {
    if (currentDay === 1) return false;
    if (currentDay >= 2 && currentDay <= 4) return isWithinHours(11, 17);
    if (currentDay === 5) return isWithinHours(11, 19);
    if (currentDay === 6) return isWithinHours(9, 20);
    if (currentDay === 0) return isWithinHours(9, 18);
  }

  if (trackName.includes('Pavilion')) {
    if (currentDay === 1) return isWithinHours(10, 18);
    if (currentDay >= 2 && currentDay <= 5) return isWithinHours(10, 19);
    if (currentDay === 6) return isWithinHours(9, 20);
    if (currentDay === 0) return isWithinHours(9, 18);
  }

  if (trackName.includes('RBEK') || trackName.includes('Rosebank')) {
    if (currentDay === 1) return isWithinHours(11, 18);
    if (currentDay >= 2 && currentDay <= 4) return isWithinHours(11, 20);
    if (currentDay === 5 || currentDay === 6) return isWithinHours(11, 21);
    if (currentDay === 0) return isWithinHours(11, 18);
  }

  return false;
};

const TrackDashboard = () => {
  const [tracks, setTracks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTracks = (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        const completion = d.totalTasks > 0
          ? Math.round((d.completedTasks / d.totalTasks) * 100)
          : 0;

        const status = isTrackOpen(d.name) ? 'open' : 'closed';

        return {
          id: doc.id,
          name: d.name,
          status,
          completion,
          lastUpdated: 'Today 14:30',
        };
      });

      setTracks(data);
    };

    const trackRef = collection(db, 'tracks');
    const unsubscribe = onSnapshot(trackRef, fetchTracks);

    const interval = setInterval(() => {
      onSnapshot(trackRef, fetchTracks);
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
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
            <div style={{
              marginTop: 10,
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: 'bold',
              color: 'white',
              backgroundColor: track.status === 'open' ? 'green' : 'red',
              display: 'inline-block',
              fontSize: 12
            }}>
              {track.status === 'open' ? 'Open' : 'Closed'}
            </div>

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
