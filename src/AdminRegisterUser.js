// src/AdminRegisterUser.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const roles = ['owner', 'manager', 'marshall', 'mechanic', 'cleaner'];
const tracks = [
  'SyringaPark',
  'Midlands',
  'Pavilion',
  'Eastgate',
  'Clearwater',
  'Parkview',
  'Gateway',
  'MallOfTheSouth',
  'Rosebank'
];

const AdminRegisterUser = () => {
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
    <div style={{ padding: 40, color: '#fff' }}>
      <h2>🛠 Register New User (Admin Only)</h2>
      <form onSubmit={handleRegister}>
        <input
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{ marginBottom: 10, display: 'block' }}
        />
        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          type="email"
          style={{ marginBottom: 10, display: 'block' }}
        />
        <input
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          type="password"
          style={{ marginBottom: 10, display: 'block' }}
        />

        <label>Role:</label>
        <select name="role" value={formData.role} onChange={handleChange} style={{ marginBottom: 10, display: 'block' }}>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <label>Assigned Track:</label>
        <select name="assignedTrack" value={formData.assignedTrack} onChange={handleChange} style={{ marginBottom: 10, display: 'block' }}>
          {tracks.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <label>
          <input
            type="checkbox"
            name="isAdmin"
            checked={formData.isAdmin}
            onChange={handleChange}
          />
          Admin Access?
        </label>

        <br /><br />
        <button type="submit">Register User</button>
      </form>
      <p>{status}</p>
    </div>
  );
};

export default AdminRegisterUser;
