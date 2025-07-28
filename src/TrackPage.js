// src/TrackPage.js
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import mockTemplatesByDay from './mockTemplatesByDay';
import { format } from 'date-fns';

const TrackPage = () => {
  const { trackId } = useParams();
  const [track, setTrack] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [checkedTasks, setCheckedTasks] = useState([]);
  const [shoppingItem, setShoppingItem] = useState('');
  const [shoppingQty, setShoppingQty] = useState('');
  const [shoppingList, setShoppingList] = useState([]);

  const userRole = 'Marshal'; // mock role
  const userId = 'demo-user'; // mock user

  useEffect(() => {
    const fetchTrack = async () => {
      const ref = doc(db, 'tracks', trackId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setTrack(snap.data());
      }
    };
    fetchTrack();
  }, [trackId]);

  useEffect(() => {
    const fetchChecklist = async () => {
      if (!track) return;

      const q = query(
        collection(db, 'checklistTemplates'),
        where('role', '==', userRole),
        where('track', '==', track.name)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        const tasks = docData.tasks || [];
        setChecklist(tasks);

        const savedRef = doc(db, 'users', userId, 'checklists', trackId);
        const savedSnap = await getDoc(savedRef);

        if (savedSnap.exists()) {
          const savedData = savedSnap.data();
          setCheckedTasks(savedData.checklist || tasks.map(() => false));
          setTrack(prev => ({ ...prev, images: savedData.images || {} }));
        } else {
          setCheckedTasks(tasks.map(() => false));
        }
      }
    };
    fetchChecklist();
  }, [track, trackId]);

  useEffect(() => {
    if (!trackId) return;
    const unsubscribe = onSnapshot(
      collection(db, 'tracks', trackId, 'shoppingList'),
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setShoppingList(items);
      }
    );
    return () => unsubscribe();
  }, [trackId]);

  useEffect(() => {
    if (!checklist.length || !trackId) return;
    const totalTasks = checklist.length;
    const completedTasks = checkedTasks.filter(Boolean).length;

    const updateTrackProgress = async () => {
      const ref = doc(db, 'tracks', trackId);
      await setDoc(ref, {
        ...track,
        completedTasks,
        totalTasks,
        updatedAt: serverTimestamp()
      }, { merge: true });
    };

    updateTrackProgress();
  }, [checkedTasks, checklist.length, track, trackId]);

  const handleSave = async () => {
    const ref = doc(db, 'users', userId, 'checklists', trackId);
    await setDoc(ref, {
      track: track.name,
      role: userRole,
      checklist: checkedTasks,
      images: track.images || {},
      updatedAt: serverTimestamp()
    });
    alert('Checklist progress saved!');
  };

  const handleAddShoppingItem = async () => {
    if (!shoppingItem || !shoppingQty) return alert("Please fill in both fields.");
    const listRef = collection(db, 'tracks', trackId, 'shoppingList');
    await setDoc(doc(listRef), {
      name: shoppingItem,
      quantity: shoppingQty,
      status: 'requested',
      addedAt: serverTimestamp(),
    });
    setShoppingItem('');
    setShoppingQty('');
    alert("Item added to shopping list!");
  };

  const handleDeleteItem = async (id) => {
    const ref = doc(db, 'tracks', trackId, 'shoppingList', id);
    await deleteDoc(ref);
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const handleEditItem = async (id, newName, newQty) => {
    if (!newName || !newQty) return alert('Name and quantity required');
    const ref = doc(db, 'tracks', trackId, 'shoppingList', id);
    await setDoc(ref, {
      name: newName,
      quantity: newQty,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const handleUploadImage = async (itemId, file) => {
    const storage = getStorage();
    const storageRef = ref(storage, `shoppingList/${trackId}/${itemId}.jpg`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const docRef = doc(db, 'tracks', trackId, 'shoppingList', itemId);
    await setDoc(docRef, { imageUrl: url }, { merge: true });
  };

  const handleTaskImageUpload = async (taskIndex, file) => {
    const storage = getStorage();
    const storageRef = ref(storage, `checklists/${userId}/${trackId}/task_${taskIndex}.jpg`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const userChecklistRef = doc(db, 'users', userId, 'checklists', trackId);
    const snap = await getDoc(userChecklistRef);
    const existing = snap.exists() ? snap.data() : {};

    const updatedImages = {
      ...(existing.images || {}),
      [taskIndex]: url
    };

    await setDoc(userChecklistRef, {
      ...existing,
      images: updatedImages,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setTrack(prev => ({
      ...prev,
      images: updatedImages
    }));
  };

  if (!track) return <p style={{ color: '#fff', padding: 20 }}>Loading track...</p>;

  return (
    <div style={{ padding: 20, color: '#fff' }}>
      <h2>{track.name}</h2>

      <h3 style={{ marginTop: 30 }}>Checklist for {userRole}</h3>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {checklist.map((task, i) => (
          <li key={i}>
            <label>
              <input
                type="checkbox"
                checked={checkedTasks[i] || false}
                onChange={() => {
                  const updated = [...checkedTasks];
                  updated[i] = !updated[i];
                  setCheckedTasks(updated);
                }}
              />{' '}
              {task.name || task}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleTaskImageUpload(i, file);
              }}
              style={{ marginLeft: 10 }}
            />
            {track.images?.[i] && (
              <div style={{ marginTop: 6 }}>
                <img src={track.images[i]} alt="task" style={{ width: 100, borderRadius: 6 }} />
              </div>
            )}
          </li>
        ))}
      </ul>

      <button onClick={handleSave} style={{ marginTop: 20, padding: 10, backgroundColor: '#00c853', color: '#fff', border: 'none', borderRadius: 4 }}>
        Save Progress
      </button>

      <h3 style={{ marginTop: 40 }}>🛒 Shopping List</h3>
      <input
        type="text"
        placeholder="Item name"
        value={shoppingItem}
        onChange={(e) => setShoppingItem(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <input
        type="text"
        placeholder="Qty"
        value={shoppingQty}
        onChange={(e) => setShoppingQty(e.target.value)}
        style={{ marginRight: 8, width: 60 }}
      />
      <button onClick={handleAddShoppingItem} style={{ backgroundColor: '#2962ff', color: '#fff', padding: 8, borderRadius: 4 }}>
        Add Item
      </button>

      <ul style={{ marginTop: 20 }}>
        {shoppingList.map((item) => (
          <li key={item.id} style={{ marginBottom: 12 }}>
            <strong>{item.name}</strong> – Qty: {item.quantity}
            {item.imageUrl && (
              <div>
                <img src={item.imageUrl} alt="item" style={{ width: 100, borderRadius: 4, marginTop: 6 }} />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleUploadImage(item.id, file);
              }}
              style={{ marginTop: 6 }}
            />
            <button onClick={() => {
              const newName = prompt('New name:', item.name);
              const newQty = prompt('New quantity:', item.quantity);
              if (newName && newQty) handleEditItem(item.id, newName, newQty);
            }} style={{ marginLeft: 10, fontSize: 12 }}>
              Edit
            </button>
            <button onClick={() => handleDeleteItem(item.id)} style={{ marginLeft: 6, fontSize: 12, color: 'red' }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrackPage;
