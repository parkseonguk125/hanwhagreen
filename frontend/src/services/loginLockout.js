const STORAGE_KEY = "hanwhagreen_login_lockout_until";
const DEFAULT_LOCKOUT_SECONDS = 300;

export function getDefaultLockoutSeconds() {
  return DEFAULT_LOCKOUT_SECONDS;
}

export function getLoginLockoutUntil() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return 0;

  const until = Number(raw);
  if (!Number.isFinite(until) || until <= Date.now()) {
    sessionStorage.removeItem(STORAGE_KEY);
    return 0;
  }
  return until;
}

export function setLoginLockout(seconds = DEFAULT_LOCKOUT_SECONDS) {
  const safeSeconds = Math.max(1, Number(seconds) || DEFAULT_LOCKOUT_SECONDS);
  const until = Date.now() + safeSeconds * 1000;
  sessionStorage.setItem(STORAGE_KEY, String(until));
  return until;
}

export function getLoginLockoutRemainingSeconds() {
  const until = getLoginLockoutUntil();
  if (!until) return 0;
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

export function isLoginLockedOut() {
  return getLoginLockoutRemainingSeconds() > 0;
}

export function formatLockoutRemaining(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}분 ${String(seconds).padStart(2, "0")}초`;
  }
  return `${seconds}초`;
}

export function getLoginLockoutAlertMessage(remainingSeconds) {
  const remaining = formatLockoutRemaining(remainingSeconds);
  return (
    "[경고] 로그인 가능 횟수를 초과했습니다.\n\n" +
    `${remaining} 후에 다시 로그인해 주세요.\n` +
    "그동안 로그인이 일시적으로 제한됩니다."
  );
}
