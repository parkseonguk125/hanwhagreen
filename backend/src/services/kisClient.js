const REAL_BASE_URL = "https://openapi.koreainvestment.com:9443";
const VTS_BASE_URL = "https://openapivts.koreainvestment.com:29443";

const INQUIRE_PRICE_TR_ID = "FHKST01010100";

let tokenCache = { accessToken: null, expiresAt: 0 };

function getBaseUrl() {
  return process.env.KIS_USE_VTS === "1" ? VTS_BASE_URL : REAL_BASE_URL;
}

export function hasKisCredentials() {
  return Boolean(process.env.KIS_APP_KEY?.trim() && process.env.KIS_APP_SECRET?.trim());
}

async function parseJsonResponse(res) {
  const body = await res.json();
  if (!res.ok) {
    const message = body.error_description || body.msg1 || body.message || res.statusText;
    const error = new Error(message || "KIS API 요청 실패");
    error.statusCode = res.status;
    throw error;
  }
  if (body.rt_cd && body.rt_cd !== "0") {
    const error = new Error(body.msg1 || body.msg_cd || "KIS API 오류");
    error.resultCode = body.msg_cd;
    throw error;
  }
  return body;
}

async function getAccessToken() {
  const now = Date.now();
  if (tokenCache.accessToken && now < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }

  const res = await fetch(`${getBaseUrl()}/oauth2/tokenP`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      appkey: process.env.KIS_APP_KEY,
      appsecret: process.env.KIS_APP_SECRET,
    }),
  });

  const data = await parseJsonResponse(res);
  if (!data.access_token) {
    throw new Error("KIS access_token을 받지 못했습니다.");
  }

  const expiresInSec = Number(data.expires_in) || 86_400;
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + expiresInSec * 1000,
  };
  return tokenCache.accessToken;
}

function parseSignedChange(output) {
  const raw = Number(output.prdy_vrss);
  if (!Number.isFinite(raw)) return null;

  const sign = String(output.prdy_vrss_sign || "");
  if (sign === "4" || sign === "5") return -Math.abs(raw);
  if (sign === "3") return 0;
  return Math.abs(raw);
}

export function mapKisPriceOutput(code, fallbackName, output) {
  const price = Number(output.stck_prpr);
  const change = parseSignedChange(output);
  const changeRate = Number(output.prdy_ctrt);

  return {
    code,
    name: output.hts_kor_isnm || fallbackName,
    closePrice: Number.isFinite(price) ? price : null,
    change: change != null ? change : null,
    changeRate: Number.isFinite(changeRate) ? changeRate : null,
    market: output.rprs_mrkt_kor_name || output.bstp_kor_isnm || null,
    basDt: output.stck_bsop_date || null,
  };
}

export async function fetchKisCurrentPrice(code, fallbackName) {
  const token = await getAccessToken();
  const url = new URL(`${getBaseUrl()}/uapi/domestic-stock/v1/quotations/inquire-price`);
  url.searchParams.set("FID_COND_MRKT_DIV_CODE", "J");
  url.searchParams.set("FID_INPUT_ISCD", code);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      authorization: `Bearer ${token}`,
      appkey: process.env.KIS_APP_KEY,
      appsecret: process.env.KIS_APP_SECRET,
      tr_id: INQUIRE_PRICE_TR_ID,
      custtype: "P",
    },
  });

  const data = await parseJsonResponse(res);
  if (!data.output) {
    throw new Error(`종목 ${code} 시세 응답이 비어 있습니다.`);
  }

  return mapKisPriceOutput(code, fallbackName, data.output);
}
