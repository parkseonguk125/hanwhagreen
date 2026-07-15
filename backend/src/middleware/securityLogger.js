/**
 * 클라이언트 IP (Nginx X-Forwarded-For 우선)
 */
export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return String(forwarded[0]).trim();
  }
  return req.socket?.remoteAddress || req.ip || "unknown";
}

/**
 * @param {{ event: string, severity?: number, ip?: string, detail?: string, mb_id?: string }} payload
 */
export function logSecurityEvent(payload) {
  const ip = payload.ip || "unknown";
  const severity = payload.severity ?? 1;
  const parts = [
    `[security] S${severity}`,
    payload.event,
    `ip=${ip}`,
  ];
  if (payload.mb_id) parts.push(`mb_id=${payload.mb_id}`);
  if (payload.detail) parts.push(payload.detail);
  console.warn(parts.join(" "));
}

export { getClientIp as default };
