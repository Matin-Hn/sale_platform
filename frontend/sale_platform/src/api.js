import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Attach token before requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");
        const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
          refresh,
        });

        localStorage.setItem("access", res.data.access);

        api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;
        originalRequest.headers["Authorization"] = `Bearer ${res.data.access}`;

        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login"; // force login
      }
    }

    return Promise.reject(error);
  }
);

export default api;
