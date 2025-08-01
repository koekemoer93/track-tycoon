import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

const UserAdminPage = () => {
  const [users, setUsers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const userDoc = await getDocs(collection(db, 'users'));
      const current = userDoc.docs.find((u) => u.id === user.uid);
      const role = current?.data()?.role;
      setCurrentUserRole(role);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    await updateDoc(doc(db, 'users', userId), { role: newRole });
    setUsers(prev => prev.map(user => user.id === userId ? { ...user, role: newRole } : user));
  };

  const handleTrackChange = async (userId, newTrack) => {
    await updateDoc(doc(db, 'users', userId), { assignedTrack: newTrack });
    setUsers(prev => prev.map(user => user.id === userId ? { ...user, assignedTrack: newTrack } : user));
  };

  if (loading) return <p style={{ color: '#fff', padding: 20 }}>Loading...</p>;
  if (currentUserRole !== 'owner' && currentUserRole !== 'admin') {
    return <p style={{ color: '#fff', padding: 20 }}>🚫 Access denied</p>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: 40,
      fontFamily: 'Helvetica, sans-serif',
      color: '#fff'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 900,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 30,
        boxShadow: '0 0 20px rgba(0,0,0,0.3)'
      }}>
        <h2>👥 User Admin Panel</h2>

        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: 20,
        }}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Assigned Track</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={tdStyle}>{user.name}</td>
                <td style={tdStyle}>{user.email}</td>
                <td style={tdStyle}>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    style={selectStyle}
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="marshal">Marshal</option>
                    <option value="mechanic">Mechanic</option>
                    <option value="hr">HR</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    value={user.assignedTrack || ''}
                    onChange={(e) => handleTrackChange(user.id, e.target.value)}
                    style={inputStyle}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle = {
  borderBottom: '1px solid #555',
  padding: '12px 10px',
  textAlign: 'left',
  fontSize: 14,
  fontWeight: 'bold'
};

const tdStyle = {
  borderBottom: '1px solid #333',
  padding: '12px 10px',
  fontSize: 14,
};

const inputStyle = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid #444',
  backgroundColor: '#2a2a2a',
  color: '#fff',
  width: '100%'
};

const selectStyle = {
  ...inputStyle,
  appearance: 'none'
};

export default UserAdminPage;
