import { Router } from "express";
import {
  createMemberSession,
  deleteMemberSession,
  getMemberBySession,
  verifyMemberLogin,
} from "../db.js";
import { loginRateLimiter } from "../middleware/loginRateLimit.js";
import { getClientIp, logSecurityEvent } from "../middleware/securityLogger.js";

const router = Router();
const FAILED_NOTIFY_THRESHOLD = Number(process.env.SECURITY_FAILED_LOGIN_NOTIFY ?? 5);
const failedAttemptsByIp = new Map();

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return null;
}

function trackFailedLogin(ip, mb_id) {
  const count = (failedAttemptsByIp.get(ip) || 0) + 1;
  failedAttemptsByIp.set(ip, count);
  logSecurityEvent({
    event: "login_failed",
    severity: count >= FAILED_NOTIFY_THRESHOLD ? 2 : 1,
    ip,
    mb_id,
    detail: `attempt=${count}`,
  });
  if (count === FAILED_NOTIFY_THRESHOLD) {
    import("../services/securityNotify.js").then(({ notifySecurityEvent }) =>
      notifySecurityEvent({
        severity: 2,
        key: `login_failed:${ip}`,
        title: "로그인 반복 실패",
        detail: `IP ${ip}, 계정 ${mb_id || "?"} — ${count}회 실패`,
        hint: "docker compose logs api --tail 50 | grep security",
      })
    ).catch((err) => console.error("[security] notify failed:", err.message));
  }
}

router.post("/login", loginRateLimiter, async (req, res, next) => {
  try {
    const { mb_id, mb_password, auto_login } = req.body || {};
    const ip = getClientIp(req);

    if (!mb_id?.trim() || !mb_password?.trim()) {
      res.status(400).json({ message: "아이디와 비밀번호를 입력해 주세요." });
      return;
    }

    const member = await verifyMemberLogin(mb_id.trim(), mb_password);
    if (!member) {
      trackFailedLogin(ip, mb_id.trim());
      res.status(401).json({ message: "회원 아이디 또는 비밀번호가 잘못 되었습니다." });
      return;
    }

    failedAttemptsByIp.delete(ip);

    const { token, expiresAt } = await createMemberSession(
      member.mb_id,
      Boolean(auto_login)
    );

    res.json({
      token,
      expiresAt,
      member: {
        id: member.mb_id,
        name: member.mb_name,
        level: member.mb_level,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      res.status(401).json({ message: "로그인이 필요합니다." });
      return;
    }

    const member = await getMemberBySession(token);
    if (!member) {
      res.status(401).json({ message: "로그인이 만료되었습니다." });
      return;
    }

    res.json({
      member: {
        id: member.mb_id,
        name: member.mb_name,
        level: member.mb_level,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (token) {
      await deleteMemberSession(token);
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
