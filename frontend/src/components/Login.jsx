import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiRequest('/api/auth/login', 'POST', { email, password });
      if (res.token) {
        onAuth(res.user, res.token);
        if (res.user.role === 'admin') navigate('/admin'); else navigate('/dashboard');
      } else {
        alert(res.error || 'Login failed');
      }
    } catch (err) {
      alert(err.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card card">
      <h1 className="h1">Login</h1>
      <form className="auth-form" onSubmit={submit}>
        <div className="form-row mb-8"><input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
        <div className="form-row mb-8"><input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required /></div>

        <div className="row">
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Please wait...' : 'Login'}</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/signup')}>Signup</button>
        </div>

        <div className="auth-foot mt-10">Don't have an account? <a className="link" href="/signup">Signup</a></div>
      </form>
    </div>
  );
}
