import { onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  increment,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

const getCategoryIcon = (category) => {
  switch (category) {
    case 'drinks': return '🥤';
    case 'spares': return '🛠️';
    case 'cleaning': return '🧽';
    default: return '📦';
  }
};


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
      <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 20 }}>📦 Stock Control</h2>
          {/* 🧩 Horizontal Catalog Scroll */}
<div
  style={{
    display: 'flex',
    overflowX: 'auto',
    paddingBottom: 10,
    marginBottom: 30,
    borderBottom: '1px solid #333'
  }}
>
  {stockItems.slice(0, 10).map((item) => (
    <div
      key={item.id}
      style={{
        minWidth: 140,
        background: '#2c2c2e',
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        color: '#fff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        flexShrink: 0
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 6 }}>
        {getCategoryIcon(item.category)}
      </div>
      <div style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</div>
      <div style={{ fontSize: 14, color: '#aaa' }}>
        {item.quantity} units
      </div>
    </div>
  ))}
</div>
      {/* Add New Stock Section */}
      <div style={{
        background: '#1c1c1e',
        padding: 20,
        borderRadius: 14,
        marginBottom: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
      }}>
        <h3 style={{ marginBottom: 10 }}>➕ Add New Stock</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <input placeholder="Item name" value={newItemName} onChange={e => setNewItemName(e.target.value)} style={{ padding: 10, flex: 1 }} />
          <input placeholder="Qty" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} type="number" style={{ padding: 10, width: 100 }} />
          <select value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} style={{ padding: 10 }}>
            <option value="drinks">Drinks</option>
            <option value="spares">Spares</option>
            <option value="cleaning">Cleaning</option>
            <option value="uncategorized">Uncategorized</option>
          </select>
          <button onClick={handleAddItem} style={{ padding: '10px 20px', background: '#34c759', color: '#fff', border: 'none', borderRadius: 8 }}>Add</button>
        </div>
      </div>

      {/* Filter Section */}
      <div style={{ marginBottom: 20 }}>
        <label>Filter by category: </label>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ padding: 8 }}>
          {uniqueCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Stock Items */}
      {filteredItems.map(item => (
        <div key={item.id} style={{
          background: '#1c1c1e',
          padding: 15,
          borderRadius: 12,
          marginBottom: 12,
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}>
          <strong>{item.name}</strong> — {item.quantity} units ({item.category})
          <div style={{ fontSize: 12, marginTop: 6, color: '#ccc' }}>Track stock:</div>
          {tracks.map(trackId => (
            <div key={trackId} style={{ marginLeft: 10 }}>
              {trackId}: {item.trackStock?.[trackId] || 0}
              <button
                onClick={() => handleTransfer(item.id, trackId)}
                style={{ marginLeft: 8, fontSize: 12, padding: '2px 8px', borderRadius: 6, border: 'none', background: '#0a84ff', color: '#fff' }}
              >
                Transfer
              </button>
            </div>
          ))}
        </div>
      ))}

      {/* Shopping Requests */}
      <hr style={{ margin: '40px 0', borderColor: '#444' }} />
      <h3 style={{ marginBottom: 12 }}>🛒 Pending Requests</h3>
      {shoppingRequests.length === 0 && <p>No pending requests.</p>}
      {shoppingRequests.map(item => (
        <div key={item.id} style={{
          background: '#2c2c2e',
          padding: 15,
          borderRadius: 10,
          marginBottom: 10
        }}>
          <strong>{item.name}</strong> — Qty: {item.quantity}
          <div style={{ fontSize: 13, color: '#aaa' }}>Track: {item.trackId}</div>
          <button
            onClick={() => fulfillRequest(item)}
            style={{ marginTop: 8, padding: '6px 16px', background: '#30d158', color: '#000', border: 'none', borderRadius: 8 }}
          >
            ✅ Fulfill
          </button>
        </div>
      ))}
    </div>
  );
};

export default StockRoomPage;
