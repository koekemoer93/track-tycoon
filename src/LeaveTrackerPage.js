import './theme.css';
// src/LeaveTrackerPage.js
import React, { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebase';
import { format } from 'date-fns';

/**
 * LeaveTrackerPage provides owners and managers with a bird's eye view of all
 * leave requests across tracks. Each entry shows the employee, the track,
 * the date range, the reason and its current status. Pending requests
 * include action buttons allowing the admin to approve or deny the request,
 * which updates the corresponding document in Firestore.  The page uses
 * the same glassy card motif as the rest of the app.
 */
const LeaveTrackerPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'leaveRequests'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userName: data.userName,
          track: data.track,
          fromDate: data.fromDate?.toDate(),
          toDate: data.toDate?.toDate(),
          reason: data.reason,
          status: data.status,
        };
      });
      setRequests(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'leaveRequests', id), { status: newStatus });
    } catch (err) {
      console.error('Failed to update leave status', err);
    }
  };

  return (
  <div className="page">
    <div className="glass-card">
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a)',
        padding: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        color: '#fff',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 900,
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
        }}
      >
        <h2>📋 Leave Tracker</h2>
        {loading ? (
          <p>Loading leave requests…</p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: 16,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px',
                    borderBottom: '1px solid #444',
                  }}
                >
                  Employee
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px',
                    borderBottom: '1px solid #444',
                  }}
                >
                  Track
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px',
                    borderBottom: '1px solid #444',
                  }}
                >
                  From
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px',
                    borderBottom: '1px solid #444',
                  }}
                >
                  To
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px',
                    borderBottom: '1px solid #444',
                  }}
                >
                  Reason
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px',
                    borderBottom: '1px solid #444',
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px',
                    borderBottom: '1px solid #444',
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '6px 8px' }}>{req.userName}</td>
                  <td style={{ padding: '6px 8px' }}>{req.track}</td>
                  <td style={{ padding: '6px 8px' }}>
                    {req.fromDate ? format(req.fromDate, 'yyyy-MM-dd') : ''}
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    {req.toDate ? format(req.toDate, 'yyyy-MM-dd') : ''}
                  </td>
                  <td style={{ padding: '6px 8px' }}>{req.reason}</td>
                  <td style={{ padding: '6px 8px', textTransform: 'capitalize' }}>
                    {req.status}
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    {req.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => updateStatus(req.id, 'approved')}
                          style={{
                            background: 'green',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: 8,
                            marginRight: 6,
                            cursor: 'pointer',
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(req.id, 'denied')}
                          style={{
                            background: 'red',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: 8,
                            cursor: 'pointer',
                          }}
                        >
                          Deny
                        </button>
                      </>
                    ) : (
                      <span style={{ opacity: 0.6 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  
    </div>
  </div>
);
};

export default LeaveTrackerPage;