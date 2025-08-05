import '../theme.css';
// src/components/AddEmployeeForm.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const roles = ['owner', 'manager', 'marshall', 'mechanic', 'cleaner'];
const tracks = [
  'SyringaPark', 'Midlands', 'Pavilion', 'Eastgate', 'Clearwater',
  'Parkview', 'Gateway', 'MallOfTheSouth', 'Rosebank'
];

const AddEmployeeForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'marshall',
    assignedTrack: 'SyringaPark',
    isAdmin: false,
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus('Registering...');
    try {
      const auth = getAuth();
      const userCred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const uid = userCred.user.uid;
      await setDoc(doc(db, 'users', uid), {
        name: formData.name,
        role: formData.role,
        assignedTrack: formData.assignedTrack,
        isAdmin: formData.isAdmin,
      });

      setStatus('✅ User successfully registered!');
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'marshall',
        assignedTrack: 'SyringaPark',
        isAdmin: false,
      });
    } catch (err) {
      console.error(err);
      setStatus('❌ Error: ' + err.message);
    }
  };

  return (
  <div className="page">
    <div className="glass-card">
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 30,
        marginTop: 40,
        boxShadow: '0 0 20px rgba(0,0,0,0.3)',
      }}
    >
      <h3>👤 Add New Employee</h3>
      <form onSubmit={handleRegister}>
        <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={inputStyle} />
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required type="email" style={inputStyle} />
        <input name="password" placeholder="Password" value={formData.password} onChange={handleChange} required type="password" style={inputStyle} />

        <select name="role" value={formData.role} onChange={handleChange} style={inputStyle}>
          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <select name="assignedTrack" value={formData.assignedTrack} onChange={handleChange} style={inputStyle}>
          {tracks.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <label style={{ color: '#fff', marginBottom: 10 }}>
          <input type="checkbox" name="isAdmin" checked={formData.isAdmin} onChange={handleChange} style={{ marginRight: 8 }} />
          Admin Access?
        </label>

        <br /><br />
        <button type="submit" style={buttonStyle}>➕ Register</button>
      </form>
      <p style={{ marginTop: 20 }}>{status}</p>
    </div>
  
    </div>
  </div>
);
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '10px',
  marginBottom: '15px',
  backgroundColor: '#111',
  border: '1px solid #444',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#00ff88',
  color: '#000',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

export default AddEmployeeForm;
