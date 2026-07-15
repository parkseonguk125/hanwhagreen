export function hasDataGoKrKey() {
  return Boolean(process.env.DATA_GO_KR_SERVICE_KEY?.trim());
}

export function getDataGoKrKey() {
  const key = process.env.DATA_GO_KR_SERVICE_KEY?.trim();
  if (!key) {
    const error = new Error("DATA_GO_KR_SERVICE_KEY가 설정되지 않았습니다.");
    error.statusCode = 503;
    throw error;
  }
  return key;
}

/**
 * 공공데이터포털 OpenAPI 호출 (serviceKey는 서버 env에서만 사용)
 */
export async function fetchDataGoKr(baseUrl, params = {}) {
  const serviceKey = getDataGoKrKey();
  const url = new URL(baseUrl);
  url.searchParams.set("serviceKey", serviceKey);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString());
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
