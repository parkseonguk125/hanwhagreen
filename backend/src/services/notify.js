const COOLDOWN_MS = Number(process.env.NOTIFY_COOLDOWN_MS ?? 5 * 60 * 1000);
const lastSent = new Map();

function isEnabled() {
  return process.env.ADMIN_NOTIFY_ENABLED === "1";
}

function provider() {
  return (process.env.NOTIFY_PROVIDER || "kakao").toLowerCase();
}

function shouldSend(key) {
  const now = Date.now();
  const prev = lastSent.get(key) || 0;
  if (now - prev < COOLDOWN_MS) return false;
  lastSent.set(key, now);
  return true;
}

function formatMessage({ title, detail, hint }) {
  const env = process.env.NOTIFY_ENV_LABEL || "local";
  const lines = [
    `[한화그린 ${env}] ${title}`,
    `시각: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`,
  ];
  if (detail) lines.push(`내용: ${detail.slice(0, 300)}`);
  if (hint) lines.push(`조치: ${hint}`);
  return lines.join("\n");
}

async function sendKakao(text) {
  const { sendKakaoMemo } = await import("./kakaoNotify.js");
  return sendKakaoMemo(text);
}

async function sendTelegram(text) {
  const { sendTelegramMessage } = await import("./telegramNotify.js");
  return sendTelegramMessage(text);
}

/**
 * @param {{ key: string, title: string, detail?: string, hint?: string }} payload
 */
export async function notifyAdmin(payload) {
  if (!isEnabled()) return { ok: false, skipped: true, reason: "disabled" };
  if (!shouldSend(payload.key)) {
    return { ok: false, skipped: true, reason: "cooldown" };
  }

  const text = formatMessage(payload);
  const errors = [];

  if (provider() === "kakao" || provider() === "both") {
    try {
      await sendKakao(text);
      console.log("[notify] Kakao sent:", payload.key);
      return { ok: true, channel: "kakao" };
    } catch (error) {
      console.error("[notify] Kakao failed:", error.message);
      errors.push(error);
    }
  }

  if (provider() === "telegram" || provider() === "both" || errors.length) {
    try {
      await sendTelegram(text);
      console.log("[notify] Telegram sent:", payload.key);
      return { ok: true, channel: "telegram" };
    } catch (error) {
      console.error("[notify] Telegram failed:", error.message);
      errors.push(error);
    }
  }

  if (errors.length) {
    throw errors[0];
  }

  return { ok: false, skipped: true, reason: "no_provider" };
}

export async function notifyServerError(err, req) {
  const method = req?.method || "?";
  const url = req?.originalUrl || req?.url || "?";
  return notifyAdmin({
    key: `server_error:${err?.message || "unknown"}`,
    title: "서버 오류 (500)",
    detail: `${method} ${url}\n${err?.message || String(err)}`,
    hint: "docker compose logs api --tail 50",
  });
}

export async function notifyDbFailure(source, detail) {
  return notifyAdmin({
    key: "db_connection_failure",
    title: "DB 연결 실패",
    detail: `${source}\n${detail || ""}`.trim(),
    hint: "docker compose start db",
  });
}

export async function notifyDbRecovered() {
  return notifyAdmin({
    key: "db_connection_recovered",
    title: "DB 연결 복구됨",
    detail: "데이터베이스가 다시 정상입니다.",
    hint: "브라우저에서 공지·로그인을 다시 확인하세요.",
  });
}
