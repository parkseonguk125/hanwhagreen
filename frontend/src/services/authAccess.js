const TOKEN_KEY = "hg_auth_token";
const MEMBER_KEY = "hg_auth_member";
const PERSISTENT_KEY = "hg_auth_persistent";

function readStorage(persistent) {
  return persistent ? localStorage : sessionStorage;
}

export function getAuthToken() {
  if (localStorage.getItem(PERSISTENT_KEY) === "1") {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || "";
  }
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || "";
}

export function getStoredMember() {
  const persistent = localStorage.getItem(PERSISTENT_KEY) === "1";
  const raw = persistent
    ? localStorage.getItem(MEMBER_KEY) || sessionStorage.getItem(MEMBER_KEY)
    : sessionStorage.getItem(MEMBER_KEY) || localStorage.getItem(MEMBER_KEY);

  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storeAuth({ token, member }, { persistent = false } = {}) {
  clearAuth();
  const storage = readStorage(persistent);
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(MEMBER_KEY, JSON.stringify(member));
  if (persistent) {
    localStorage.setItem(PERSISTENT_KEY, "1");
  }
}

export function clearAuth() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(MEMBER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(MEMBER_KEY);
  localStorage.removeItem(PERSISTENT_KEY);
}

export function isLoggedIn() {
  return Boolean(getAuthToken() && getStoredMember());
}

export function isAdmin() {
  const member = getStoredMember();
  const level = Number(member?.level ?? member?.mb_level ?? 0);
  return Boolean(member && level >= 10);
}
