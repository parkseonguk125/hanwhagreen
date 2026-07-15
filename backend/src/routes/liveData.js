import { Router } from "express";
import { hasDataGoKrKey } from "../services/dataGoKrClient.js";
import { hasKisCredentials } from "../services/kisClient.js";
import { getCacheStats } from "../services/liveDataCache.js";
import { getNationwideAirQuality } from "../services/airQualityService.js";
import {
  getWatchlistStocks,
  isKoreanMarketOpen,
  NAVER_POLL_INTERVAL_MS,
} from "../services/stockService.js";
import { getNationwideWeather } from "../services/weatherService.js";

const router = Router();

function handleLiveError(res, error) {
  const status = error.statusCode || 500;
  res.status(status).json({
    message: error.message || "실시간 정보를 불러오지 못했습니다.",
    resultCode: error.resultCode,
  });
}

router.get("/status", (_req, res) => {
  res.json({
    dataGoKrKeyConfigured: hasDataGoKrKey(),
    kisKeyConfigured: hasKisCredentials(),
    marketOpen: isKoreanMarketOpen(),
    weatherPollIntervalMs: 10 * 60 * 1000,
    airQualityPollIntervalMs: 30 * 60 * 1000,
    stockPollIntervalMs: hasKisCredentials()
      ? isKoreanMarketOpen()
        ? 30_000
        : 0
      : NAVER_POLL_INTERVAL_MS,
    cache: getCacheStats(),
  });
});

router.get("/weather", async (_req, res) => {
  try {
    const data = await getNationwideWeather();
    res.json(data);
  } catch (error) {
    handleLiveError(res, error);
  }
});

router.get("/air-quality", async (_req, res) => {
  try {
    const data = await getNationwideAirQuality();
    res.json(data);
  } catch (error) {
    handleLiveError(res, error);
  }
});

router.get("/stocks", async (_req, res) => {
  try {
    const data = await getWatchlistStocks();
    res.json(data);
  } catch (error) {
    handleLiveError(res, error);
  }
});

export default router;
