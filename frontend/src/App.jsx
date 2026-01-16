import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import UserDashboard from './pages/UserDashboard';
import AdminPage from './pages/AdminPage';
import DonatePage from './pages/DonatePage'; // create below
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  useEffect(() => { if (user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user'); }, [user]);
  useEffect(() => { if (token) localStorage.setItem('token', token); else localStorage.removeItem('token'); }, [token]);

  function onAuth(u, t) { setUser(u); setToken(t); }
  function logout() { setUser(null); setToken(null); }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onAuth={onAuth} />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<ProtectedRoute user={user}><UserDashboard token={token} user={user} logout={logout} /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute user={user}>{user?.role === 'admin' ? <AdminPage token={token} logout={logout} /> : <Navigate to="/dashboard" replace />}</ProtectedRoute>} />

        <Route path="/donate" element={<ProtectedRoute user={user}><DonatePage token={token} /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}
