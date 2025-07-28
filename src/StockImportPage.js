// src/StockImportPage.js
import React, { useState } from 'react';
import Papa from 'papaparse';
import { setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const StockImportPage = () => {
  const [csvData, setCsvData] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
      }
    });
  };

  const handleImport = async () => {
    setUploading(true);
    for (const item of csvData) {
      const id = item.name.toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(db, 'stockRoom', id), {
        name: item.name,
        quantity: parseInt(item.quantity || 0),
        unit: item.unit || 'units',
        trackStock: {}
      });
    }
    alert('Stock items imported!');
    setUploading(false);
  };

  return (
    <div style={{ padding: 20, color: '#fff' }}>
      <h2>📥 Import Stock CSV</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {csvData.length > 0 && (
        <>
          <p>{csvData.length} items ready to import.</p>
          <button onClick={handleImport} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Import to Stock Room'}
          </button>
        </>
      )}
    </div>
  );
};

export default StockImportPage;
