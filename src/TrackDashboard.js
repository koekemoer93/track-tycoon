// src/TrackDashboard.js
import AnalyticsCards from './components/AnalyticsCards';
import React, { useEffect, useState } from 'react';
import './TrackDashboard.css';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';
import AddEmployeeForm from './components/AddEmployeeForm';

const TrackDashboard = () => {
  const [tracks, setTracks] = useState([]);
  const navigate = useNavigate();
  const [pendingLeave, setPendingLeave] = useState(0);

  const getOpeningHours = (trackName) => {
    const name = trackName.toLowerCase();
    const day = new Date().getDay(); // 0=Sunday ... 6=Saturday

    if (name.includes('indykart')) {
      return {
        0: [11, 18],
        1: [11, 18],
        2: [11, 20],
        3: [11, 20],
        4: [11, 20],
        5: [11, 20],
        6: [11, 20],
      }[day] || [0, 0];
    }

    if (name.includes('midlands')) {
      return {
        0: [9, 17],
        1: [9, 17],
        2: [9, 17],
        3: [0, 0],   // closed Wednesday
        4: [9, 17],
        5: [9, 17],
        6: [9, 17],
      }[day] || [0, 0];
    }

    if (name.includes('syringa')) {
      return {
        0: [9, 18],
        1: [0, 0],   // closed Monday
        2: [11, 17],
        3: [11, 17],
        4: [11, 17],
        5: [11, 19],
        6: [9, 20],
      }[day] || [0, 0];
    }

    if (name.includes('pavilion')) {
      return {
        0: [9, 18],
        1: [10, 18],
        2: [10, 19],
        3: [10, 19],
        4: [10, 19],
        5: [10, 19],
        6: [9, 20],
      }[day] || [0, 0];
    }

    if (name.includes('rbek') || name.includes('rosebank')) {
      return {
        0: [11, 18],
        1: [11, 18],
        2: [11, 20],
        3: [11, 20],
        4: [11, 20],
        5: [11, 21],
        6: [11, 21],
      }[day] || [0, 0];
    }

    return [0, 24];
  };

  const isTrackOpen = (trackName) => {
    const hour = new Date().getHours();
    const [open, close] = getOpeningHours(trackName);
    return hour >= open && hour < close;
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tracks'), (snapshot) => {
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
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribeLeaves = null;
    const checkAdminAndSubscribe = async () => {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const { doc, getDoc } = await import('firebase/firestore');
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      const data = snap.exists() ? snap.data() : {};
      const isAdmin = data?.isAdmin || data?.role === 'owner' || data?.role === 'manager';
      if (isAdmin) {
        const pendingQuery = query(collection(db, 'leaveRequests'), where('status', '==', 'pending'));
        unsubscribeLeaves = onSnapshot(pendingQuery, (snapshot) => {
          setPendingLeave(snapshot.size);
        });
      }
    };
    checkAdminAndSubscribe();
    return () => {
      if (unsubscribeLeaves) unsubscribeLeaves();
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
        {pendingLeave > 0 && (
          <div
            style={{
              marginTop: 8,
              padding: '4px 12px',
              backgroundColor: 'rgba(225, 6, 0, 0.8)',
              borderRadius: 12,
              color: 'white',
              fontSize: 14,
              display: 'inline-block',
            }}
          >
            {pendingLeave} Pending Leave Request{pendingLeave > 1 ? 's' : ''}
          </div>
        )}
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
 <div style={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '60px',
  marginBottom: '80px',
  width: '100%',
}}>
  <div style={{ maxWidth: '400px', width: '100%' }}>
    <AddEmployeeForm />
  </div>
</div>


      </div>
    </div>
  );
};

export default TrackDashboard;
