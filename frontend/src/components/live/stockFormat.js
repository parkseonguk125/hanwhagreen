/** 홈 핵심 주가 패널 — 가격·등락 포맷 */

export function formatStockPrice(value) {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toLocaleString("ko-KR");
}
export function formatStockChange(change, rate) {
  if (change == null || rate == null) return "—";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toLocaleString("ko-KR")} (${sign}${rate}%)`;
}

export function getNaverFinanceUrl(code) {
  return `https://finance.naver.com/item/main.naver?code=${code}`;
}
