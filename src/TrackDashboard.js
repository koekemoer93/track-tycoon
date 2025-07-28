// src/TrackDashboard.js

import React, { useEffect, useState } from 'react';
import './TrackDashboard.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
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
      <h1>Track Tycoon</h1>
      <div className="track-grid">
        {tracks.map((track, i) => (
          <div key={i} className="track-card" onClick={() => navigate(`/track/${track.id}`)} style={{ cursor: 'pointer' }}>
            <h3>{track.name}</h3>
            <div className="progress-circle">
              <CircularProgressbar
                value={track.completion}
                text={`${track.completion}%`}
                styles={buildStyles({
                  textColor: "#fff",
                  pathColor:
                    track.completion >= 80
                      ? "#0f0"
                      : track.completion >= 50
                      ? "#ff0"
                      : "#f00",
                  trailColor: "#444",
                })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackDashboard;
