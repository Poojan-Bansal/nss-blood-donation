import React from 'react';
import AdminDashboard from '../components/AdminDashboard'; // keep your existing admin component
export default function AdminPage({ token, logout }) {
  return (
    <div className="app-wrap">
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <h2 className="h2">Admin Dashboard</h2>
        <div><button className="btn btn-ghost" onClick={logout}>Logout</button></div>
      </header>
      <AdminDashboard token={token} />
    </div>
  );
}
