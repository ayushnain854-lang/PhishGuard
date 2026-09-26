import axios from "axios";

// NOTE: Replace this IP with your computer's local network IP address (e.g. 192.168.1.XX) 
// to connect from a mobile simulator or physical device on the same Wi-Fi.
export const API_HOST = "172.17.68.70"; 
export const API_BASE = `http://${API_HOST}:5000`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  scanMessage: async (text, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post("/predict-message", { text }, { headers });
    return response.data;
  },
  scanUrl: async (url, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post("/predict-url", { url }, { headers });
    return response.data;
  },
  scanImage: async (imageUri, token) => {
    const headers = {
      "Content-Type": "multipart/form-data",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const formData = new FormData();
    // In React Native, the file object structure is different:
    formData.append("image", {
      uri: imageUri,
      name: "screenshot.jpg",
      type: "image/jpeg",
    });

    const response = await api.post("/predict-image", formData, { headers });
    return response.data;
  },
};

export const chatAPI = {
  sendMessage: async (message, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post("/chat", { message }, { headers });
    return response.data;
  },
};

export const dashboardAPI = {
  fetchAnalytics: async (token) => {
    const response = await api.get("/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default api;
