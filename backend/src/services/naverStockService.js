import { WATCHLIST_STOCKS } from "../config/watchlistStocks.js";
import { getCached, setCached } from "./liveDataCache.js";
import { formatKstTime, getKstNow, isKoreanMarketOpen } from "../utils/marketHours.js";

const NAVER_REALTIME_URL = "https://polling.finance.naver.com/api/realtime";
const CACHE_LIVE_MS = 12_000;
const CACHE_CLOSED_MS = 60_000;
export const NAVER_POLL_INTERVAL_MS = 15_000;

const MARKET_STATUS_LABEL = {
  OPEN: "장중",
  CLOSE: "장마감",
  PREOPEN: "장전",
};

function sortWatchlist(stocks) {
  stocks.sort(
    (a, b) =>
      WATCHLIST_STOCKS.findIndex((w) => w.code === a.code) -
      WATCHLIST_STOCKS.findIndex((w) => w.code === b.code)
  );
  return stocks;
}

function resolveDirection(change) {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

function mapNaverItem(item, fallbackName) {
  const price = Number(item.sv);
  const previousClose = Number(item.nv);
  const high = Number(item.hv);
  const low = Number(item.lv);
  const change =
    Number.isFinite(price) && Number.isFinite(previousClose) ? price - previousClose : null;
  const rawChangeRate = Number(item.cr);
  const direction = change != null ? resolveDirection(change) : "flat";
  /* 네이버 cr은 절댓값인 경우가 있어 등락 방향으로 부호 보정 */
  const changeRate = Number.isFinite(rawChangeRate)
    ? direction === "down"
      ? -Math.abs(rawChangeRate)
      : direction === "up"
        ? Math.abs(rawChangeRate)
        : 0
    : null;

  let rangePosition = null;
  if (Number.isFinite(price) && Number.isFinite(high) && Number.isFinite(low) && high > low) {
    rangePosition = Math.min(100, Math.max(0, ((price - low) / (high - low)) * 100));
  }

  return {
    code: item.cd,
    /* 네이버 nm은 EUC-KR/깨진 UTF-8로 오는 경우가 있어 워치리스트 명칭을 사용 */
    name: fallbackName,
    closePrice: Number.isFinite(price) ? price : null,
    previousClose: Number.isFinite(previousClose) ? previousClose : null,
    change,
    changeRate,
    direction,
    high: Number.isFinite(high) ? high : null,
    low: Number.isFinite(low) ? low : null,
    marketStatus: item.ms || null,
    rangePosition,
    unavailable: false,
  };
}

async function fetchNaverQuoteMap() {
  const codes = WATCHLIST_STOCKS.map((stock) => stock.code).join(",");
  const url = `${NAVER_REALTIME_URL}?query=SERVICE_ITEM:${codes}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://finance.naver.com/",
      Accept: "*/*",
      "Accept-Language": "ko-KR,ko;q=0.9",
    },
  });

  if (!response.ok) {
    const error = new Error(`네이버 금융 시세 조회 실패 (${response.status})`);
    error.statusCode = response.status;
    throw error;
  }

  const body = await response.json();
  if (body.resultCode !== "success" || !body.result?.areas?.[0]?.datas) {
    throw new Error("네이버 금융 시세 응답 형식이 올바르지 않습니다.");
  }

  const map = new Map();
  for (const item of body.result.areas[0].datas) {
    map.set(item.cd, item);
  }
  return map;
}

export async function getWatchlistStocksFromNaver() {
  const marketOpen = isKoreanMarketOpen();
  const cacheKey = "live:stocks:naver";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const quoteMap = await fetchNaverQuoteMap();
  const stocks = WATCHLIST_STOCKS.map((watch) => {
    const item = quoteMap.get(watch.code);
    if (!item) {
      return {
        code: watch.code,
        name: watch.name,
        closePrice: null,
        change: null,
        changeRate: null,
        direction: "flat",
        unavailable: true,
      };
    }
    return mapNaverItem(item, watch.name);
  });

  const sampleStatus = stocks.find((stock) => stock.marketStatus)?.marketStatus;
  const statusLabel = MARKET_STATUS_LABEL[sampleStatus] || (marketOpen ? "장중" : "장마감");
  const now = getKstNow();

  const result = {
    updatedAt: new Date().toISOString(),
    source: "naver",
    live: true,
    marketOpen,
    pollIntervalMs: NAVER_POLL_INTERVAL_MS,
    priceLabel: "현재가",
    basDtDisplay: marketOpen ? `실시간 ${formatKstTime(now)}` : statusLabel,
    marketStatusLabel: statusLabel,
    note: null,
    stocks: sortWatchlist(stocks),
  };

  setCached(cacheKey, result, marketOpen ? CACHE_LIVE_MS : CACHE_CLOSED_MS);
  return result;
}
