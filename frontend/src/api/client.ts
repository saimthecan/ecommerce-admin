import axios from "axios";
import type { AxiosRequestConfig } from "axios";

const API_ORIGIN =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const API_BASE_URL = `${API_ORIGIN.replace(/\/+$/, "")}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

type WarmupRetryConfig = AxiosRequestConfig & {
  __warmupRetried?: boolean;
};

const WARMUP_ENDPOINT = "/api/warmup";
let warmupPromise: Promise<void> | null = null;

const triggerWarmup = async () => {
  if (!warmupPromise) {
    warmupPromise = fetch(WARMUP_ENDPOINT, {
      method: "POST",
      cache: "no-store",
    })
      .then(() => undefined)
      .catch(() => undefined)
      .finally(() => {
        warmupPromise = null;
      });
  }

  return warmupPromise;
};

const shouldAttemptWarmup = (error: unknown) => {
  if (error instanceof TypeError) {
    return true;
  }

  if (
    error instanceof Error &&
    (error.message.includes("Failed to fetch") ||
      error.message.includes("Network Error"))
  ) {
    return true;
  }

  if (
    typeof error === "string" &&
    (error.includes("Failed to fetch") || error.includes("Network Error"))
  ) {
    return true;
  }

  return false;
};

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

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (shouldAttemptWarmup(error) && axios.isAxiosError(error) && error.config) {
      const config = error.config as WarmupRetryConfig;
      if (!config.__warmupRetried) {
        config.__warmupRetried = true;
        await triggerWarmup();
        return apiClient.request(config);
      }
    }

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("auth");
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
