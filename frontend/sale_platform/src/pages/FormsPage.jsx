import React, { useEffect, useState } from "react";
import api from "../api";

function FormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingForm, setEditingForm] = useState(null); // null=new form
  const [formName, setFormName] = useState("");
  const [fields, setFields] = useState([]);
  const [preview, setPreview] = useState(null);

  // Fetch forms on mount
  useEffect(() => {
    fetchForms();
  }, []);

  async function fetchForms() {
    try {
      const res = await api.get("forms/");
      setForms(res.data);
    } catch {
      setError("خطا در دریافت فرم‌ها.");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // Form Builder Handlers
  // -------------------------

  function resetBuilder() {
    setEditingForm(null);
    setFormName("");
    setFields([]);
    setPreview(null);
  }

  function addField() {
    setFields([
      ...fields,
      { name: "", type: "text", required: false, options: [] },
    ]);
  }

  function updateField(idx, key, value) {
    const updated = [...fields];
    updated[idx][key] = value;
    setFields(updated);
  }

  function removeField(idx) {
    setFields(fields.filter((_, i) => i !== idx));
  }

  async function saveForm() {
    try {
      if (editingForm) {
        await api.put(`forms/${editingForm.id}/`, {
          name: formName,
          fields_data: fields,
        });
      } else {
        await api.post("forms/", {
          name: formName,
          fields_data: fields,
        });
      }
      await fetchForms();
      resetBuilder();
    } catch {
      setError("ذخیره فرم ناموفق بود.");
    }
  }

  async function editForm(form) {
    setEditingForm(form);
    setFormName(form.name);
    setFields(form.fields || []);
  }

  async function deleteForm(id) {
    if (!window.confirm("آیا مطمئن هستید که این فرم حذف شود؟")) return;
    try {
      await api.delete(`forms/${id}/`);
      await fetchForms();
    } catch {
      setError("حذف فرم ناموفق بود.");
    }
  }

  async function handlePreview(id) {
    try {
      const res = await api.get(`forms/${id}/preview/`);
      setPreview(res.data.fields);
    } catch {
      setError("خطا در بارگذاری پیش‌نمایش فرم.");
    }
  }

  // -------------------------
  // Render
  // -------------------------
  if (loading) return <p style={{ textAlign: "center" }}>در حال بارگذاری...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "1000px", margin: "20px auto", padding: "0 20px" }}>
      <h2 style={{ textAlign: "center" }}>مدیریت فرم‌ها</h2>

      {/* Form Builder */}
      <div style={{ margin: "20px 0", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h3>{editingForm ? "ویرایش فرم" : "ایجاد فرم جدید"}</h3>
        <input
          type="text"
          placeholder="نام فرم"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <button onClick={addField} style={{ marginBottom: "10px" }}>
          ➕ افزودن فیلد
        </button>

        {fields.map((field, idx) => (
          <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <input
              type="text"
              placeholder="نام فیلد"
              value={field.name}
              onChange={(e) => updateField(idx, "name", e.target.value)}
            />
            <select
              value={field.type}
              onChange={(e) => updateField(idx, "type", e.target.value)}
            >
              <option value="text">متن</option>
              <option value="number">عدد</option>
              <option value="date">تاریخ</option>
              <option value="select">لیست انتخابی</option>
            </select>
            <label>
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => updateField(idx, "required", e.target.checked)}
              />{" "}
              اجباری
            </label>
            {field.type === "select" && (
              <input
                type="text"
                placeholder="گزینه‌ها با , جدا شوند"
                value={field.options.join(",")}
                onChange={(e) =>
                  updateField(idx, "options", e.target.value.split(",").map((s) => s.trim()))
                }
              />
            )}
            <button onClick={() => removeField(idx)}>❌</button>
          </div>
        ))}

        <button onClick={saveForm} style={{ marginRight: "8px" }}>
          💾 ذخیره
        </button>
        {editingForm && (
          <button onClick={resetBuilder}>لغو</button>
        )}
      </div>

      {/* Forms List */}
      <h3>لیست فرم‌ها</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "15px" }}>
        {forms.map((form) => (
          <div key={form.id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px" }}>
            <h4>{form.name}</h4>
            <p>فیلدها: {form.fields?.length || 0}</p>
            <button onClick={() => editForm(form)}>✏️ ویرایش</button>
            <button onClick={() => deleteForm(form.id)} style={{ marginLeft: "5px", color: "red" }}>
              🗑️ حذف
            </button>
            <button onClick={() => handlePreview(form.id)} style={{ marginLeft: "5px" }}>
              👁️ پیش‌نمایش
            </button>
          </div>
        ))}
      </div>

      {/* Preview */}
      {preview && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #007bff", borderRadius: "6px" }}>
          <h3>پیش‌نمایش فیلدها</h3>
          <ul>
            {preview.map((f, i) => (
              <li key={i}>
                <strong>{f.name}</strong> ({f.type}) {f.required ? "⭐" : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FormsPage;
