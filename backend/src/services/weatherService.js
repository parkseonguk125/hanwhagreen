import { LIVE_REGIONS } from "../config/liveRegions.js";
import { extractItems, fetchDataGoKr } from "./dataGoKrClient.js";
import { getCached, setCached } from "./liveDataCache.js";

const NCST_URL =
  "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";
const FCST_URL =
  "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst";

const SKY_LABELS = { 1: "맑음", 3: "구름많음", 4: "흐림" };
const PTY_LABELS = { 0: "없음", 1: "비", 2: "비/눈", 3: "눈", 5: "빗방울", 6: "빗방울눈날림", 7: "눈날림" };

const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;
const WEATHER_POLL_INTERVAL_MS = WEATHER_CACHE_TTL_MS;

function getKstNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
}

function formatBaseDate(kst) {
  return [
    kst.getFullYear(),
    String(kst.getMonth() + 1).padStart(2, "0"),
    String(kst.getDate()).padStart(2, "0"),
  ].join("");
}

/** 기상청 초단기실황 base_date / base_time (매시 10분 이후 해당 정시 데이터) */
export function getWeatherBaseDateTime(now = getKstNow()) {
  const kst = new Date(now);
  if (kst.getMinutes() < 10) {
    kst.setHours(kst.getHours() - 1);
  }
  return {
    baseDate: formatBaseDate(kst),
    baseTime: `${String(kst.getHours()).padStart(2, "0")}00`,
  };
}

/** 초단기예보 base_date / base_time (30분 단위, SKY 제공) */
export function getUltraSrtFcstBaseDateTime(now = getKstNow()) {
  const kst = new Date(now);
  const minute = kst.getMinutes();
  let hour = kst.getHours();

  if (minute < 30) {
    hour -= 1;
    if (hour < 0) {
      kst.setDate(kst.getDate() - 1);
      hour = 23;
    }
  }

  return {
    baseDate: formatBaseDate(kst),
    baseTime: `${String(hour).padStart(2, "0")}${minute >= 30 ? "30" : "00"}`,
  };
}

function parseNcstItems(items) {
  const map = Object.fromEntries(items.map((item) => [item.category, item.obsrValue]));
  const temp = map.T1H != null ? Number(map.T1H) : null;
  const ptyCode = map.PTY != null ? Number(map.PTY) : 0;
  return {
    temp: Number.isFinite(temp) ? temp : null,
    ptyCode,
    pty: ptyCode === 0 ? "없음" : PTY_LABELS[ptyCode] || "없음",
  };
}

function parseSkyFromFcst(items) {
  const skyItems = items
    .filter((item) => item.category === "SKY")
    .sort((a, b) => String(a.fcstTime).localeCompare(String(b.fcstTime)));
  const skyCode = skyItems[0]?.fcstValue != null ? Number(skyItems[0].fcstValue) : null;
  return SKY_LABELS[skyCode] || null;
}

function resolveSkyLabel(skyFromFcst, ptyCode) {
  if (ptyCode > 0) return PTY_LABELS[ptyCode] || "강수";
  return skyFromFcst || "맑음";
}

async function fetchRegionWeather(region, ncstBase, fcstBase) {
  const [ncstData, fcstData] = await Promise.all([
    fetchDataGoKr(NCST_URL, {
      pageNo: 1,
      numOfRows: 100,
      dataType: "JSON",
      base_date: ncstBase.baseDate,
      base_time: ncstBase.baseTime,
      nx: region.nx,
      ny: region.ny,
    }),
    fetchDataGoKr(FCST_URL, {
      pageNo: 1,
      numOfRows: 100,
      dataType: "JSON",
      base_date: fcstBase.baseDate,
      base_time: fcstBase.baseTime,
      nx: region.nx,
      ny: region.ny,
    }),
  ]);

  const ncst = parseNcstItems(extractItems(ncstData));
  const skyFromFcst = parseSkyFromFcst(extractItems(fcstData));

  return {
    name: region.name,
    temp: ncst.temp,
    sky: resolveSkyLabel(skyFromFcst, ncst.ptyCode),
    pty: ncst.pty,
  };
}

export async function getNationwideWeather() {
  const cacheKey = "live:weather";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const ncstBase = getWeatherBaseDateTime();
  const fcstBase = getUltraSrtFcstBaseDateTime();
  const regions = await Promise.all(
    LIVE_REGIONS.map((region) => fetchRegionWeather(region, ncstBase, fcstBase))
  );

  const result = {
    updatedAt: new Date().toISOString(),
    baseDate: ncstBase.baseDate,
    baseTime: ncstBase.baseTime,
    pollIntervalMs: WEATHER_POLL_INTERVAL_MS,
    regions,
  };

  setCached(cacheKey, result, WEATHER_CACHE_TTL_MS);
  return result;
}
