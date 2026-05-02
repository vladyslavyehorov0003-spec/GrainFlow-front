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
  const res = await api.post<{ data: AuthResponse }>("/auth/register", data);
  setTokens(res.data.data.accessToken, res.data.data.refreshToken);
}

export async function verifyEmail(token: string): Promise<void> {
  const res = await api.post<{ data: AuthResponse }>(`/auth/verify?token=${encodeURIComponent(token)}`);
  setTokens(res.data.data.accessToken, res.data.data.refreshToken);
}

export async function resendVerification(email: string): Promise<void> {
  await api.post("/auth/resend-verification", { email });
}

export async function login(data: LoginRequest): Promise<void> {
  const res = await api.post<{ data: AuthResponse }>("/auth/login", data);
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
  companyVerified: boolean;
  createdAt: string;
}

export async function getMe(): Promise<UserResponse> {
  const res = await api.get<{ data: UserResponse }>("/users/me");
  return res.data.data;
}

// ── Change password (logged in) ────────────────────────────────────────────────
// Backend: PATCH /users/me/password → returns a fresh AuthResponse so the current
// session stays alive after all other refresh tokens are revoked. We swap the
// stored tokens in place so the caller doesn't have to think about it.

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword:     string;
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  const res = await api.patch<{ data: AuthResponse }>("/users/me/password", data);
  setTokens(res.data.data.accessToken, res.data.data.refreshToken);
}

// ── Email change (two-factor for VERIFIED, immediate for UNVERIFIED) ───────────
// Backend response shape:
//   { status: "CHANGED" | "CODE_SENT", tokens: AuthResponse | null }
//
//   CHANGED   → company was UNVERIFIED, email already updated, fresh tokens included.
//               We swap them in-place; the caller just refreshes user data.
//   CODE_SENT → company was VERIFIED, link mailed to OLD email + code mailed to NEW.
//               UI should now show the "enter code" screen.

export interface RequestEmailChangeResponse {
  status: "CHANGED" | "CODE_SENT";
}

export async function requestEmailChange(newEmail: string): Promise<RequestEmailChangeResponse> {
  const res = await api.post<{
    data: { status: "CHANGED" | "CODE_SENT"; tokens: AuthResponse | null };
  }>("/users/me/email/request-change", { newEmail });

  const { status, tokens } = res.data.data;
  if (status === "CHANGED" && tokens) {
    setTokens(tokens.accessToken, tokens.refreshToken);
  }
  return { status };
}

// Step 2 of the VERIFIED flow. The user clicked the link in the OLD inbox
// (giving us the token from ?token=…) and pasted the code from the NEW inbox.
export async function confirmEmailChange(token: string, code: string): Promise<void> {
  const res = await api.post<{ data: AuthResponse }>(
    "/users/me/email/confirm-change",
    { token, code },
  );
  setTokens(res.data.data.accessToken, res.data.data.refreshToken);
}

// ── Forgot password (NOT logged in) ────────────────────────────────────────────
// Backend always answers 200 even on unknown email (anti-enumeration), so there's
// no useful return value — UI just shows "if it exists, a link was sent".

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

// Completes the forgot-password flow with the token from the link + new password.
// Backend revokes ALL sessions and does NOT issue tokens — user must log in
// manually with the new password (closes a window where a leaked link could
// silently take over an account).
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post("/auth/reset-password", { token, newPassword });
}
