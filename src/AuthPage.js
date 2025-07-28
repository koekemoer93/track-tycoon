// src/AuthPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const roleOTPs = {
  owner: '1234',
  manager: '5678',
  marshal: '1111',
  mechanic: '2222',
  hr: '3333',
};

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('marshal');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        if (otp !== roleOTPs[role]) {
          setError('Invalid OTP for selected role.');
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          role,
          assignedTrack: null,
        });

        if (role === 'owner') {
          navigate('/dashboard');
        } else {
          navigate('/employee-dashboard');
        }

      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        if (userData?.role === 'owner') {
          navigate('/dashboard');
        } else {
          navigate('/employee-dashboard');
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: '#1c1c1c', padding: 30, borderRadius: 20, width: 320 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>{isRegister ? 'Register' : 'Login'}</h2>

        {isRegister && (
          <>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
            <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="marshal">Marshal</option>
              <option value="mechanic">Mechanic</option>
              <option value="hr">HR</option>
            </select>
            <input type="text" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required style={inputStyle} />
          </>
        )}

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />

        <button type="submit" style={{ ...inputStyle, backgroundColor: '#4caf50', color: '#fff', fontWeight: 'bold' }}>
          {isRegister ? 'Register' : 'Login'}
        </button>

        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}

        <p style={{ marginTop: 15, textAlign: 'center' }}>
          {isRegister ? 'Already have an account?' : 'Don’t have an account?'}{' '}
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Login' : 'Register'}
          </span>
        </p>
      </form>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '8px',
  border: '1px solid #444',
  backgroundColor: '#2a2a2a',
  color: '#fff'
};

export default AuthPage;
