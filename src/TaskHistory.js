import './theme.css';
// ----------- TASKHISTORY.JS -----------
// src/TaskHistory.js
import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const TaskHistory = () => {
  const [history, setHistory] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTaskHistory = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const taskRef = collection(db, 'users', user.uid, 'taskProgress');
      const snap = await getDocs(taskRef);

      const tempHistory = {};
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.done && data.updatedAt) {
          const date = format(data.updatedAt.toDate(), 'yyyy-MM-dd');
          if (!tempHistory[date]) tempHistory[date] = [];
          tempHistory[date].push(doc.id);
        }
      });

      setHistory(tempHistory);
    };
    fetchTaskHistory();
  }, []);

  const sortedDates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a)).slice(0, 7);

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
        <h2>📅 Task History</h2>
        <button onClick={() => navigate(-1)} style={{ marginBottom: 20, padding: '8px 16px', borderRadius: 8 }}>⬅️ Back</button>

        {sortedDates.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#aaa' }}>No completed tasks yet.</p>
        ) : (
          sortedDates.map((date) => (
            <div key={date} style={{ marginBottom: 20 }}>
              <h4>{format(new Date(date), 'EEEE, MMM d')}</h4>
              <ul>
                {history[date].map((taskId) => (
                  <li key={taskId}>✅ {taskId}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  
    </div>
  </div>
);
};

export default TaskHistory;