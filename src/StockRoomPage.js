// src/StockRoomPage.js
import { onSnapshot } from 'firebase/firestore';
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
  const [newItemCategory, setNewItemCategory] = useState('uncategorized');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribes = [];

    const stockRef = collection(db, 'stockRoom');
    const unsubscribeStock = onSnapshot(stockRef, (snapshot) => {
      const updated = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStockItems(updated);
    });
    unsubscribes.push(unsubscribeStock);

    const requestListeners = tracks.map((trackId) => {
      const requestRef = collection(db, 'tracks', trackId, 'shoppingList');
      return onSnapshot(requestRef, (snapshot) => {
        let pending = snapshot.docs
          .map(doc => ({ ...doc.data(), id: doc.id, trackId }))
          .filter(item => item.status === 'requested');
        setShoppingRequests(prev => {
          const allOther = prev.filter(i => i.trackId !== trackId);
          return [...allOther, ...pending];
        });
      });
    });

    unsubscribes.push(...requestListeners);

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

    fetchUserRole();

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  const handleAddItem = async () => {
    if (!newItemName || !newItemQty) return alert('Enter name and quantity');
    const ref = doc(collection(db, 'stockRoom'));
    await setDoc(ref, {
      name: newItemName,
      quantity: parseInt(newItemQty),
      category: newItemCategory,
      unit: 'units',
      trackStock: {}
    });
    setNewItemName('');
    setNewItemQty('');
    setNewItemCategory('uncategorized');
  };

  const handleTransfer = async (itemId, trackId) => {
    const amount = prompt(`How many units to send to ${trackId}?`);
    if (!amount || isNaN(amount)) return;

    const ref = doc(db, 'stockRoom', itemId);
    await updateDoc(ref, {
      quantity: increment(-parseInt(amount)),
      [`trackStock.${trackId}`]: increment(parseInt(amount))
    });
  };

  const fulfillRequest = async (item) => {
    const itemId = item.name.toLowerCase().replace(/\s/g, '-');
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
  };

  if (loading) return <p style={{ color: '#fff', padding: 20 }}>Loading...</p>;
  if (userRole !== 'owner' && userRole !== 'admin') {
    return <p style={{ color: '#fff', padding: 20 }}>🚫 Access denied</p>;
  }

  const filteredItems =
    selectedCategory === 'All'
      ? stockItems
      : stockItems.filter((item) => item.category === selectedCategory);

  const uniqueCategories = [
    'All',
    ...new Set(stockItems.map(item => item.category || 'uncategorized')),
  ];

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
        <select
          value={newItemCategory}
          onChange={(e) => setNewItemCategory(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        >
          <option value="drinks">Drinks</option>
          <option value="spares">Spares</option>
          <option value="cleaning">Cleaning</option>
          <option value="uncategorized">Uncategorized</option>
        </select>
        <button onClick={handleAddItem}>Add to Stock Room</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 10 }}>Filter by Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: 8 }}
        >
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {filteredItems.map((item) => (
          <li key={item.id} style={{ marginBottom: 20 }}>
            <strong>{item.name}</strong> — {item.quantity} in stock ({item.category})
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
