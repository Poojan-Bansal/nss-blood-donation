// frontend/src/components/RegistrationForm.jsx
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function RegistrationForm({ token }) {
  const [form, setForm] = useState({ fullName: '', phone: '', college: '', course: '' });
  const [saved, setSaved] = useState(null); // server record
  const [isEditing, setIsEditing] = useState(false); // editing existing
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const reg = await apiRequest('/api/registration/me', 'GET', null, token);
        if (reg && reg._id) {
          setSaved(reg);
          setForm({
            fullName: reg.fullName || '',
            phone: reg.phone || '',
            college: reg.college || '',
            course: reg.course || ''
          });
          setIsEditing(false);
        }
      } catch (e) {
        setSaved(null);
        setIsEditing(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    try {
      if (saved && saved._id && isEditing) {
        // update existing registration (PUT)
        const updated = await apiRequest('/api/registration', 'PUT', form, token);
        setSaved(updated);
        setIsEditing(false);
        alert('Registration updated');
      } else if (!saved) {
        // create new registration (POST)
        const newReg = await apiRequest('/api/registration', 'POST', form, token);
        setSaved(newReg);
        setIsEditing(false);
        alert('Registration saved');
      } else {
        alert('No changes to save. Click Edit to modify.');
      }
    } catch (err) {
      alert(err.error || 'Error saving registration');
    }
  }

  if (loading) return <div className="card">Loading...</div>;

  return (
    <div className="card">
      {saved && !isEditing ? (
        <>
          <h4 className="h2">Your Registration</h4>
          <div><b>Name:</b> {saved.fullName}</div>
          <div><b>College:</b> {saved.college}</div>
          <div><b>Phone:</b> {saved.phone}</div>
          <div className="small text-muted">
            Last updated: {saved.updatedAt ? new Date(saved.updatedAt).toLocaleString() : (saved.createdAt ? new Date(saved.createdAt).toLocaleString() : '-')}
          </div>

          <div style={{ marginTop: 12 }}>
            {/* Toggle edit mode, but DO NOT null saved */}
            <button
              className="btn"
              onClick={() => {
                setIsEditing(true);
                setForm({
                  fullName: saved.fullName || '',
                  phone: saved.phone || '',
                  college: saved.college || '',
                  course: saved.course || ''
                });
              }}
            >
              Edit
            </button>

            <button className="btn btn-primary" onClick={() => navigate('/donate')} style={{ marginLeft: 8 }}>
              Donate Now
            </button>
          </div>
        </>
      ) : (
        <>
          <h4 className="h2">{isEditing ? 'Edit Registration' : 'Create Registration'}</h4>
          <form onSubmit={submit}>
            <div className="form-row mb-8">
              <input placeholder="Full name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div className="form-row mb-8">
              <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-row mb-8">
              <input placeholder="College" value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} />
            </div>
            <div className="form-row mb-8">
              <input placeholder="Course" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} />
            </div>

            <div className="row">
              <button className="btn btn-primary" type="submit">{isEditing ? 'Update' : 'Save Registration'}</button>
              {isEditing && <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>}
              {!isEditing && <button type="button" className="btn btn-ghost" onClick={() => navigate('/donate')}>Skip & Donate</button>}
            </div>
          </form>
        </>
      )}
    </div>
  );
}
