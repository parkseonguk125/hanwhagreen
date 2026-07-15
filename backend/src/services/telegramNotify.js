export async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error("TELEGRAM_BOT_TOKEN 또는 TELEGRAM_CHAT_ID 가 .env 에 없습니다.");
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    throw new Error(data.description || "텔레그램 sendMessage 실패");
  }

  return data;
}
