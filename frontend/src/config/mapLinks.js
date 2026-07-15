/** 한화그린 본사 — 경북 칠곡군 가산면 송학5길 57-1 (Daum 지도 roughmap 기준) */
export const HANWHA_GREEN_LOCATION = {
  name: "한화그린",
  lng: 128.5198071,
  lat: 36.1074943,
  address: "경북 칠곡군 가산면 송학5길 57-1",
};

/**
 * 네이버 지도 길찾기 URL (좌표 기반).
 *
 * `/p/directions/-/3Akm5F,2zMPrV,...` 형식의 코드(3Akm5F 등)는
 * 네이버가 길찾기 화면에서 임시로 만든 세션용 참조값이라
 * 다른 PC·브라우저에서는 해석되지 않고 기본 위치(서울)로 열리는 경우가 많음.
 *
 * hanwhagreen.com 원본 푸터와 동일하게 elng/elat 좌표를 사용한다.
 */
export function getNaverDirectionsUrl(location = HANWHA_GREEN_LOCATION) {
  const params = new URLSearchParams({
    elng: String(location.lng),
    elat: String(location.lat),
    etext: location.name,
    menu: "route",
    pathType: "0",
  });
  return `https://map.naver.com/index.nhn?${params.toString()}`;
}

export const HANWHA_GREEN_NAVER_DIRECTIONS_URL = getNaverDirectionsUrl();
