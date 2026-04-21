import axios from "axios";
import Cookies from "js-cookie";
import { setTokens } from "./auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// ── Shared refresh state ──────────────────────────────────────────────────────

let isRefreshing = false;
let queue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  queue = [];
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function doRefresh(): Promise<string> {
  const refreshToken = Cookies.get("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");

  const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
    refreshToken,
  });

  const newToken: string = data.data?.accessToken ?? data.accessToken;
  const newRefreshToken: string = data.data?.refreshToken ?? data.refreshToken;
  setTokens(newToken, newRefreshToken);
  api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
  return newToken;
}

// ── Request interceptor — attach current token ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — refresh on 401, queue concurrent requests ──────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Not a 401/403 or already retried — just throw
    const status = error.response?.status;
    if ((status !== 401 && status !== 403) || original._retry) {
      return Promise.reject(error);
    }

    // Refresh already in progress — queue this request until it finishes
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const freshToken = await doRefresh();
      processQueue(null, freshToken);
      original.headers.Authorization = `Bearer ${freshToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      Cookies.remove("token", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
