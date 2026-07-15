import { getAuthToken } from "./authAccess";
import { apiFetch } from "./apiClient";
import { getDefaultLockoutSeconds } from "./loginLockout";

export class LoginRateLimitError extends Error {
  constructor(retryAfterSeconds = getDefaultLockoutSeconds()) {
    super("LOGIN_RATE_LIMITED");
    this.name = "LoginRateLimitError";
    this.status = 429;
    this.isLoginRateLimited = true;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function isLoginRateLimitError(error) {
  return (
    error instanceof LoginRateLimitError ||
    error?.isLoginRateLimited === true ||
    error?.status === 429
  );
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "요청 처리 중 오류가 발생했습니다.");
  }
  return data;
}

function parseRetryAfterSeconds(response, data) {
  const fromBody = Number(data?.retryAfterSeconds);
  if (Number.isFinite(fromBody) && fromBody > 0) return fromBody;

  const header = response.headers.get("Retry-After");
  const fromHeader = Number(header);
  if (Number.isFinite(fromHeader) && fromHeader > 0) return fromHeader;

  return getDefaultLockoutSeconds();
}

export async function loginMember({ mb_id, mb_password, auto_login }) {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mb_id, mb_password, auto_login }),
  });

  if (response.status === 429) {
    const data = await response.json().catch(() => ({}));
    throw new LoginRateLimitError(parseRetryAfterSeconds(response, data));
  }

  return parseResponse(response);
}

export async function fetchCurrentMember() {
  const token = getAuthToken();
  if (!token) return null;

  const response = await apiFetch("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    return null;
  }

  const data = await parseResponse(response);
  return data.member;
}

export async function logoutMember() {
  const token = getAuthToken();
  if (!token) return { ok: true };

  const response = await apiFetch("/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseResponse(response);
}
