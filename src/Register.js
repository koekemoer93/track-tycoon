import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import app from './firebase-config';
import './LoginRegister.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const auth = getAuth(app);
  const db = getFirestore(app);

  const validCodes = {
    owner: 'OWNER123',
    manager: 'MANAGER456',
    mechanic: 'MECHANIC789',
    marshall: 'MARSHALL101',
    staff: 'STAFF202',
    hr: 'HR303'
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (code !== validCodes[role]) {
      setMessage('Invalid code for the selected role. Please check your code and try again.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role
      });

      setMessage(`Registration successful! Your role is ${role}.`);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register for PitPro</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          required
        >
          <option value="owner">Owner</option>
          <option value="manager">Manager</option>
          <option value="mechanic">Mechanic</option>
          <option value="marshall">Marshall</option>
          <option value="staff">Staff</option>
          <option value="hr">HR</option>
        </select>

        <input
          type="text"
          placeholder="Enter code for your role"
          value={code}
          onChange={e => setCode(e.target.value)}
          required
        />

        <button type="submit">Register</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
