// src/components/FormBuilder.jsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import FieldRow from './FieldRow';
import api from '../api';

// helper: stable client id generator
function genCid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `cid-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

// default empty field
function makeField(order = 0) {
  return {
    cid: genCid(),
    name: '',
    type: 'text',
    required: false,
    options: [],
    order
  };
}

/**
 * FormBuilder props:
 * - formId (optional) : if provided, loads existing form for editing
 * - onSaved (optional) : callback(formId)
 */
export default function FormBuilder({ formId = null, onSaved = null }) {
  const [name, setName] = useState('');
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(!!formId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const saveTimer = useRef(null);

  // load existing form for edit
  useEffect(() => {
    let mounted = true;
    if (!formId) return;

    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`forms/${formId}/`);
        if (!mounted) return;
        const payloadFields = (res.data.fields_json && res.data.fields_json.length)
          ? res.data.fields_json
          : (res.data.fields || []);
        // normalize: add cid for performance in UI
        const normalized = payloadFields.map((f, idx) => ({
          cid: genCid(),
          name: f.name || '',
          type: f.type || 'text',
          required: !!f.required,
          options: f.options || [],
          order: f.order ?? idx
        }));
        setName(res.data.name || '');
        setFields(normalized);
      } catch (err) {
        console.error(err);
        setError('Failed to load form');
      } finally {
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [formId]);

  // efficient updater helpers (useCallback to keep refs stable)
  const patchField = useCallback((cid, patch) => {
    setFields(prev => {
      // mutate copy minimally: find index, replace with merged object
      const i = prev.findIndex(p => p.cid === cid);
      if (i === -1) return prev;
      const next = prev.slice();
      const merged = { ...next[i], ...patch };
      next[i] = merged;
      return next;
    });
    scheduleDraftSave();
  }, []);

  const addField = useCallback((atIndex = null) => {
    setFields(prev => {
      const order = prev.length;
      const f = makeField(order);
      if (atIndex === null || atIndex >= prev.length) return [...prev, f];
      const copy = prev.slice();
      copy.splice(atIndex + 1, 0, f);
      // re-index orders
      return copy.map((it, idx) => ({ ...it, order: idx }));
    });
    scheduleDraftSave();
  }, []);

  const removeField = useCallback((cid) => {
    setFields(prev => {
      const next = prev.filter(p => p.cid !== cid).map((p, i) => ({ ...p, order: i }));
      return next;
    });
    scheduleDraftSave();
  }, []);

  const moveField = useCallback((cid, dir) => {
    setFields(prev => {
      const idx = prev.findIndex(p => p.cid === cid);
      if (idx === -1) return prev;
      const to = idx + dir;
      if (to < 0 || to >= prev.length) return prev;
      const copy = prev.slice();
      const tmp = copy[to];
      copy[to] = { ...copy[idx], order: to };
      copy[idx] = { ...tmp, order: idx };
      // ensure stable objects only for swapped entries
      return copy;
    });
    scheduleDraftSave();
  }, []);

  // Debounced draft save to localStorage (efficient: avoids frequent writes)
  function scheduleDraftSave() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        const draft = JSON.stringify({ name, fields });
        localStorage.setItem(formId ? `draft_form_${formId}` : 'draft_form_new', draft);
      } catch (e) {
        console.warn('draft save failed', e);
      }
    }, 700); // debounce 700ms
  }

  // Manual save to backend (create or update)
  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    // Basic validation (efficient early exits)
    if (!name.trim()) { setError('Form name required'); setSaving(false); return; }
    for (const f of fields) {
      if (!f.name.trim()) { setError('All fields need a name'); setSaving(false); return; }
      if (!['text','number','date','select'].includes(f.type)) { setError('Invalid field type'); setSaving(false); return; }
    }

    const payload = {
      name: name.trim(),
      // backend expects fields_data array
      fields_data: fields.map((f, i) => ({
        name: f.name.trim(),
        type: f.type,
        required: !!f.required,
        options: f.type === 'select' ? (Array.isArray(f.options) ? f.options : []) : [],
        order: f.order ?? i
      }))
    };

    try {
      if (formId) {
        await api.put(`forms/${formId}/`, payload);
        if (onSaved) onSaved(formId);
      } else {
        const res = await api.post('forms/', payload);
        const newId = res.data.id;
        if (onSaved) onSaved(newId);
      }
      // optimistic: remove draft
      localStorage.removeItem(formId ? `draft_form_${formId}` : 'draft_form_new');
    } catch (err) {
      console.error(err);
      setError('Save failed: check console');
    } finally {
      setSaving(false);
    }
  }, [name, fields, formId, onSaved]);

  // load draft on mount if any (fast path)
  useEffect(() => {
    try {
      const key = formId ? `draft_form_${formId}` : 'draft_form_new';
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) {
          if (parsed.name) setName(parsed.name);
          if (Array.isArray(parsed.fields)) setFields(parsed.fields);
        }
      }
    } catch (e) {
      // ignore parse errors
    }
    // cleanup saved timer on unmount
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [formId]);

  // quick add initial field if empty
  useEffect(() => {
    if (fields.length === 0) {
      setFields([makeField(0)]);
    }
    // only on mount ideally; we guard fields.length so it's safe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // render
  return (
    <div style={{ maxWidth: 980, margin: '24px auto', padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{formId ? 'Edit form' : 'Create form'}</h2>
        <div>
          <button onClick={handleSave} disabled={saving} style={btnPrimary}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={() => {
            // clear draft & reset
            localStorage.removeItem(formId ? `draft_form_${formId}` : 'draft_form_new');
            setName('');
            setFields([makeField(0)]);
          }} style={btn}>
            Reset
          </button>
        </div>
      </div>

      {loading ? <p>Loading…</p> : (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Form name</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); scheduleDraftSave(); }}
              placeholder="e.g., فرم میوه‌ها"
              style={{ width: '100%', padding: 10 }}
            />
          </div>

          <div>
            <h3>Fields</h3>
            {fields.map((f, idx) => (
              <FieldRow
                key={f.cid}
                field={f}
                onChange={(patch) => patchField(f.cid, patch)}
                onRemove={() => removeField(f.cid)}
                onMoveUp={() => moveField(f.cid, -1)}
                onMoveDown={() => moveField(f.cid, +1)}
              />
            ))}

            <div style={{ marginTop: 8 }}>
              <button onClick={() => addField()} style={btn}>+ Add field</button>
            </div>
          </div>

          {error && <div style={{ color: 'crimson', marginTop: 12 }}>{error}</div>}
        </>
      )}
    </div>
  );
}

// small inline styles for speed
const btn = { padding: '8px 12px', marginLeft: 8, borderRadius: 6 };
const btnPrimary = { ...btn, background: '#0b74de', color: '#fff', border: 'none' };
