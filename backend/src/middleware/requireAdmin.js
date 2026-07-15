import { getMemberBySession } from "../db.js";

const ADMIN_LEVEL = 10;

export function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return null;
}

export async function attachAdminIfPresent(req) {
  const token = getBearerToken(req);
  if (!token) return false;

  const member = await getMemberBySession(token);
  if (!member || member.mb_level < ADMIN_LEVEL) return false;

  req.member = member;
  return true;
}

export async function requireAdmin(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      res.status(401).json({ message: "관리자 로그인이 필요합니다." });
      return;
    }

    const member = await getMemberBySession(token);
    if (!member || member.mb_level < ADMIN_LEVEL) {
      res.status(403).json({ message: "관리자만 할 수 있습니다." });
      return;
    }

    req.member = member;
    next();
  } catch (error) {
    next(error);
  }
}
