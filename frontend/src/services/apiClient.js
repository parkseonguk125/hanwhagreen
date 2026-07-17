const PRIMARY_API = "/api";
const FALLBACK_API = import.meta.env.VITE_API_FALLBACK || "http://127.0.0.1:3001/api";

function buildUrl(base, path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

function shouldRetry(response) {
  return response.status >= 500;
}

function isLocalDevHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

/** localhost 프록시 충돌 시 직접 API 포트로 재시도 (운영 HTTPS에서는 사용하지 않음) */
export async function apiFetch(path, options = {}) {
  const bases = isLocalDevHost() ? [PRIMARY_API, FALLBACK_API] : [PRIMARY_API];
  let lastResponse;
  let lastError;

  for (let index = 0; index < bases.length; index += 1) {
    const url = buildUrl(bases[index], path);
    try {
      const response = await fetch(url, options);
      if (shouldRetry(response) && index < bases.length - 1) {
        lastResponse = response;
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (index < bases.length - 1) continue;
    }
  }

  if (lastResponse) return lastResponse;
  throw lastError || new Error("네트워크 오류가 발생했습니다.");
}
