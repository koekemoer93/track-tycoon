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

const TrackPage = () => {
  const { trackId } = useParams();
  const [track, setTrack] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [checkedTasks, setCheckedTasks] = useState([]);
  const [shoppingItem, setShoppingItem] = useState('');
  const [shoppingQty, setShoppingQty] = useState('');
  const [shoppingList, setShoppingList] = useState([]);

  const userRole = 'Marshal'; // TODO: replace with real role later
  const userId = 'demo-user'; // TODO: replace with real auth later

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

      {/* ✅ Progress per role */}
      {['Marshal', 'Manager', 'Mechanic', 'Cleaner'].map((role) => {
        const roleTasks = checklist.filter(task => task.role === role);
        const completed = roleTasks.filter((_, i) => checkedTasks[i]).length;
        const total = roleTasks.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
          <div key={role} style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
            <div style={{ width: 50, height: 50, marginRight: 16 }}>
              <CircularProgressbar
                value={percentage}
                text={`${percentage}%`}
                styles={buildStyles({
                  textSize: '28px',
                  pathColor: '#00FF7F',
                  textColor: '#FFFFFF',
                  trailColor: '#333',
                  backgroundColor: '#000',
                })}
              />
            </div>
            <div style={{ color: '#FFF', fontSize: 16 }}>{role}</div>
          </div>
        );
      })}

      {/* ✅ Checklist */}
      <h3 style={{ marginTop: 30 }}>Checklist for {userRole}</h3>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {checklist.map((task, i) => (
          <li key={i}>
            <div style={{ marginBottom: 16 }}>
              <label>
                <input
                  type="checkbox"
                  checked={checkedTasks[i] || false}
                  onChange={() => {
                    const updated = [...checkedTasks];
                    updated[i] = !updated[i];
                    setCheckedTasks(updated);
                  }}
                />
                {' '}
                {task.name || task}
              </label>

              {/* Image Preview */}
              {track?.images?.[i] && (
                <div style={{ marginTop: 6 }}>
                  <img src={track.images[i]} alt="task" style={{ width: 100, borderRadius: 6 }} />
                </div>
              )}

              {/* Upload Input */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleTaskImageUpload(i, file);
                }}
                style={{ marginTop: 6 }}
              />
            </div>
          </li>
        ))}
      </ul>

      <button
        style={{
          marginTop: 20,
          padding: '10px 20px',
          backgroundColor: '#00c853',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer'
        }}
        onClick={handleSave}
      >
        Save Progress
      </button>

      {/* ✅ Shopping List */}
      <h3 style={{ marginTop: 40 }}>🛒 Weekly Shopping List</h3>
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Item name"
          value={shoppingItem}
          onChange={(e) => setShoppingItem(e.target.value)}
          style={{
            padding: '8px',
            marginRight: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <input
          type="text"
          placeholder="Qty"
          value={shoppingQty}
          onChange={(e) => setShoppingQty(e.target.value)}
          style={{
            padding: '8px',
            marginRight: '10px',
            width: '60px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <button
          onClick={handleAddShoppingItem}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2962ff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Item
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {shoppingList.map((item) => (
          <li key={item.id} style={{ marginBottom: 12 }}>
            <strong>{item.name}</strong> – Qty: {item.quantity}

            {/* Shopping Item Image */}
            {item.imageUrl && (
              <div style={{ marginTop: 8 }}>
                <img src={item.imageUrl} alt="uploaded" style={{ width: 100, borderRadius: 6 }} />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleUploadImage(item.id, file);
              }}
              style={{ marginTop: 8 }}
            />

            <button
              onClick={() => {
                const newName = prompt('Edit item name', item.name);
                const newQty = prompt('Edit quantity', item.quantity);
                if (newName && newQty) handleEditItem(item.id, newName, newQty);
              }}
              style={{
                marginLeft: 10,
                padding: '4px 8px',
                fontSize: 12,
                backgroundColor: '#ffa000',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteItem(item.id)}
              style={{
                marginLeft: 6,
                padding: '4px 8px',
                fontSize: 12,
                backgroundColor: '#d32f2f',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrackPage;
