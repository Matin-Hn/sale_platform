import React, { useState } from "react";
import api from "../api";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("token/", { username, password });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      setSuccess(true);
      setTimeout(() => {
        if (onLogin) onLogin();
      }, 1000); // short delay so user sees success message
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "ورود ناموفق بود."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "25px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center"}}>ورود</h2>

      {error && (
        <p style={{ color: "red", background: "#ffe6e6", padding: "8px" }}>
          {error}
        </p>
      )}
      {success && (
        <p style={{ color: "green", background: "#e6ffe6", padding: "8px" }}>
          ✅ ورود موفق درحال انتقال...
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{padding:"20px"}}>
          <label>نام کاربری</label>
          <input
            type="text"
            value={username}
            placeholder="نام کاربری خود را وارد کنید"
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" , padding:"20px"}}>
          <label>رمز عبور</label>
          <input
            type="password"
            value={password}
            placeholder="رمز عبور را وارد کنید"
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: loading ? "#888" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.3s ease",
          }}
        >
          {loading ? "درحال ورود... " : "ورود"}
        </button>
      </form>
    </div>
  );
}

export default Login;
