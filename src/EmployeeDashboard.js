// src/EmployeeDashboard.js
import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import AnalyticsCards from './components/AnalyticsCards';
const mockTasks = {
  mechanic: [
    { id: 'oil-check', title: 'Check engine oil' },
    { id: 'tyre-pressure', title: 'Check tyre pressure' },
  ],
  marshall: [
    { id: 'cones', title: 'Set up safety cones' },
    { id: 'radio', title: 'Test radio connection' },
  ],
  cleaner: [
    { id: 'bins', title: 'Empty bins' },
    { id: 'bathroom', title: 'Clean bathrooms' },
  ],
};

const EmployeeDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : null;
      setUserInfo(data);
    };

    fetchUser();
  }, []);

  const handleCheck = async (taskId) => {
    const newState = { ...checked, [taskId]: !checked[taskId] };
    setChecked(newState);

    // Save progress in Firestore
    const auth = getAuth();
    const user = auth.currentUser;
    const ref = doc(db, 'users', user.uid, 'taskProgress', taskId);
    await setDoc(ref, {
      done: newState[taskId],
      updatedAt: new Date(),
    });
  };

  if (!userInfo) return <p style={{ color: '#fff', padding: 20 }}>Loading dashboard...</p>;

  const taskList = mockTasks[userInfo.role?.toLowerCase()] || [];

  return (
    <div style={{ padding: 20, color: '#fff' }}>
      <h2>👷 Employee Dashboard</h2>
      <p>Welcome, <strong>{userInfo.name}</strong>!</p>
      <p>Role: {userInfo.role}</p>
      <p>Track: {userInfo.assignedTrack}</p>

      <hr />
      <h3>📝 Your Tasks</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {taskList.map((task) => (
          <li key={task.id} style={{ marginBottom: 10 }}>
            <label>
              <input
                type="checkbox"
                checked={checked[task.id] || false}
                onChange={() => handleCheck(task.id)}
              />
              <span style={{ marginLeft: 8 }}>{task.title}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeDashboard;
