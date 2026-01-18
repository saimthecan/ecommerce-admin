import axios from "axios";

const API_ORIGIN =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const API_BASE_URL = `${API_ORIGIN.replace(/\/+$/, "")}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- TOKEN INTERCEPTOR ----
apiClient.interceptors.request.use((config) => {
  const auth = localStorage.getItem("auth");
  if (auth) {
    const parsed = JSON.parse(auth);
    if (parsed.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`;
    }
  }
  return config;
});
