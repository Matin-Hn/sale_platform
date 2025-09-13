import React, { useState } from "react";
import api from "../api";

function RegisterPage({ onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("register/", { username, password });
      setSuccess("✅ ثبت‌نام با موفقیت انجام شد. حالا وارد شوید.");
      setUsername("");
      setPassword("");
      if (onRegister) onRegister();
    } catch (err) {
      setError("❌ ثبت‌نام ناموفق بود.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "60px auto",
        padding: "30px",
        border: "1px solid #e0e0e0",
        borderRadius: "10px",
        boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
        fontFamily: "sans-serif",
        backgroundColor: "#fdfdfd",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "25px" }}>ثبت‌نام</h2>

      {error && (
        <p
          style={{
            color: "#b00020",
            background: "#fdecea",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "15px",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}
      {success && (
        <p
          style={{
            color: "#2e7d32",
            background: "#e8f5e9",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "15px",
            textAlign: "center",
          }}
        >
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" , padding:"20px"}}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            نام کاربری
          </label>
          <input
            type="text"
            placeholder="نام کاربری خود را وارد کنید"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "14px",
            }}
            required
          />
        </div>

        <div style={{ marginBottom: "25px" , padding:"20px"}}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            رمز عبور
          </label>
          <input
            type="password"
            placeholder="رمز عبور را وارد کنید"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "14px",
            }}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.background = "#1565c0")}
          onMouseOut={(e) => (e.target.style.background = "#1976d2")}
        >
          ثبت‌نام
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
