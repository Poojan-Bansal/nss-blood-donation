// frontend/src/components/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

function qs(params) {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') s.append(k, v);
  });
  const str = s.toString();
  return str ? `?${str}` : '';
}

export default function AdminDashboard({ token }) {
  const [registrations, setRegistrations] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);

  // filter state
  const [collegeFilter, setCollegeFilter] = useState('');
  const [regSearch, setRegSearch] = useState('');
  const [regFrom, setRegFrom] = useState('');
  const [regTo, setRegTo] = useState('');

  const [donStatus, setDonStatus] = useState('all');
  const [donSearch, setDonSearch] = useState('');
  const [donFrom, setDonFrom] = useState('');
  const [donTo, setDonTo] = useState('');

  // for college dropdown options (derived from loaded registrations)
  const [collegeOptions, setCollegeOptions] = useState([]);

  async function loadRegistrations(filters = {}) {
    try {
      const query = qs(filters);
      const regs = await apiRequest('/api/admin/registrations' + query, 'GET', null, token);
      setRegistrations(Array.isArray(regs) ? regs : []);
      // derive college list
      const colleges = Array.from(new Set((regs || []).map(r => r.college).filter(Boolean)));
      setCollegeOptions(colleges);
    } catch (err) {
      alert(err.error || 'Failed to load registrations');
    }
  }

  async function loadDonations(filters = {}) {
    try {
      const query = qs(filters);
      const dons = await apiRequest('/api/admin/donations' + query, 'GET', null, token);
      setDonations(Array.isArray(dons) ? dons : []);
    } catch (err) {
      alert(err.error || 'Failed to load donations');
    }
  }

  async function applyFilters() {
    setLoading(true);
    try {
      const regFilters = {
        college: collegeFilter,
        q: regSearch,
        from: regFrom,
        to: regTo
      };
      const donFilters = {
        status: donStatus !== 'all' ? donStatus : '',
        q: donSearch,
        from: donFrom,
        to: donTo
      };
      await Promise.all([loadRegistrations(regFilters), loadDonations(donFilters)]);
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setCollegeFilter('');
    setRegSearch('');
    setRegFrom('');
    setRegTo('');
    setDonStatus('all');
    setDonSearch('');
    setDonFrom('');
    setDonTo('');
    // reload all
    applyFilters();
  }

  useEffect(() => {
    // initial load (no filters)
    applyFilters();
    // eslint-disable-next-line
  }, []);

  const totalAmount = donations.filter(d => d.status === 'success').reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div className="dashboard-grid">
      <div className="main-panel">
        <div className="card mb-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="h2">Admin Overview</div>
              <div className="small text-muted">Filter registrations and donations below</div>
            </div>
            <div className="kpi">
              <div className="value">₹{totalAmount}</div>
              <div className="label small-muted">Total Donations</div>
            </div>
          </div>
        </div>

        {/* Filters UI */}
        <div className="card mb-8">
          <h3 className="h2">Filters</h3>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            {/* Registration filters */}
            <div style={{ minWidth: 220 }}>
              <div className="small text-muted">College</div>
              <select value={collegeFilter} onChange={e => setCollegeFilter(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10 }}>
                <option value="">All colleges</option>
                {collegeOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ minWidth: 220 }}>
              <div className="small text-muted">Reg search (name/email)</div>
              <input placeholder="Search registrations" value={regSearch} onChange={e => setRegSearch(e.target.value)} />
            </div>

            <div style={{ minWidth: 150 }}>
              <div className="small text-muted">Reg from</div>
              <input type="date" value={regFrom} onChange={e => setRegFrom(e.target.value)} />
            </div>

            <div style={{ minWidth: 150 }}>
              <div className="small text-muted">Reg to</div>
              <input type="date" value={regTo} onChange={e => setRegTo(e.target.value)} />
            </div>

            {/* Donation filters */}
            <div style={{ minWidth: 160 }}>
              <div className="small text-muted">Donation status</div>
              <select value={donStatus} onChange={e => setDonStatus(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10 }}>
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div style={{ minWidth: 220 }}>
              <div className="small text-muted">Donation search (user email)</div>
              <input placeholder="Search donations by email" value={donSearch} onChange={e => setDonSearch(e.target.value)} />
            </div>

            <div style={{ minWidth: 150 }}>
              <div className="small text-muted">Don from</div>
              <input type="date" value={donFrom} onChange={e => setDonFrom(e.target.value)} />
            </div>

            <div style={{ minWidth: 150 }}>
              <div className="small text-muted">Don to</div>
              <input type="date" value={donTo} onChange={e => setDonTo(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={applyFilters} disabled={loading}>{loading ? 'Searching...' : 'Apply Filters'}</button>
            <button className="btn btn-ghost" onClick={clearFilters} style={{ marginLeft: 12 }}>Clear Filters</button>
          </div>
        </div>

        {/* Registrations table */}
        <div className="card mb-8">
          <h3 className="h2">Registrations</h3>
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>College</th>
                <th>Phone</th>
                <th>Course</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 && <tr><td colSpan="6">No registrations</td></tr>}
              {registrations.map(r => (
                <tr key={r._id}>
                  <td>{r.fullName}</td>
                  <td>{r.userId?.email}</td>
                  <td>{r.college}</td>
                  <td>{r.phone}</td>
                  <td>{r.course}</td>
                  <td>{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : (r.createdAt ? new Date(r.createdAt).toLocaleString() : '-')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Donations table */}
        <div className="card mb-8">
          <h3 className="h2">Donations</h3>
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Initiated</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {donations.length === 0 && <tr><td colSpan="5">No donations</td></tr>}
              {donations.map(d => (
                <tr key={d._id}>
                  <td>{d.userId?.email}</td>
                  <td>₹{d.amount}</td>
                  <td><span className={`pill ${d.status}`}>{d.status}</span></td>
                  <td>{d.timestamps?.initiatedAt ? new Date(d.timestamps.initiatedAt).toLocaleString() : '-'}</td>
                  <td>{d.status === 'success' ? (d.timestamps?.completedAt ? new Date(d.timestamps.completedAt).toLocaleString() : '-') : (d.status === 'failed' ? (d.timestamps?.failedAt ? new Date(d.timestamps.failedAt).toLocaleString() : '-') : '-')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="side-panel">
        <div className="card card-compact mb-8">
          <div className="small text-muted">Quick Actions</div>
          <div className="mt-10">
            <button className="btn btn-primary" onClick={() => applyFilters()}>Refresh</button>
          </div>
        </div>

        <div className="card card-compact">
          <div className="small text-muted">Notes</div>
          <div className="small text-muted mt-8">Filters are applied server-side for performance. Use date range to narrow results.</div>
        </div>
      </aside>
    </div>
  );
}
