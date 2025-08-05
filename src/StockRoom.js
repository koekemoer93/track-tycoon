import React from 'react';
import './StockRoom.css';
import { useNavigate } from 'react-router-dom';


// 🔐 MOCK: simulate current user's role
const currentUser = {
  id: 'user123',
  name: 'Billy Greyvenstein',
  role: 'Owner', // or 'Admin', only these allowed
};

// 🧃 MOCK STOCK DATA
const mockStockItems = [
  { name: 'Coke Cans', category: 'Drinks', quantity: 12, lowStockThreshold: 10 },
  { name: 'Brake Pads', category: 'Spares', quantity: 3, lowStockThreshold: 5 },
  { name: 'Water Bottles', category: 'Drinks', quantity: 0, lowStockThreshold: 5 },
  { name: 'Helmet Visors', category: 'Spares', quantity: 8, lowStockThreshold: 3 },
];

const StockRoom = () => {
    const navigate = useNavigate();

  if (!['Owner', 'Admin'].includes(currentUser.role)) {
    return (
      <div className="stock-room">
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="stock-room">
        <button onClick={() => navigate(-1)} className="back-button">← Back</button>
      <h1>📦 Stock Control Room</h1>
      <div className="stock-grid">
        {mockStockItems.map((item, idx) => {
          const isLow = item.quantity <= item.lowStockThreshold;
          return (
            <div key={idx} className={`stock-card ${isLow ? 'low-stock' : ''}`}>
              <h2>{item.name}</h2>
              <p><strong>Category:</strong> {item.category}</p>
              <p><strong>Quantity:</strong> {item.quantity}</p>
              {isLow && <p className="warning">⚠️ Low Stock</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StockRoom;
