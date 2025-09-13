import React, { useEffect, useState } from "react";
import api from "../api";

function ItemsPage() {
  const [forms, setForms] = useState([]);
  const [instances, setInstances] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch available forms
  useEffect(() => {
    async function fetchForms() {
      try {
        const res = await api.get("forms/");
        setForms(res.data);
      } catch {
        setError("خطا در دریافت فرم‌ها.");
      }
    }
    fetchForms();
  }, []);

  // Fetch items
  async function fetchItems() {
    try {
      const res = await api.get("instances/");
      setInstances(res.data);
    } catch {
      setError("خطا در دریافت آیتم‌ها.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  // Handle field changes
  function handleChange(name, value) {
    setFormData({ ...formData, [name]: value });
  }

  async function saveItem() {
    if (!selectedForm) return alert("ابتدا فرم را انتخاب کنید.");
    const payload = { form: selectedForm.id, data: formData };

    try {
      if (editingItem) {
        await api.put(`instances/${editingItem.id}/`, payload);
      } else {
        await api.post("instances/", payload);
      }
      setFormData({});
      setEditingItem(null);
      await fetchItems();
    } catch {
      setError("ذخیره آیتم ناموفق بود.");
    }
  }

  async function editItem(item) {
    setEditingItem(item);
    setSelectedForm(forms.find((f) => f.id === item.form));
    setFormData(item.data);
  }

  async function deleteItem(id) {
    if (!window.confirm("آیا مطمئن هستید؟")) return;
    try {
      await api.delete(`instances/${id}/`);
      await fetchItems();
    } catch {
      setError("حذف آیتم ناموفق بود.");
    }
  }

  if (loading) return <p style={{ textAlign: "center" }}>در حال بارگذاری...</p>;

  return (
    <div style={{ maxWidth: "1000px", margin: "20px auto", padding: "0 20px" }}>
      <h2 style={{ textAlign: "center" }}>مدیریت آیتم‌ها</h2>

      {/* Select Form */}
      <div style={{ marginBottom: "15px" }}>
        <label>انتخاب فرم: </label>
        <select
          value={selectedForm?.id || ""}
          onChange={(e) =>
            setSelectedForm(forms.find((f) => f.id === parseInt(e.target.value)))
          }
        >
          <option value="">-- انتخاب کنید --</option>
          {forms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic Form Fields */}
      {selectedForm && (
        <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
          <h3>{editingItem ? "ویرایش آیتم" : "ایجاد آیتم جدید"}</h3>
          {selectedForm.fields.map((field) => (
            <div key={field.id} style={{ marginBottom: "10px" }}>
              <label>{field.name}:</label>
              {field.type === "select" ? (
                <select
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                >
                  <option value="">-- انتخاب کنید --</option>
                  {field.options.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              )}
              {field.required && <span style={{ color: "red" }}> *</span>}
            </div>
          ))}

          <button onClick={saveItem}>💾 ذخیره</button>
          {editingItem && (
            <button onClick={() => { setEditingItem(null); setFormData({}); }}>
              لغو
            </button>
          )}
        </div>
      )}

      {/* Items Table */}
      <h3>لیست آیتم‌ها</h3>
      <table border="1" width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>فرم</th>
            <th>اطلاعات</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {instances.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{forms.find((f) => f.id === item.form)?.name || "?"}</td>
              <td>
                {Object.entries(item.data).map(([k, v]) => (
                  <div key={k}>
                    <strong>{k}:</strong> {v}
                  </div>
                ))}
              </td>
              <td>
                <button onClick={() => editItem(item)}>✏️</button>
                <button onClick={() => deleteItem(item.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default ItemsPage;
