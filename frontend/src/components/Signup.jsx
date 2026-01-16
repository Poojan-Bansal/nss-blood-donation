import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [name, setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest('/api/auth/register', 'POST', { name, email, password });
      alert('Account created. Please login.');
      navigate('/login');
    } catch (err) {
      alert(err.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card card">
      <h1 className="h1">Signup</h1>
      <form className="auth-form" onSubmit={submit}>
        <div className="form-row mb-8"><input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required /></div>
        <div className="form-row mb-8"><input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
        <div className="form-row mb-8"><input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required /></div>

        <div className="row">
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Please wait...' : 'Signup'}</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/login')}>Go to Login</button>
        </div>

        <div className="auth-foot mt-10">Already have an account? <a className="link" href="/login">Login</a></div>
      </form>
    </div>
  );
}
