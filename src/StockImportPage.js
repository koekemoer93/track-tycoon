import './theme.css';
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
    if (!csvData.length) return alert("No CSV data loaded.");
    setUploading(true);

    const failedRows = [];

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const name = row["name"] || row["Name"] || '';
      const qty = parseInt(row["quantity"] || row["qty"] || row["Quantity"] || 0);
      const unit = row["unit"] || row["Unit"] || 'units';
      const category = row["category"] || row["Category"] || 'uncategorized';

      if (!name || isNaN(qty)) {
        failedRows.push(i + 2); // +2 to account for header and 0-index
        continue;
      }

      const id = name.toLowerCase().replace(/\s+/g, '-');
      try {
        await setDoc(doc(db, 'stockRoom', id), {
          name,
          quantity: qty,
          unit,
          category: category.toLowerCase(),
          trackStock: {}
        });
      } catch (err) {
        console.error(`Error importing row ${i + 2}:`, err);
        failedRows.push(i + 2);
      }
    }

    setUploading(false);
    if (failedRows.length > 0) {
      alert(`Some rows failed to import: ${failedRows.join(', ')}`);
    } else {
      alert("✅ All stock items imported successfully!");
    }
  };

  return (
  <div className="page">
    <div className="glass-card">
    <div style={{ padding: 20, color: '#fff' }}>
      <h2>Import Stock CSV</h2>
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
  
    </div>
  </div>
);
};

export default StockImportPage;
