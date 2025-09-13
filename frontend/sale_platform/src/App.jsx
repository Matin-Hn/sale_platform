import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./pages/Login";
import FormsPage from "./pages/FormsPage";
import ItemsPage from "./pages/ItemsPage";
import RegisterPage from "./pages/RegisterPage"

function App() {
  const isAuthenticated = !!localStorage.getItem("access");

  return (
    <Router>
      {(
  <nav style={{ padding: "10px", borderBottom: "1px solid #ddd", marginBottom: "20px" }}>
    <Link to="/forms" style={{ marginRight: "15px" }}>📋 فرم‌ها</Link>
    <Link to="/items">📦 آیتم‌ها</Link>

    {isAuthenticated ? (
      // اگر کاربر لاگین بود => خروج
      <button
        style={{ float: "left", background: "transparent", border: "none", cursor: "pointer", color: "red" }}
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
      >
        🚪 خروج
      </button>
    ) : (
      // اگر لاگین نبود => ورود و ثبت‌نام
      <>
        <Link style={{ float: "left", marginRight: "10px" }} to="/register">ثبت نام</Link>
        <Link style={{ float: "left" }} to="/login">ورود</Link>
      </>
    )}
  </nav>
)}

      <Routes>
        <Route path="/login" element={<Login onLogin={() => (window.location.href = "/forms")} />} />
        <Route path="/forms" element={isAuthenticated ? <FormsPage /> : <Navigate to="/login" />} />
        <Route path="/items" element={isAuthenticated ? <ItemsPage /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/forms" : "/login"} replace />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
