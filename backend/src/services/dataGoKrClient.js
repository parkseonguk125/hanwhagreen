export function hasDataGoKrKey() {
  return Boolean(process.env.DATA_GO_KR_SERVICE_KEY?.trim());
}

export function getDataGoKrKey() {
  // .env에 따옴표/공백이 섞여 붙는 경우 제거 (401 방지)
  const key = process.env.DATA_GO_KR_SERVICE_KEY?.trim().replace(/^["']|["']$/g, "");
  if (!key) {
    const error = new Error("DATA_GO_KR_SERVICE_KEY가 설정되지 않았습니다.");
    error.statusCode = 503;
    throw error;
  }
  return key;
}

/**
 * 공공데이터포털 OpenAPI 호출 (serviceKey는 서버 env에서만 사용)
 * Decoding 키는 재인코딩하면 401이 날 수 있어 serviceKey만 그대로 붙입니다.
 */
export async function fetchDataGoKr(baseUrl, params = {}) {
  const serviceKey = getDataGoKrKey();
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
  const qs = url.searchParams.toString();
  const requestUrl = `${url.origin}${url.pathname}?${qs ? `${qs}&` : ""}serviceKey=${serviceKey}`;

  const response = await fetch(requestUrl);
  if (!response.ok) {
    const error = new Error(`공공데이터 API HTTP ${response.status}`);
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();
  const resultCode = data?.response?.header?.resultCode;
  const resultMsg = data?.response?.header?.resultMsg;

  if (resultCode !== "00") {
    const error = new Error(resultMsg || `공공데이터 API 오류 (${resultCode})`);
    error.statusCode = 502;
    error.resultCode = resultCode;
    throw error;
  }

  return data;
}

export function extractItems(data) {
  const itemsNode = data?.response?.body?.items;
  if (!itemsNode) return [];

  // 에어코리아 등: items가 배열로 바로 옴
  if (Array.isArray(itemsNode)) return itemsNode;

  const items = itemsNode.item;
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}
