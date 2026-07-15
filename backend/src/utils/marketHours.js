function getKstNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** KRX 정규장 09:00~15:30 (공휴일 미반영) */
export function isKoreanMarketOpen(now = getKstNow()) {
  if (isWeekend(now)) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= 9 * 60 && minutes <= 15 * 60 + 30;
}

export function formatKstTime(now = getKstNow()) {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export { getKstNow, isWeekend };
