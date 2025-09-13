// src/components/FieldRow.jsx
import React from 'react';

/**
 * FieldRow - small, memoized component to avoid re-renders unless props change.
 * Props:
 *  - field: {cid, name, type, required, options, order}
 *  - onChange(fieldPatch)
 *  - onRemove()
 *  - onMoveUp(), onMoveDown()
 */
function FieldRow({ field, onChange, onRemove, onMoveUp, onMoveDown }) {
  const optsString = Array.isArray(field.options) ? field.options.join(', ') : '';

  return (
    <div style={styles.row}>
      <input
        aria-label="field-name"
        placeholder="نام فیلد"
        value={field.name}
        onChange={(e) => onChange({ name: e.target.value })}
        style={styles.name}
      />

      <select
        value={field.type}
        onChange={(e) => onChange({ type: e.target.value })}
        style={styles.select}
      >
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="date">Date</option>
        <option value="select">Select</option>
      </select>

      <label style={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={!!field.required}
          onChange={(e) => onChange({ required: e.target.checked })}
        />{' '}
        required
      </label>

      {field.type === 'select' && (
        <input
          aria-label="field-options"
          placeholder="Options, comma separated"
          value={optsString}
          onChange={(e) =>
            onChange({ options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })
          }
          style={styles.options}
        />
      )}

      <div style={styles.actions}>
        <button type="button" onClick={onMoveUp} title="up">↑</button>
        <button type="button" onClick={onMoveDown} title="down">↓</button>
        <button type="button" onClick={onRemove} title="remove" style={styles.remove}>✕</button>
      </div>
    </div>
  );
}

const styles = {
  row: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 },
  name: { flex: '1 1 180px', padding: 8 },
  select: { width: 110, padding: 8 },
  options: { flex: '1 1 220px', padding: 8 },
  checkboxLabel: { fontSize: 12, color: '#333', display: 'flex', alignItems: 'center', gap: 6 },
  actions: { display: 'flex', gap: 6 },
  remove: { background: '#ffdede' }
};

export default React.memo(FieldRow, (prev, next) => {
  // shallow compare relevant fields to avoid rerender when parent changes unrelated state
  const k = ['name', 'type', 'required', 'options', 'order'];
  return k.every(key => {
    const a = prev.field[key];
    const b = next.field[key];
    // options array compare
    if (key === 'options') {
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
        return true;
      }
      return a === b;
    }
    return a === b;
  });
});
