import { apiFetch } from "./apiClient.js";

async function parseJson(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `API 오류 (${response.status})`);
  }
  return response.json();
}

export function fetchLiveWeather() {
  return apiFetch("/live/weather").then(parseJson);
}

export function fetchLiveAirQuality() {
  return apiFetch("/live/air-quality").then(parseJson);
}

export function fetchLiveStocks() {
  return apiFetch("/live/stocks").then(parseJson);
}

export function fetchLiveStatus() {
  return apiFetch("/live/status").then(parseJson);
}
