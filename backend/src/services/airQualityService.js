import { LIVE_REGIONS } from "../config/liveRegions.js";
import { extractItems, fetchDataGoKr } from "./dataGoKrClient.js";
import { getCached, setCached } from "./liveDataCache.js";

const AIR_URL =
  "http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty";

const GRADE_LABELS = { 1: "좋음", 2: "보통", 3: "나쁨", 4: "매우나쁨" };

const AIR_CACHE_TTL_MS = 30 * 60 * 1000;
const AIR_POLL_INTERVAL_MS = AIR_CACHE_TTL_MS;

function parseValue(value) {
  if (value == null || value === "-" || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function parseGrade(grade) {
  const num = Number(grade);
  if (!Number.isFinite(num) || num < 1 || num > 4) return null;
  return { grade: num, label: GRADE_LABELS[num] };
}

function summarizeRegionItems(items) {
  const validPm10 = items.map((i) => parseValue(i.pm10Value)).filter((v) => v != null);
  const validPm25 = items.map((i) => parseValue(i.pm25Value)).filter((v) => v != null);
  const validKhai = items.map((i) => parseValue(i.khaiValue)).filter((v) => v != null);

  const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null);

  const pm10Grade = parseGrade(
    items.find((i) => i.pm10Grade && i.pm10Grade !== "-")?.pm10Grade
  );
  const pm25Grade = parseGrade(
    items.find((i) => i.pm25Grade && i.pm25Grade !== "-")?.pm25Grade
  );

  return {
    pm10: avg(validPm10),
    pm25: avg(validPm25),
    khai: avg(validKhai),
    pm10Grade: pm10Grade?.label || "측정불가",
    pm25Grade: pm25Grade?.label || "측정불가",
    stationCount: items.length,
  };
}

async function fetchRegionAirQuality(region) {
  const data = await fetchDataGoKr(AIR_URL, {
    pageNo: 1,
    numOfRows: 500,
    returnType: "json",
    sidoName: region.sidoName,
    ver: "1.3",
  });
  const items = extractItems(data);
  const summary = summarizeRegionItems(items);
  return { name: region.name, ...summary };
}

export async function getNationwideAirQuality() {
  const cacheKey = "live:air-quality";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const regions = await Promise.all(LIVE_REGIONS.map((region) => fetchRegionAirQuality(region)));

  const result = {
    updatedAt: new Date().toISOString(),
    pollIntervalMs: AIR_POLL_INTERVAL_MS,
    regions,
  };

  setCached(cacheKey, result, AIR_CACHE_TTL_MS);
  return result;
}
