let cachedAccessToken = null;
let tokenExpiresAt = 0;

async function refreshAccessToken() {
  const clientId = process.env.KAKAO_REST_API_KEY;
  const refreshToken = process.env.KAKAO_REFRESH_TOKEN;

  if (!clientId || !refreshToken) {
    throw new Error("KAKAO_REST_API_KEY 또는 KAKAO_REFRESH_TOKEN 이 .env 에 없습니다.");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  });
  const clientSecret = process.env.KAKAO_CLIENT_SECRET?.trim();
  if (clientSecret) {
    body.set("client_secret", clientSecret);
  }

  const response = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error_description || data.error || "카카오 토큰 갱신 실패");
  }

  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 21599) * 1000 - 60_000;
  return cachedAccessToken;
}

async function getAccessToken() {
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }
  return refreshAccessToken();
}

export async function sendKakaoMemo(text) {
  const accessToken = await getAccessToken();

  const response = await fetch("https://kapi.kakao.com/v2/api/talk/memo/default/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      template_object: JSON.stringify({
        object_type: "text",
        text,
        link: {
          web_url: process.env.NOTIFY_LINK_URL || "http://localhost:8081",
          mobile_web_url: process.env.NOTIFY_LINK_URL || "http://localhost:8081",
        },
        button_title: "사이트 열기",
      }),
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.msg || data.message || "카카오 나에게 보내기 실패");
  }

  return data;
}
