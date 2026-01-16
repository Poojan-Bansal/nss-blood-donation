import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

export default function MyDonations({ token }) {
  const [list, setList] = useState([]);

  async function load() {
    try {
      const r = await apiRequest('/api/donation/me', 'GET', null, token);
      setList(Array.isArray(r) ? r : []);
    } catch (e) { setList([]); }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [token]);

  return (
    <div>
      <table className="table">
        <thead><tr><th>Amount</th><th>Status</th><th>Initiated</th><th>Completed/Failed</th></tr></thead>
        <tbody>
          {list.length === 0 && <tr><td colSpan="4">No donations yet</td></tr>}
          {list.map(d => (
            <tr key={d._id}>
              <td>₹{d.amount}</td>
              <td><span className={`pill ${d.status}`}>{d.status}</span></td>
              <td>{d.timestamps?.initiatedAt ? new Date(d.timestamps.initiatedAt).toLocaleString() : '-'}</td>
              <td>{d.status==='success' ? (d.timestamps?.completedAt ? new Date(d.timestamps.completedAt).toLocaleString() : '-') : (d.status==='failed' ? (d.timestamps?.failedAt ? new Date(d.timestamps.failedAt).toLocaleString() : '-') : '-')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
