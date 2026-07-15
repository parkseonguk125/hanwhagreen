import rateLimit from "express-rate-limit";
import { notifySecurityEvent } from "../services/securityNotify.js";
import { getClientIp, logSecurityEvent } from "./securityLogger.js";

const windowMs = Number(process.env.SECURITY_LOGIN_WINDOW_MS ?? 15 * 60 * 1000);
const max = Number(process.env.SECURITY_LOGIN_MAX ?? 10);
const lockoutMs = Number(process.env.SECURITY_LOGIN_LOCKOUT_MS ?? 5 * 60 * 1000);
const lockoutSeconds = Math.max(1, Math.ceil(lockoutMs / 1000));

export const loginRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  handler: (req, res) => {
    const ip = getClientIp(req);
    logSecurityEvent({
      event: "login_rate_limited",
      severity: 2,
      ip,
      detail: `windowMs=${windowMs} max=${max}`,
    });
    notifySecurityEvent({
      severity: 2,
      key: `login_rate_limit:${ip}`,
      title: "S2 주의: 로그인 무차별 대입 차단",
      detail: `IP ${ip} — ${windowMs / 60000}분 내 ${max}회 초과`,
      hint: "./scripts/security-block-ip.sh " + ip,
    }).catch((err) => {
      console.error("[security] notify failed:", err.message);
    });
    res.set("Retry-After", String(lockoutSeconds));
    res.status(429).json({
      code: "LOGIN_RATE_LIMITED",
      retryAfterSeconds: lockoutSeconds,
      message: `로그인 가능 횟수를 초과했습니다. ${Math.ceil(lockoutMs / 60000)}분 후에 다시 로그인해 주세요.`,
    });
  },
});
