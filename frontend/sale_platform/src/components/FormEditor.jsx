// FormEditor.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

// Utility for deep copy and default field shape
const emptyField = (order = 0) => ({
  name: '',
  type: 'text',
  required: false,
  options: [],
  order
});

export default function FormEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [fields, setFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // load existing form for edit
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`forms/${id}/`);
        if (cancelled) return;
        setName(res.data.name || '');
        // prefer fields_json if present, else fields from serializer
        const loadedFields = res.data.fields_json?.length ? res.data.fields_json : (res.data.fields || []);
        // normalize options to arrays
        setFields(loadedFields.map((f, idx) => ({
          name: f.name || '',
          type: f.type || 'text',
          required: !!f.required,
          options: f.options || [],
          order: f.order ?? idx
        })));
      } catch (err) {
        console.error(err);
        setError('Failed to load form for editing');
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  function addField() {
    setFields(prev => [...prev, emptyField(prev.length)]);
  }

  function updateField(index, patch) {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, ...patch } : f));
  }

  function removeField(index) {
    setFields(prev => prev.filter((_, i) => i !== index));
  }

  function moveField(index, dir) {
    // dir: -1 up, +1 down
    setFields(prev => {
      const copy = [...prev];
      const to = index + dir;
      if (to < 0 || to >= copy.length) return prev;
      [copy[index], copy[to]] = [copy[to], copy[index]];
      // update orders
      return copy.map((f, i) => ({ ...f, order: i }));
    });
  }

  function optionsString(field) {
    return Array.isArray(field.options) ? field.options.join(', ') : '';
  }

  async function handleSave(e) {
    e && e.preventDefault();
    // Basic sanitization: ensure name non-empty and every field has name + valid type
    if (!name.trim()) { setError('Form name is required'); return; }
    for (const f of fields) {
      if (!f.name || !f.name.trim()) { setError('All fields must have a name'); return; }
      if (!['text','number','date','select'].includes(f.type)) { setError(`Invalid field type: ${f.type}`); return; }
    }

    const payload = {
      name: name.trim(),
      fields_data: fields.map((f, i) => ({
        name: f.name.trim(),
        type: f.type,
        required: !!f.required,
        options: f.type === 'select' ? (Array.isArray(f.options) ? f.options : (optionsString(f).split(',').map(s => s.trim()).filter(Boolean))) : [],
        order: f.order ?? i
      }))
    };

    setSaving(true);
    setError(null);
    try {
      if (id) {
        await api.put(`forms/${id}/`, payload);
        navigate(`/forms/${id}/preview`);
      } else {
        const res = await api.post('forms/', payload);
        const newId = res.data.id;
        navigate(`/forms/${newId}/preview`);
      }
    } catch (err) {
      console.error(err);
      setError('Save failed. See console.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <h2>{id ? 'Edit Form' : 'Create Form'}</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSave}>
        <label>
          Form name
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., فرمی برای میوه" />
        </label>

        <h3>Fields</h3>
        <div className="fields">
          {fields.map((f, idx) => (
            <div key={idx} className="field-row">
              <input
                className="field-name"
                placeholder="Field name"
                value={f.name}
                onChange={e => updateField(idx, { name: e.target.value })}
              />
              <select value={f.type} onChange={e => updateField(idx, { type: e.target.value })}>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="select">Select</option>
              </select>
              <label className="checkbox">
                <input type="checkbox" checked={f.required} onChange={e => updateField(idx, { required: e.target.checked })} />
                Required
              </label>

              {f.type === 'select' && (
                <input
                  className="field-options"
                  placeholder="Options (comma separated)"
                  value={optionsString(f)}
                  onChange={e => updateField(idx, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                />
              )}

              <div className="field-actions">
                <button type="button" onClick={() => moveField(idx, -1)} aria-label="move up">↑</button>
                <button type="button" onClick={() => moveField(idx, +1)} aria-label="move down">↓</button>
                <button type="button" onClick={() => removeField(idx)} className="danger">Remove</button>
              </div>
            </div>
          ))}

          {fields.length === 0 && <p className="muted">No fields yet — add one.</p>}
        </div>

        <div className="controls">
          <button type="button" onClick={addField} className="btn">Add field</button>
          <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save & Preview'}</button>
          <button type="button" onClick={() => navigate('/forms')} className="btn">Cancel</button>
        </div>
      </form>
    </div>
  );
}
