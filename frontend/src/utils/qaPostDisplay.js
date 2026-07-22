const LINK1_RE = /\n\n링크1:\s*(.+)$/m;
const LINK2_RE = /\n\n링크2:\s*(.+)$/m;
const ATTACH_RE = /\n\n\[첨부파일\]\s*(.+?)(?:\s*\([^)]+\))?$/m;

export function normalizeExternalUrl(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;
const VIDEO_EXT_RE = /\.(mp4|webm|ogg|ogv|mov|m4v|avi|mkv|mpeg|mpg|3gp)$/i;

export function isImageAttachmentName(name = "") {
  return IMAGE_EXT_RE.test(String(name).trim());
}

export function isVideoAttachmentName(name = "") {
  return VIDEO_EXT_RE.test(String(name).trim());
}

export function isMediaAttachmentName(name = "") {
  return isImageAttachmentName(name) || isVideoAttachmentName(name);
}

export function parseLegacyQaContent(rawContent = "") {
  let content = (rawContent || "").trim();
  let link1 = "";
  let link2 = "";
  let legacyAttachmentLabel = "";

  const attachMatch = content.match(ATTACH_RE);
  if (attachMatch) {
    legacyAttachmentLabel = attachMatch[1].trim();
    content = content.replace(ATTACH_RE, "").trim();
  }

  const link2Match = content.match(LINK2_RE);
  if (link2Match) {
    link2 = link2Match[1].trim();
    content = content.replace(LINK2_RE, "").trim();
  }

  const link1Match = content.match(LINK1_RE);
  if (link1Match) {
    link1 = link1Match[1].trim();
    content = content.replace(LINK1_RE, "").trim();
  }

  return { content, link1, link2, legacyAttachmentLabel };
}

export function getQaDisplayFields(post) {
  const legacy = parseLegacyQaContent(post.content || "");
  const attachments = Array.isArray(post.attachments)
    ? post.attachments
        .map((item) => ({
          id: item.id,
          name: (item.name || item.attachmentName || "").trim(),
        }))
        .filter((item) => item.name)
    : [];

  const legacyName = (post.attachmentName || "").trim() || legacy.legacyAttachmentLabel;
  if (!attachments.length && legacyName) {
    attachments.push({ id: null, name: legacyName });
  }

  return {
    content: legacy.content,
    link1: (post.link1 || "").trim() || legacy.link1,
    link2: (post.link2 || "").trim() || legacy.link2,
    email: (post.email || "").trim(),
    homepage: (post.homepage || "").trim(),
    attachments,
    attachmentName: attachments[0]?.name || legacyName,
    hasAttachment: Boolean(
      attachments.length || post.hasAttachment || post.attachmentName || legacy.legacyAttachmentLabel
    ),
  };
}
