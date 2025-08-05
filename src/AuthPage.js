import './theme.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const roleOTPs = {
  owner: '1234',
  manager: '5678',
  marshal: '1111',
  mechanic: '2222',
  hr: '3333',
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

        navigate(isAdmin ? '/track-dashboard' : '/employee-dashboard');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        navigate(userData?.isAdmin || userData?.role === 'owner' ? '/track-dashboard' : '/employee-dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page" style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 30,
        width: '100%',
        maxWidth: 420,
        color: '#fff',
        boxShadow: '0 0 20px rgba(0,0,0,0.3)'
      }}>
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
                <option value="marshal">Marshal</option>
                <option value="mechanic">Mechanic</option>
                <option value="hr">HR</option>
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
