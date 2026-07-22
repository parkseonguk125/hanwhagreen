export function contentRoute(coId) {
  return `/bbs/content.php?co_id=${coId}`;
}

export const subNavGroups = [
  { title: "회사소개", href: contentRoute("company") },
  { title: "보유기술", href: contentRoute("technology") },
  { title: "회사실적", href: contentRoute("construction") },
  { title: "인증·특허", href: "/bbs/board.php?bo_table=certification" },
  { title: "고객센터", href: "/bbs/board.php?bo_table=qa" },
];

export const allSubMenus = [
  [
    { label: "회사소개", href: contentRoute("company") },
    { label: "인사말", href: contentRoute("ceo") },
    { label: "오시는길", href: contentRoute("map") },
  ],
  [{ label: "보유기술", href: contentRoute("technology") }],
  [
    { label: "공사실적", href: contentRoute("construction") },
    { label: "주요실적", href: "/bbs/board.php?bo_table=project" },
  ],
  [{ label: "인증서", href: "/bbs/board.php?bo_table=certification" }],
  [
    { label: "공지사항", href: "/bbs/board.php?bo_table=notice" },
    { label: "온라인문의", href: "/bbs/board.php?bo_table=qa" },
    { label: "출결서비스", href: "/bbs/board.php?bo_table=attendance" },
  ],
];

export const customerSubItems = allSubMenus[4];

export function parseAppHref(href) {
  if (!href?.startsWith("/")) return null;
  const url = new URL(href, "http://local");
  return {
    pathname: url.pathname,
    search: url.search,
  };
}

export function boardTableFromHref(href) {
  const parsed = parseAppHref(href);
  if (!parsed) return null;
  return new URLSearchParams(parsed.search).get("bo_table");
}

export function contentCoIdFromHref(href) {
  const parsed = parseAppHref(href);
  if (!parsed || parsed.pathname !== "/bbs/content.php") return null;
  return new URLSearchParams(parsed.search).get("co_id");
}

export function boardRouteTarget(table) {
  return parseAppHref(`/bbs/board.php?bo_table=${table}`);
}

export function boardViewRouteTarget(table, id) {
  return parseAppHref(`/bbs/board.php?bo_table=${table}&wr_id=${id}`);
}

export function contentRouteTarget(coId) {
  return parseAppHref(contentRoute(coId));
}

export function boardPasswordRouteTarget(table, id, mode = "s") {
  return parseAppHref(`/bbs/password.php?w=${mode}&bo_table=${table}&wr_id=${id}`);
}

export function boardWriteRouteTarget(table, { wrId, mode } = {}) {
  const params = new URLSearchParams({ bo_table: table });
  if (mode === "u" && wrId) {
    params.set("w", "u");
    params.set("wr_id", String(wrId));
  }
  return parseAppHref(`/bbs/write.php?${params.toString()}`);
}
