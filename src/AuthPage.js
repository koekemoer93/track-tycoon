// src/AuthPage.js
import './theme.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const roleOTPs = {
  owner: '1111',
  manager: '2222',
  'assistant manager': '3333',
  marshall: '4444',
  'workshop manager': '5555',

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

const buttonStyle = {
  ...inputStyle,
  backgroundColor: '#30d158',
  color: '#000',
  fontWeight: 'bold',
  cursor: 'pointer'
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
        const isAdmin = role === 'owner' || role === 'manager';

        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          role,
          assignedTrack: null,
          isAdmin,
        });

        navigate('/dashboard');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>
          {isRegister ? 'Register' : 'Login'}
        </h2>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
              />
              <select
  value={role}
  onChange={(e) => setRole(e.target.value)}
  style={inputStyle}
>
  <option value="owner">Owner</option>
  <option value="manager">Manager</option>
  <option value="assistant manager">Assistant Manager</option>
  <option value="workshop manager">Workshop Manager</option>
  <option value="marshal">Marshal</option>
  <option value="mechanic">Mechanic</option>
 
  
</select>

              <input
                type="text"
                placeholder="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                style={inputStyle}
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            {isRegister ? 'Register' : 'Login'}
          </button>

          {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}

          <p style={{ marginTop: 15, textAlign: 'center', fontSize: '0.95rem' }}>
            {isRegister ? 'Already have an account?' : 'Don’t have an account?'}{' '}
            <span
              style={{
                textDecoration: 'underline',
                cursor: 'pointer',
                color: '#30d158',
              }}
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Login' : 'Register'}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
