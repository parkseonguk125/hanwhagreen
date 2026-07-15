const STORAGE_PREFIX = "qa_unlock_";
const PASSWORD_PREFIX = "qa_pwd_";

function storageKey(id) {
  return `${STORAGE_PREFIX}${id}`;
}

function passwordKey(id) {
  return `${PASSWORD_PREFIX}${id}`;
}

export function storeUnlockedQaPost(post) {
  if (!post?.id) return;
  sessionStorage.setItem(storageKey(post.id), JSON.stringify(post));
}

export function getUnlockedQaPost(id) {
  const raw = sessionStorage.getItem(storageKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isQaPostUnlocked(id) {
  return Boolean(getUnlockedQaPost(id));
}

export function clearUnlockedQaPost(id) {
  sessionStorage.removeItem(storageKey(id));
  sessionStorage.removeItem(passwordKey(id));
}

export function storeQaPassword(id, password) {
  if (!id || !password) return;
  sessionStorage.setItem(passwordKey(id), password);
}

export function getQaPassword(id) {
  return sessionStorage.getItem(passwordKey(id)) || "";
}
