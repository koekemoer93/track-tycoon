// src/Dashboard.js
import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import './theme.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);

          // Load user checklist
          const checklistRef = doc(
            db,
            'tracks',
            data.assignedTrack,
            'checklists',
            currentUser.uid
          );

          const checklistDoc = await getDoc(checklistRef);
          if (checklistDoc.exists()) {
            const tasks = checklistDoc.data().tasks || [];
            setChecklist(tasks);
            updateProgress(tasks);
          } else {
            // fallback to role template
            const templateRef = doc(
              db,
              'tracks',
              data.assignedTrack,
              'templates',
              data.role
            );
            const templateDoc = await getDoc(templateRef);
            if (templateDoc.exists()) {
              const templateTasks = templateDoc.data().tasks || [];
              const tasks = templateTasks.map(task => ({
                title: task.title,
                completed: false,
                timestamp: null,
              }));
              setChecklist(tasks);
              updateProgress(tasks);
            }
          }
        }
        setLoading(false); // ✅ only set false after success
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false); // ✅ also set false on error
      }
    };

    fetchUserData();
  }, [currentUser]);

  const updateProgress = (tasks) => {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    setProgress({ completed, total });
  };

  const handleCheckboxChange = async (index) => {
    const updatedChecklist = [...checklist];
    const task = updatedChecklist[index];
    task.completed = !task.completed;
    task.timestamp = task.completed ? new Date().toISOString() : null;

    setChecklist(updatedChecklist);
    updateProgress(updatedChecklist);

    if (!userData) return;

    const checklistRef = doc(
      db,
      'tracks',
      userData.assignedTrack,
      'checklists',
      currentUser.uid
    );

    await setDoc(checklistRef, { tasks: updatedChecklist });
  };

  if (loading) {
    return <div className="glass-card">Loading your dashboard...</div>;
  }

  if (!userData) {
    return <div className="glass-card">User data not found.</div>;
  }

  const { role, assignedTrack, name } = userData;

  return (
    <div className="main-wrapper">
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '600px',
          textAlign: 'center',
          marginTop: '40px',
        }}
      >
        <h2 style={{ marginBottom: '10px' }}>Welcome, {name}</h2>
        <p>
          <strong>Role:</strong> {role}
        </p>
        <p>
          <strong>Assigned Track:</strong> {assignedTrack}
        </p>
      </div>

      {/* Owner Section */}
      {role === 'owner' && (
        <div className="glass-card" style={{ maxWidth: '600px' }}>
          <h3>Owner Overview</h3>
          <p>View track performance, stock levels, and staff status.</p>
        </div>
      )}

      {/* Admin Section */}
      {role === 'admin' && (
        <div className="glass-card" style={{ maxWidth: '600px' }}>
          <h3>Admin Tools</h3>
          <p>Manage users, assign roles, and handle system settings.</p>
        </div>
      )}

      {/* Employee Checklist + Ring */}
      {['marshal', 'mechanic', 'hr'].includes(role) && (
        <>
          <div
            className="glass-card"
            style={{ width: '250px', textAlign: 'center' }}
          >
            <h3>Task Progress</h3>
            <div style={{ width: 120, margin: '0 auto' }}>
              <CircularProgressbar
                value={
                  progress.total === 0
                    ? 0
                    : (progress.completed / progress.total) * 100
                }
                text={`${progress.completed}/${progress.total}`}
                styles={buildStyles({
                  textColor: '#fff',
                  pathColor: '#30d158',
                  trailColor: '#333',
                })}
              />
            </div>
            <p style={{ marginTop: '10px' }}>Tasks completed today</p>
          </div>

          <div className="glass-card" style={{ maxWidth: '600px' }}>
            <h3>Daily Checklist</h3>
            {checklist.map((task, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleCheckboxChange(index)}
                  style={{ marginRight: '10px' }}
                />
                <span
                  style={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
