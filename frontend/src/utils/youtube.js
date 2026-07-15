export function getYoutubeVideoId(url) {
  if (!url) return null;

  const embedMatch = url.match(/youtube\.com\/embed\/([^?&/]+)/i);
  if (embedMatch) return embedMatch[1];

  const watchMatch = url.match(/(?:youtube\.com\/watch\?.*v=|youtu\.be\/)([^&?/]+)/i);
  if (watchMatch) return watchMatch[1];

  return null;
}

export function getYoutubeEmbedUrl(url) {
  const videoId = getYoutubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export function getYoutubeWatchUrl(url) {
  const videoId = getYoutubeVideoId(url);
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
}

export function boardLinkUrl(table, wrId, no = 1) {
  return `/bbs/link.php?bo_table=${table}&wr_id=${wrId}&no=${no}`;
}
