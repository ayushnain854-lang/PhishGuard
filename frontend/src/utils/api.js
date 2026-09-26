import axios from "axios";

const API_BASE = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor to dynamically attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pg_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      delete config.headers["Authorization"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post("/login", { email, password });
    return response.data;
  },
  signup: async (username, email, password) => {
    const response = await api.post("/signup", { username, email, password });
    return response.data;
  },
};

export const scannerAPI = {
  scanMessage: async (text) => {
    const response = await api.post("/predict-message", { text });
    return response.data;
  },
  scanUrl: async (url) => {
    const response = await api.post("/predict-url", { url });
    return response.data;
  },
  scanImage: async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    
    // Custom header for file multipart uploads
    const response = await api.post("/predict-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export const chatAPI = {
  sendMessage: async (message) => {
    const response = await api.post("/chat", { message });
    return response.data;
  },
};

export const dashboardAPI = {
  fetchHistory: async (filters = {}) => {
    const response = await api.get("/history", { params: filters });
    return response.data;
  },
  fetchAnalytics: async () => {
    const response = await api.get("/analytics");
    return response.data;
  },
  saveSettings: async (settings) => {
    const response = await api.post("/settings", settings);
    return response.data;
  },
};

export default api;
