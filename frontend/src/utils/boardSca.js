/** gnuboard sca 파라미터 인코딩 (+ 구분 유지) */
export function encodeScaParam(sca) {
  if (!sca) return "";
  return sca.split("+").map((part) => encodeURIComponent(part)).join("+");
}

export function normalizeSca(value) {
  return decodeURIComponent(String(value || "").replace(/\+/g, "%20"))
    .replace(/\s+/g, " ")
    .trim();
}

export function scaMatches(activeSca, categorySca) {
  return normalizeSca(activeSca) === normalizeSca(categorySca);
}

export function buildBoardUrl(table, { page = 1, sca = "" } = {}) {
  const params = new URLSearchParams({ bo_table: table });
  let url = `/bbs/board.php?${params.toString()}`;
  if (sca) url += `&sca=${encodeScaParam(sca)}`;
  if (page > 1) url += `&page=${page}`;
  return url;
}
