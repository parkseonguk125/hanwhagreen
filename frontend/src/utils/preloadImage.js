const preloaded = new Set();

/** 배너 등 중요 이미지를 미리 받아 두어 페이지 전환 시 즉시 표시 */
export function preloadImage(url) {
  if (!url || preloaded.has(url)) return;
  preloaded.add(url);

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = url;
  document.head.appendChild(link);
}

/** GNB/푸터 링크 hover 시 해당 콘텐츠 페이지 배너 preload */
export const contentBannerByHref = {
  "/bbs/content.php?co_id=company": "/board-banners/aboutus.webp",
  "/bbs/content.php?co_id=technology": "/board-banners/business.webp",
  "/bbs/content.php?co_id=construction": "/board-banners/construction2.webp",
};

export function preloadBannerForHref(href) {
  const banner = contentBannerByHref[href];
  if (banner) preloadImage(banner);
}
