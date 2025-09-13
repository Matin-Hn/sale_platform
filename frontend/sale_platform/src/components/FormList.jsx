// FormList.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function FormList() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function fetchForms() {
    setLoading(true);
    try {
      const res = await api.get('forms/');
      setForms(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch forms.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchForms(); }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this form?')) return;
    try {
      await api.delete(`forms/${id}/`);
      setForms(forms.filter(f => f.id !== id));
    } catch (err) {
      alert('Delete failed');
      console.error(err);
    }
  }

  return (
    <div className="card">
      <h2>Your Forms</h2>
      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      <div className="list">
        {forms.length === 0 && !loading && <p>No forms yet — create one.</p>}
        {forms.map(form => (
          <div key={form.id} className="list-item">
            <div>
              <strong>{form.name}</strong>
              <div className="meta">Created: {new Date(form.created_at).toLocaleString()}</div>
            </div>
            <div className="actions">
              <Link to={`/forms/${form.id}/preview`} className="btn">Preview</Link>
              <Link to={`/forms/${form.id}/edit`} className="btn">Edit</Link>
              <button onClick={() => handleDelete(form.id)} className="btn danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate('/forms/new')} className="btn primary">New Form</button>
        <button onClick={fetchForms} className="btn">Refresh</button>
      </div>
    </div>
  );
}
