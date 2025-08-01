// src/UploadPage.js
import React from 'react';
import { uploadTemplatesToFirestore } from './tools/uploadTemplates';

const UploadPage = () => {
  const handleUpload = async () => {
    await uploadTemplatesToFirestore();
    alert('✅ Templates uploaded to Firestore!');
  };

  return (
    <div style={{ padding: 40, color: '#fff' }}>
      <h2>🔥 Upload Templates to Firestore</h2>
      <button onClick={handleUpload}>Upload Now</button>
    </div>
  );
};

export default UploadPage;
