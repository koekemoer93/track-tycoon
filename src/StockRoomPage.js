import './theme.css';
// src/StockRoomPage.js
import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDocs,
  increment,
  serverTimestamp,
  addDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './StockRoomPage.css';

const StockRoomPage = () => {
  const [stockItems, setStockItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newCat, setNewCat] = useState('uncategorized');
  const [tracks, setTracks] = useState([]);
  const [transferItem, setTransferItem] = useState('');
  const [transferTrack, setTransferTrack] = useState('');
  const [transferQty, setTransferQty] = useState('');
  const [shoppingRequests, setShoppingRequests] = useState([]);
  const [transferLogs, setTransferLogs] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'stockRoom'), snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStockItems(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchTracks = async () => {
      const querySnap = await getDocs(collection(db, 'tracks'));
      const data = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTracks(data);
    };
    fetchTracks();
  }, []);

  useEffect(() => {
    const q = collection(db, 'tracks');

    const unsub = onSnapshot(q, async (snapshot) => {
      const allRequests = [];

      for (const docSnap of snapshot.docs) {
        const trackId = docSnap.id;
        const listSnap = await getDocs(collection(db, 'tracks', trackId, 'shoppingList'));

        listSnap.forEach(item => {
          allRequests.push({
            id: item.id,
            trackId,
            ...item.data()
          });
        });
      }

      setShoppingRequests(allRequests);
    });

    return () => unsub();
  }, []);

  // ✅ NEW: Fetch transfer logs
  useEffect(() => {
    const q = query(collection(db, 'transfers'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransferLogs(logs);
    });
    return () => unsub();
  }, []);

  const addItem = async () => {
    if (!newItem || !newQty) return;
    const itemRef = doc(db, 'stockRoom', newItem);
    await setDoc(itemRef, {
      name: newItem,
      quantity: parseInt(newQty),
      category: newCat,
      trackStock: {}
    });
    setNewItem('');
    setNewQty('');
    setNewCat('uncategorized');
  };

  const transferStock = async () => {
    if (!transferItem || !transferTrack || !transferQty) return;
    const itemRef = doc(db, 'stockRoom', transferItem);
    await updateDoc(itemRef, {
      [`trackStock.${transferTrack}`]: increment(parseInt(transferQty))
    });
    setTransferItem('');
    setTransferTrack('');
    setTransferQty('');
  };

  const handleTransferRequest = async (item) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const userName = user?.displayName || user?.email || 'Unknown';

    const stockRef = doc(db, 'stockRoom', item.name);
    const trackRef = doc(db, 'tracks', item.trackId);

    try {
      await updateDoc(stockRef, {
        quantity: increment(-item.quantity)
      });

      await updateDoc(trackRef, {
        [`trackStock.${item.name}`]: increment(item.quantity)
      });

      const reqRef = doc(db, 'tracks', item.trackId, 'shoppingList', item.id);
      await setDoc(reqRef, {
        ...item,
        status: 'fulfilled',
        fulfilledAt: new Date()
      });

      await addDoc(collection(db, 'transfers'), {
        item: item.name,
        quantity: item.quantity,
        from: 'StockRoom',
        to: item.trackId,
        trackId: item.trackId,
        by: userName,
        timestamp: serverTimestamp(),
      });

      alert(`Transferred ${item.quantity} ${item.name} to ${item.trackId}`);
    } catch (err) {
      console.error('Transfer failed:', err);
      alert('Transfer failed');
    }
  };

  const categoryColors = {
    drinks: '#00c6ff',
    spares: '#ff4e50',
    cleaning: '#f9d423',
    uncategorized: '#bdc3c7'
  };

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Stock Room</h2>

      <div className="track-grid">
        {['drinks', 'spares', 'cleaning', 'uncategorized'].map(cat => {
          const catItems = stockItems.filter(i => i.category === cat);
          const totalQty = catItems.reduce((sum, item) => sum + item.quantity, 0);
          return (
            <div key={cat} className="track-card">
              <div className="track-title">{cat.toUpperCase()}</div>
              <div className="track-subtitle">{totalQty} units</div>
            </div>
          );
        })}
      </div>

      <div className="form-section">
        <div className="form-block">
          <h3>Add New Stock</h3>
          <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Item name" />
          <input value={newQty} onChange={e => setNewQty(e.target.value)} placeholder="Qty" type="number" />
          <select value={newCat} onChange={e => setNewCat(e.target.value)}>
            <option value="uncategorized">Uncategorized</option>
            <option value="drinks">Drinks</option>
            <option value="spares">Spares</option>
            <option value="cleaning">Cleaning</option>
          </select>
          <button onClick={addItem}>Add Item</button>
        </div>

        <div className="form-block">
          <h3>Transfer Stock</h3>
          <select value={transferItem} onChange={e => setTransferItem(e.target.value)}>
            <option value="">Select Item</option>
            {stockItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          <select value={transferTrack} onChange={e => setTransferTrack(e.target.value)}>
            <option value="">Select Track</option>
            {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input value={transferQty} onChange={e => setTransferQty(e.target.value)} placeholder="Qty" type="number" />
          <button onClick={transferStock}>Transfer</button>
        </div>
      </div>

      <div className="stock-list">
        <h3>All Stock Items</h3>
        <div className="stock-grid">
          {stockItems.map(item => (
            <div key={item.id} className="stock-glass-card">
              <div className="stock-title-row">
                <span className="stock-name">{item.name}</span>
                <span className="stock-qty">{item.quantity} units</span>
              </div>
              <div className="stock-bar">
                <div
                  className="stock-fill"
                  style={{ width: `${Math.min(item.quantity, 100)}%`, backgroundColor: categoryColors[item.category] || '#777' }}
                ></div>
              </div>
              <div className="stock-cat">{item.category}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="shopping-request-section">
        <h3>Pending Shopping Requests</h3>
        <div className="shopping-request-grid">
          {shoppingRequests.map(item => (
            <div key={item.id} className="stock-glass-card">
              <div className="stock-title-row">
                <span className="stock-name">{item.name}</span>
                <span className="stock-qty">{item.quantity} requested</span>
              </div>
              <div className="stock-cat">Track: {item.trackId}</div>
              <button onClick={() => handleTransferRequest(item)}>Transfer</button>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ NEW: Transfer Logs */}
      <div className="transfer-log-section">
        <h3>Transfer Logs</h3>
        <div className="transfer-log-grid">
          {transferLogs.map(log => (
            <div key={log.id} className="stock-glass-card">
              <div><strong>{log.item}</strong> → {log.to}</div>
              <div>Qty: {log.quantity}</div>
              <div>By: {log.by}</div>
              <div style={{ fontSize: '0.8em', color: '#bbb' }}>
                {log.timestamp?.toDate?.().toLocaleString() || 'Pending'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockRoomPage;
