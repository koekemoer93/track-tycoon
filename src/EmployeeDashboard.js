import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import MissionCard from './components/MissionCard';

const EmployeeDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [checked, setChecked] = useState({});
  const [imageUrls, setImageUrls] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        navigate('/auth');
        return;
      }

      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : null;
      setUserInfo(data);
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchChecklist = async () => {
      if (!userInfo?.role || !userInfo?.assignedTrack) return;

      const today = format(new Date(), 'EEEE');
      const templateRef = doc(
        db,
        'tracks',
        userInfo.assignedTrack,
        'templates',
        userInfo.role.toLowerCase()
      );
      const docSnap = await getDoc(templateRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        let tasksForToday = [];

        Object.entries(data).forEach(([day, tasks]) => {
          tasks.forEach((task) => {
            const isToday = day === today;
            const isRecurring =
              task.recurrence === 'daily' ||
              (task.recurrence === 'weekly' && day === today) ||
              (task.recurrence === 'monthly' &&
                new Date().getDate() <= 7 &&
                day === today);

            if (isToday || isRecurring) {
              tasksForToday.push(task);
            }
          });
        });

        setChecklist(tasksForToday);

        // Load saved image URLs
        const auth = getAuth();
        const user = auth.currentUser;
        const progressRef = collection(db, 'users', user.uid, 'taskProgress');
        const snapshot = await getDocs(progressRef);
        const imageMap = {};
        const checkMap = {};

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.imageUrl) {
            imageMap[docSnap.id] = data.imageUrl;
          }
          if (data.done) {
            checkMap[docSnap.id] = true;
          }
        });

        setImageUrls(imageMap);
        setChecked(checkMap);
      } else {
        setChecklist([]);
      }
    };

    fetchChecklist();
  }, [userInfo]);

  const handleCheck = async (taskId) => {
    const newState = { ...checked, [taskId]: !checked[taskId] };
    setChecked(newState);

    const auth = getAuth();
    const user = auth.currentUser;
    const ref = doc(db, 'users', user.uid, 'taskProgress', taskId);
    await setDoc(
      ref,
      {
        done: newState[taskId],
        updatedAt: new Date(),
      },
      { merge: true }
    );
  };

  const handleImageUpload = async (taskId, file) => {
    if (!file) return;

    const auth = getAuth();
    const user = auth.currentUser;
    const storage = getStorage();
    const storageRef = ref(storage, `uploads/${user.uid}/${taskId}.jpg`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    const refDoc = doc(db, 'users', user.uid, 'taskProgress', taskId);
    await setDoc(
      refDoc,
      {
        imageUrl: downloadURL,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    setImageUrls((prev) => ({ ...prev, [taskId]: downloadURL }));
  };

  if (!userInfo) {
    return <p style={{ color: '#fff', padding: 20 }}>Loading dashboard...</p>;
  }

  const checkedCount = checklist.filter((task) => checked[task.id]).length;
  const progress =
    checklist.length > 0
      ? Math.round((checkedCount / checklist.length) * 100)
      : 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a)',
        padding: 20,
        fontFamily: 'Helvetica, sans-serif',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 700,
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
        }}
      >
        <MissionCard
          userName={userInfo.name}
          progress={progress}
          taskCount={checklist.length}
        />

        <h2>👷 Employee Dashboard</h2>
        <p>Welcome, <strong>{userInfo.name}</strong>!</p>
        <p>Role: {userInfo.role}</p>
        <p>Track: {userInfo.assignedTrack}</p>

        <hr style={{ borderColor: '#444' }} />

        <div style={{ width: 100, marginBottom: 20 }}>
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            styles={buildStyles({
              textColor: '#fff',
              pathColor: '#00ff88',
              trailColor: '#333',
            })}
          />
        </div>

        <button
          onClick={() => navigate('/task-history')}
          style={{
            marginBottom: 20,
            padding: '8px 16px',
            backgroundColor: '#111',
            border: '1px solid #555',
            borderRadius: 8,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          📅 View Task History
        </button>

        <h3>🗓️ {format(new Date(), 'EEEE')} Tasks</h3>

        {checklist.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {checklist.map((task) => (
              <li key={task.id} style={{ marginBottom: 20 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={checked[task.id] || false}
                    onChange={() => handleCheck(task.id)}
                  />
                  <span style={{ marginLeft: 8 }}>{task.title}</span>
                </label>
                <br />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageUpload(task.id, e.target.files[0])
                  }
                />
                {imageUrls[task.id] && (
                  <img
                    src={imageUrls[task.id]}
                    alt="Uploaded proof"
                    style={{ marginTop: 8, maxWidth: '150px', borderRadius: 8 }}
                  />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#bbb', fontStyle: 'italic' }}>
            No tasks scheduled for today.
          </p>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
