import { WATCHLIST_STOCKS } from "../config/watchlistStocks.js";
import { extractItems, fetchDataGoKr } from "./dataGoKrClient.js";
import { fetchKisCurrentPrice, hasKisCredentials } from "./kisClient.js";
import {
  getWatchlistStocksFromNaver,
  NAVER_POLL_INTERVAL_MS,
} from "./naverStockService.js";
import { getCached, setCached } from "./liveDataCache.js";
import { formatKstTime, getKstNow, isKoreanMarketOpen, isWeekend } from "../utils/marketHours.js";

const STOCK_URL =
  "https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo";

const DATA_GO_KR_CACHE_TTL_MS = 60 * 60 * 1000;
const KIS_CACHE_LIVE_MS = Number(process.env.KIS_STOCK_CACHE_MS) || 30_000;
const KIS_CACHE_CLOSED_MS = 5 * 60 * 1000;
const LIVE_POLL_INTERVAL_MS = 30_000;

function formatBasDt(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
}

/** 최근 영업일 basDt (주말·공휴일 미반영 — 단순 주말만 제외) */
export function getRecentBusinessBasDt(now = getKstNow()) {
  const date = new Date(now);
  while (isWeekend(date)) {
    date.setDate(date.getDate() - 1);
  }
  return formatBasDt(date);
}

function basDtToDate(basDt) {
  const y = Number(basDt.slice(0, 4));
  const m = Number(basDt.slice(4, 6)) - 1;
  const d = Number(basDt.slice(6, 8));
  return new Date(y, m, d);
}

/** basDt에서 이전 영업일 (주말 건너뜀) */
function previousBusinessBasDt(basDt) {
  const date = basDtToDate(basDt);
  do {
    date.setDate(date.getDate() - 1);
  } while (isWeekend(date));
  return formatBasDt(date);
}

async function resolveDataGoKrStocks(maxLookback = 10) {
  let basDt = getRecentBusinessBasDt();
  let bestBasDt = basDt;
  let bestStocks = [];

  for (let attempt = 0; attempt < maxLookback; attempt += 1) {
    const stocks = await fetchStocksForBasDt(basDt);
    if (stocks.length > bestStocks.length) {
      bestStocks = stocks;
      bestBasDt = basDt;
    }
    if (stocks.length >= WATCHLIST_STOCKS.length) {
      return { basDt, stocks };
    }
    basDt = previousBusinessBasDt(basDt);
  }

  return { basDt: bestBasDt, stocks: bestStocks };
}

function formatBasDtDisplay(basDt) {
  return `${basDt.slice(0, 4)}-${basDt.slice(4, 6)}-${basDt.slice(6, 8)}`;
}

function sortWatchlist(stocks) {
  stocks.sort(
    (a, b) =>
      WATCHLIST_STOCKS.findIndex((w) => w.code === a.code) -
      WATCHLIST_STOCKS.findIndex((w) => w.code === b.code)
  );
  return stocks;
}

function mapDataGoKrStockItem(item) {
  const change = Number(item.vs);
  const rate = Number(item.fltRt);
  return {
    code: item.srtnCd,
    name: item.itmsNm,
    closePrice: Number(item.clpr),
    change: Number.isFinite(change) ? change : 0,
    changeRate: Number.isFinite(rate) ? rate : 0,
    basDt: item.basDt,
    basDtDisplay: formatBasDtDisplay(item.basDt),
    market: item.mrktCtg,
  };
}

async function fetchStocksForBasDt(basDt) {
  const data = await fetchDataGoKr(STOCK_URL, {
    numOfRows: 3000,
    pageNo: 1,
    resultType: "json",
    basDt,
  });
  const items = extractItems(data);
  const codeSet = new Set(WATCHLIST_STOCKS.map((s) => s.code));
  return items.filter((item) => codeSet.has(item.srtnCd)).map(mapDataGoKrStockItem);
}

async function getWatchlistStocksFromDataGoKr() {
  const cacheKey = "live:stocks:data";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const requestedBasDt = getRecentBusinessBasDt();
  const { basDt, stocks: resolvedStocks } = await resolveDataGoKrStocks();
  let stocks = resolvedStocks;

  const foundCodes = new Set(stocks.map((s) => s.code));
  for (const watch of WATCHLIST_STOCKS) {
    if (!foundCodes.has(watch.code)) {
      stocks.push({
        code: watch.code,
        name: watch.name,
        closePrice: null,
        change: null,
        changeRate: null,
        basDt,
        basDtDisplay: formatBasDtDisplay(basDt),
        market: null,
        unavailable: true,
      });
    }
  }

  const staleData = basDt !== requestedBasDt;
  const result = {
    updatedAt: new Date().toISOString(),
    source: "dataGoKr",
    live: false,
    marketOpen: isKoreanMarketOpen(),
    pollIntervalMs: 0,
    priceLabel: "종가",
    basDt,
    basDtDisplay: formatBasDtDisplay(basDt),
    note: staleData
      ? `금융위원회 종가 — ${formatBasDtDisplay(basDt)} 기준 (당일 데이터 미반영)`
      : "금융위원회 주식시세정보 기준 — 전일 영업일 종가 (실시간 호가 아님)",
    stocks: sortWatchlist(stocks),
  };

  setCached(cacheKey, result, DATA_GO_KR_CACHE_TTL_MS);
  return result;
}

async function getWatchlistStocksFromKis() {
  const marketOpen = isKoreanMarketOpen();
  const cacheKey = "live:stocks:kis";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const now = getKstNow();
  const results = await Promise.all(
    WATCHLIST_STOCKS.map(async (watch) => {
      try {
        const stock = await fetchKisCurrentPrice(watch.code, watch.name);
        return {
          ...stock,
          basDtDisplay: stock.basDt ? formatBasDtDisplay(stock.basDt) : null,
          unavailable: false,
        };
      } catch (error) {
        return {
          code: watch.code,
          name: watch.name,
          closePrice: null,
          change: null,
          changeRate: null,
          basDt: null,
          basDtDisplay: null,
          market: null,
          unavailable: true,
          error: error.message,
        };
      }
    })
  );

  const result = {
    updatedAt: new Date().toISOString(),
    source: "kis",
    live: marketOpen,
    marketOpen,
    pollIntervalMs: marketOpen ? LIVE_POLL_INTERVAL_MS : 0,
    priceLabel: "현재가",
    basDt: formatBasDt(now),
    basDtDisplay: marketOpen
      ? `실시간 ${formatKstTime(now)}`
      : `장 마감 · ${formatBasDtDisplay(getRecentBusinessBasDt(now))}`,
    note: marketOpen
      ? "한국투자증권 Open API 현재가 (장중 약 30초마다 갱신)"
      : "한국투자증권 Open API — 장 마감 후 마지막 체결가",
    stocks: sortWatchlist(results),
  };

  setCached(cacheKey, result, marketOpen ? KIS_CACHE_LIVE_MS : KIS_CACHE_CLOSED_MS);
  return result;
}

export async function getWatchlistStocks() {
  if (hasKisCredentials()) {
    try {
      return await getWatchlistStocksFromKis();
    } catch (error) {
      console.error("[stocks] KIS 조회 실패, 네이버 시세로 대체:", error.message);
      try {
        const naver = await getWatchlistStocksFromNaver();
        return {
          ...naver,
          fallback: true,
          note: `KIS 조회 실패 — 네이버 금융 시세로 표시`,
        };
      } catch (naverError) {
        console.error("[stocks] 네이버 조회 실패, 공공데이터로 대체:", naverError.message);
        const fallback = await getWatchlistStocksFromDataGoKr();
        return {
          ...fallback,
          fallback: true,
          note: `실시간 조회 실패 — 공공데이터 종가로 표시`,
        };
      }
    }
  }

  try {
    return await getWatchlistStocksFromNaver();
  } catch (error) {
    console.error("[stocks] 네이버 조회 실패, 공공데이터로 대체:", error.message);
    const fallback = await getWatchlistStocksFromDataGoKr();
    return {
      ...fallback,
      fallback: true,
      note: `네이버 시세 조회 실패 — 공공데이터 종가로 표시`,
    };
  }
}

export { NAVER_POLL_INTERVAL_MS };

export { hasKisCredentials, isKoreanMarketOpen };
