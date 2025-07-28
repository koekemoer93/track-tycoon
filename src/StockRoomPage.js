// src/StockRoomPage.js
import { getAuth } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  increment,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

const tracks = [
  'indykart-eastgate',
  'indykart-mallofthesouth',
  'indykart-clearwater',
  'epic-syringa',
  'epic-midlands'
];

const StockRoomPage = () => {
  const [stockItems, setStockItems] = useState([]);
  const [shoppingRequests, setShoppingRequests] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      const snap = await getDocs(collection(db, 'stockRoom'));
      const items = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStockItems(items);
    };

    const fetchRequests = async () => {
      let allRequests = [];

      for (const trackId of tracks) {
        const snapshot = await getDocs(collection(db, 'tracks', trackId, 'shoppingList'));
        const pending = snapshot.docs
          .map(doc => ({ ...doc.data(), id: doc.id, trackId }))
          .filter(item => item.status === 'requested');
        allRequests.push(...pending);
      }

      setShoppingRequests(allRequests);
    };

    const fetchUserRole = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return setLoading(false);

      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      setUserRole(data.role || 'employee');
      setLoading(false);
    };

    fetchStock();
    fetchRequests();
    fetchUserRole();
  }, []);

  const handleAddItem = async () => {
    if (!newItemName || !newItemQty) return alert('Enter name and quantity');
    const ref = doc(collection(db, 'stockRoom'));
    await setDoc(ref, {
      name: newItemName,
      quantity: parseInt(newItemQty),
      unit: 'units',
      trackStock: {}
    });
    setNewItemName('');
    setNewItemQty('');
    window.location.reload(); // quick reload for now
  };

  const handleTransfer = async (itemId, trackId) => {
    const amount = prompt(`How many units to send to ${trackId}?`);
    if (!amount || isNaN(amount)) return;

    const ref = doc(db, 'stockRoom', itemId);
    await updateDoc(ref, {
      quantity: increment(-parseInt(amount)),
      [`trackStock.${trackId}`]: increment(parseInt(amount))
    });

    window.location.reload();
  };

  const fulfillRequest = async (item) => {
    const itemId = item.name.toLowerCase().replace(/\s/g, '-'); // temporary itemId based on name
    const stockRef = doc(db, 'stockRoom', itemId);
    const shoppingRef = doc(db, 'tracks', item.trackId, 'shoppingList', item.id);

    await updateDoc(stockRef, {
      quantity: increment(-parseInt(item.quantity)),
      [`trackStock.${item.trackId}`]: increment(parseInt(item.quantity))
    });

    await updateDoc(shoppingRef, {
      status: 'fulfilled',
      fulfilledAt: new Date()
    });

    alert(`Fulfilled ${item.name} for ${item.trackId}`);
    window.location.reload();
  };

  // 🔒 Protect non-owner/admin
  if (loading) return <p style={{ color: '#fff', padding: 20 }}>Loading...</p>;
  if (userRole !== 'owner' && userRole !== 'admin') {
    return <p style={{ color: '#fff', padding: 20 }}>🚫 Access denied</p>;
  }

  return (
    <div style={{ padding: 20, color: '#fff' }}>
      <h2>📦 Stock Control Room</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Item name"
          value={newItemName}
          onChange={e => setNewItemName(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        />
        <input
          type="number"
          placeholder="Qty"
          value={newItemQty}
          onChange={e => setNewItemQty(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        />
        <button onClick={handleAddItem}>Add to Stock Room</button>
      </div>

      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {stockItems.map((item) => (
          <li key={item.id} style={{ marginBottom: 20 }}>
            <strong>{item.name}</strong> — {item.quantity} in stock
            <div style={{ marginTop: 8 }}>
              <div><em>Track Inventory:</em></div>
              {tracks.map(trackId => (
                <div key={trackId} style={{ marginLeft: 10 }}>
                  {trackId}: {item.trackStock?.[trackId] || 0}
                  <button
                    style={{ marginLeft: 8 }}
                    onClick={() => handleTransfer(item.id, trackId)}
                  >
                    ➡ Transfer
                  </button>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <hr style={{ margin: '40px 0' }} />
      <h3>🛒 Pending Shopping Requests</h3>

      {shoppingRequests.length === 0 && <p>No pending requests.</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {shoppingRequests.map((item) => (
          <li key={item.id} style={{ marginBottom: 16 }}>
            <strong>{item.name}</strong> – Qty: {item.quantity}
            <div style={{ fontSize: 14, marginTop: 4, color: '#ccc' }}>
              Track: {item.trackId}
            </div>
            <button
              style={{ marginTop: 6 }}
              onClick={() => fulfillRequest(item)}
            >
              ✅ Fulfill
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StockRoomPage;
