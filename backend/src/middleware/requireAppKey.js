const APP_KEY_HEADER = "x-app-key";

export function getAppKeyFromRequest(req) {
  const header = req.headers[APP_KEY_HEADER];
  if (typeof header === "string" && header.trim()) {
    return header.trim();
  }
  return null;
}

export function requireAppKey(req, res, next) {
  const expected = process.env.ATTENDANCE_APP_API_KEY?.trim();
  if (!expected) {
    res.status(503).json({ message: "출결 API 키가 서버에 설정되지 않았습니다." });
    return;
  }

  const provided = getAppKeyFromRequest(req);
  if (!provided) {
    res.status(401).json({ message: "앱 API 키(X-App-Key)가 필요합니다." });
    return;
  }

  if (provided !== expected) {
    res.status(403).json({ message: "앱 API 키가 올바르지 않습니다." });
    return;
  }

  next();
}
