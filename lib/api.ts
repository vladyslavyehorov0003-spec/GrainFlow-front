import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { setTokens } from "./auth";
import { ApiError, SERVER_ERROR_MESSAGE, NETWORK_ERROR_MESSAGE } from "./errors";

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

  const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
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

// ── Error normalization ───────────────────────────────────────────────────────
function normalizeError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return new ApiError((error as Error)?.message ?? "Unexpected error");
  }
  const axiosError = error as AxiosError<{ message?: string }>;

  // Request never reached the server (offline / CORS / timeout)
  if (!axiosError.response) {
    return new ApiError(NETWORK_ERROR_MESSAGE, { isNetworkError: true });
  }

  const status         = axiosError.response.status;
  const backendMessage = axiosError.response.data?.message ?? null;

  // Hide backend internals on 5xx
  if (status >= 500) {
    return new ApiError(SERVER_ERROR_MESSAGE, { status });
  }

  // 4xx — use backend message when present
  return new ApiError(
    backendMessage ?? `Request failed (${status})`,
    { status, serverMessage: backendMessage }
  );
}

// ── Response interceptor — refresh on 401, queue concurrent requests ──────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Not a 401 or already retried — normalize and throw
    // 403 is "authenticated but forbidden" — no point refreshing the token
    // No Authorization header → request was anonymous (login/register/forgot-password),
    // so 401 is a real credentials error, not an expired token. Don't trigger refresh.
    const status = error.response?.status;
    const hadAuthHeader = !!original.headers?.Authorization;
    if (status !== 401 || original._retry || !hadAuthHeader) {
      return Promise.reject(normalizeError(error));
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
      const isAuthFailure =
        axios.isAxiosError(refreshError) &&
        refreshError.response?.status === 401;
      if (isAuthFailure) {
        Cookies.remove("token", { path: "/" });
        Cookies.remove("refreshToken", { path: "/" });
        if (typeof window !== "undefined") window.location.href = "/login";
      } else {
        if (typeof window !== "undefined") window.location.href = "/maintenance";
      }
      return Promise.reject(normalizeError(refreshError));
    } finally {
      isRefreshing = false;
    }
  }
);
