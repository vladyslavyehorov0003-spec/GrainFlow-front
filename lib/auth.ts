import Cookies from "js-cookie";
import { api } from "./api";

 const TOKEN_KEY         = "token";
 const REFRESH_TOKEN_KEY = "refreshToken";

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function setTokens(token: string, refreshToken: string) {
  Cookies.set(TOKEN_KEY, token, { expires: 1, sameSite: "lax", path: "/" });
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7, sameSite: "lax", path: "/" });
}

export function removeTokens() {
  Cookies.remove(TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ── API calls ──────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company:{
    name: string;
    address?:string;
    phone?: string
  }
  
}

export interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export async function register(data: RegisterRequest): Promise<void> {
  const res = await api.post<{ data: AuthResponse }>("/api/v1/auth/register", data);
  setTokens(res.data.data.accessToken, res.data.data.refreshToken);
}

export async function login(data: LoginRequest): Promise<void> {
  const res = await api.post<{ data: AuthResponse }>("/api/v1/auth/login", data);
  setTokens(res.data.data.accessToken, res.data.data.refreshToken);
}

export function logout() {
  removeTokens();
  window.location.href = "/login";
}

// ── User ───────────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string | null;
  role: "MANAGER" | "WORKER";
  companyId: string;
  companyName: string;
  enabled: boolean;
  createdAt: string;
}

export async function getMe(): Promise<UserResponse> {
  const res = await api.get<{ data: UserResponse }>("/api/v1/users/me");
  return res.data.data;
}
