// Updated EmployeeDashboard.js with embedded My Schedule view and all existing features

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

const getLevel = (xp) => Math.floor(xp / 100) + 1;

const getXPForNextLevel = (xp) => {
  const currentLevel = getLevel(xp);
  const nextLevelXP = currentLevel * 100;
  return {
    level: currentLevel,
    xpInLevel: xp % 100,
    xpToNextLevel: nextLevelXP - xp,
  };
};

const getBadgeTitle = (level) => {
  if (level >= 5) return 'Legend';
  if (level === 4) return 'Pro';
  if (level === 3) return 'Bronze';
  if (level === 2) return 'Apprentice';
  return 'Rookie';
};

const EmployeeDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [checked, setChecked] = useState({});
  const [imageUrls, setImageUrls] = useState({});
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [weeklySchedule, setWeeklySchedule] = useState([]);

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

      const progressRef = doc(db, 'users', user.uid, 'progressSummary');
      const progressSnap = await getDoc(progressRef);
      if (progressSnap.exists()) {
        const progressData = progressSnap.data();
        setStreak(progressData.streakCount || 0);
        setXp(progressData.xp || 0);
      }
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
              (task.recurrence === 'monthly' && new Date().getDate() <= 7 && day === today);

            if (isToday || isRecurring) {
              tasksForToday.push(task);
            }
          });
        });

        setChecklist(tasksForToday);

        const auth = getAuth();
        const user = auth.currentUser;
        const progressRef = collection(db, 'users', user.uid, 'taskProgress');
        const snapshot = await getDocs(progressRef);
        const imageMap = {};
        const checkMap = {};

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.imageUrl) imageMap[docSnap.id] = data.imageUrl;
          if (data.done) checkMap[docSnap.id] = true;
        });

        setImageUrls(imageMap);
        setChecked(checkMap);
      } else {
        setChecklist([]);
      }
    };

    fetchChecklist();
  }, [userInfo]);

  useEffect(() => {
    const fetchWeeklySchedule = async () => {
      if (!userInfo?.role || !userInfo?.assignedTrack) return;

      const templateRef = doc(
        db,
        'tracks',
        userInfo.assignedTrack,
        'templates',
        userInfo.role.toLowerCase()
      );

      const docSnap = await getDoc(templateRef);

      if (!docSnap.exists()) {
        setWeeklySchedule([]);
        return;
      }

      const template = docSnap.data();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = new Date();

      const next7Days = [...Array(7)].map((_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayName = days[date.getDay()];
        const dailyTasks = template['daily'] || [];
        const specificTasks = template[dayName] || [];

        return {
          date: format(date, 'EEE, MMM d'),
          tasks: [...dailyTasks, ...specificTasks],
        };
      });

      setWeeklySchedule(next7Days);
    };

    fetchWeeklySchedule();
  }, [userInfo]);

  // ... rest of component unchanged (existing task view, image uploads, XP, streak, and dashboard layout)
};

export default EmployeeDashboard;
