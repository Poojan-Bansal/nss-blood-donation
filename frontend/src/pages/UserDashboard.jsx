import React, { useEffect, useState } from 'react';
import RegistrationForm from '../components/RegistrationForm';
import Donate from '../components/Donate';
import MyDonations from '../components/MyDonations';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';

export default function UserDashboard({ token, user, logout }) {
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [totalDonations, setTotalDonations] = useState(0);

 
  async function loadDonations() {
    try {
      const res = await apiRequest('/api/donation/me', 'GET', null, token);
      const arr = Array.isArray(res) ? res : [];
      setDonations(arr);
      const total = arr
        .filter(d => d.status === 'success')
        .reduce((s, d) => s + (d.amount || 0), 0);
      setTotalDonations(total);
    } catch (err) {
      console.error('loadDonations err', err);
    }
  }

  useEffect(() => {
    if (!token) return;
    loadDonations();

    
    function onDonationCompleted() {
     
      loadDonations();
    }

    window.addEventListener('donation:completed', onDonationCompleted);
    return () => window.removeEventListener('donation:completed', onDonationCompleted);
    
  }, [token]);

  return (
    <div className="app-wrap">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <div>
          <div style={{fontSize:22, fontWeight:700}}>Welcome, {user?.name || user?.email}</div>
          <div className="small text-muted">Manage registration and donations</div>
        </div>
        <div>
          <button className="btn btn-ghost" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="main-panel">
          <div className="card mb-8">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div className="h2">Dashboard</div>
                <div className="small text-muted">Quick overview</div>
              </div>
              <div className="kpi">
                <div className="value">₹{totalDonations}</div>
                <div className="label small-muted">Your Donations</div>
              </div>
            </div>
          </div>

          <div className="card mb-8"><h3 className="h2">Registration</h3><RegistrationForm token={token} /></div>
          <div className="card mb-8"><h3 className="h2">Donate</h3><Donate token={token} /></div>
          <div className="card mb-8"><h3 className="h2">My Donations</h3><MyDonations token={token} /></div>
        </div>

        <aside className="side-panel">
          <div className="card card-compact mb-8">
            <div className="small-muted">Quick Actions</div>
            <div className="mt-10">
              <button className="btn btn-primary" onClick={() => navigate('/donate')}>Donate Now</button>
            </div>
          </div>

          <div className="card card-compact">
            <div className="small-muted">Help</div>
            <div className="small text-muted mt-8">Contact your admin for account or payment issues.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
