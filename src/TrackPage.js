// src/TrackPage.js
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  deleteDoc // required for deleting items
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './firebase';

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
        } else {
          setCheckedTasks(tasks.map(() => false));
        }
      }
    };

    fetchChecklist();
  }, [track]);

  useEffect(() => {
    const fetchShoppingList = async () => {
      if (!trackId) return;

      const q = collection(db, 'tracks', trackId, 'shoppingList');
      const snapshot = await getDocs(q);

      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setShoppingList(items);
    };

    fetchShoppingList();
  }, [trackId]);

  const handleSave = async () => {
    const ref = doc(db, 'users', userId, 'checklists', trackId);
    await setDoc(ref, {
      track: track.name,
      role: userRole,
      checklist: checkedTasks,
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

    const q = collection(db, 'tracks', trackId, 'shoppingList');
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setShoppingList(items);
  };

  if (!track) return <p style={{ color: '#fff', padding: 20 }}>Loading track...</p>;

  return (
    <div style={{ padding: 20, color: '#fff' }}>
      <h2>{track.name}</h2>
      <p><strong>Total Tasks:</strong> {track.totalTasks}</p>
      <p><strong>Completed:</strong> {track.completedTasks}</p>
      <p><strong>Progress:</strong> {Math.round((track.completedTasks / track.totalTasks) * 100)}%</p>

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
              />
              {' '}
              {task}
            </label>
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

      {/* --- SHOPPING LIST --- */}
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
