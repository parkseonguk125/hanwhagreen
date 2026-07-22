import { useEffect, useState } from "react";
import {
  downloadQaAttachment,
  fetchQaAttachmentBlob,
} from "../../services/boardApi";
import { getQaPassword } from "../../services/boardAccess";
import {
  isImageAttachmentName,
  isMediaAttachmentName,
  isVideoAttachmentName,
  normalizeExternalUrl,
} from "../../utils/qaPostDisplay";

function ExternalLink({ href, label, children }) {
  const url = normalizeExternalUrl(href);
  if (!url) return null;

  return (
    <li>
      <span className="qa-extra-label">{label}</span>
      <a href={url} target="_blank" rel="noopener noreferrer" className="qa-extra-link">
        {children || url}
      </a>
    </li>
  );
}

function PlainTextItem({ label, value }) {
  const text = (value || "").trim();
  if (!text) return null;

  return (
    <li>
      <span className="qa-extra-label">{label}</span>
      <span className="qa-extra-text">{text}</span>
    </li>
  );
}

function AttachmentItem({ postId, file, index, total }) {
  const label = total > 1 ? `첨부파일 ${index + 1}` : "첨부파일";
  const name = file.name || "첨부파일 다운로드";
  const maybeImage = isImageAttachmentName(name);
  const maybeVideo = isVideoAttachmentName(name);
  const maybeMedia = isMediaAttachmentName(name);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const [playError, setPlayError] = useState(false);

  useEffect(() => {
    if (!maybeMedia) return undefined;

    let active = true;
    let objectUrl = "";
    setPreviewUrl("");
    setPreviewError(false);
    setPlayError(false);

    (async () => {
      try {
        const result = await fetchQaAttachmentBlob(
          postId,
          getQaPassword(postId),
          file.id
        );
        if (!active) {
          URL.revokeObjectURL(result.url);
          return;
        }

        const type = (result.contentType || "").toLowerCase();
        const fileName = result.filename || name;
        const isImage =
          type.startsWith("image/") || isImageAttachmentName(fileName);
        const isVideo =
          type.startsWith("video/") || isVideoAttachmentName(fileName);

        if (!isImage && !isVideo) {
          URL.revokeObjectURL(result.url);
          if (active) setPreviewError(true);
          return;
        }

        objectUrl = result.url;
        setPreviewUrl(result.url);
      } catch {
        if (active) setPreviewError(true);
      }
    })();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [maybeMedia, postId, file.id, name]);

  const handleDownload = async () => {
    try {
      await downloadQaAttachment(postId, getQaPassword(postId), file.id);
    } catch (error) {
      alert(error.message);
    }
  };

  const kindClass = maybeVideo ? "is-video" : maybeImage ? "is-image" : "";

  return (
    <li className={`qa-extra-attach ${kindClass}`.trim()}>
      <div className="qa-extra-attach__row">
        <span className="qa-extra-label">{label}</span>
        <button type="button" className="qa-extra-download" onClick={handleDownload}>
          {name}
        </button>
      </div>

      {maybeImage && previewUrl && (
        <a
          className="qa-extra-preview"
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="새 탭에서 원본 보기"
        >
          <img src={previewUrl} alt={name} loading="lazy" decoding="async" />
        </a>
      )}

      {maybeVideo && previewUrl && !playError && (
        <div className="qa-extra-preview qa-extra-preview--video">
          <video
            controls
            playsInline
            preload="metadata"
            src={previewUrl}
            onError={() => setPlayError(true)}
          >
            이 브라우저에서는 영상을 재생할 수 없습니다.
          </video>
        </div>
      )}

      {maybeVideo && playError && (
        <p className="qa-extra-preview-status">
          이 브라우저에서는 해당 영상 형식을 바로 재생하지 못할 수 있습니다. 위
          파일 버튼으로 받아 확인해 주세요.
        </p>
      )}

      {maybeMedia && !previewUrl && !previewError && (
        <p className="qa-extra-preview-status">
          {maybeVideo ? "영상 불러오는 중…" : "이미지 불러오는 중…"}
        </p>
      )}
    </li>
  );
}

export default function QaPostExtras({ postId, fields }) {
  const { email, homepage, link1, link2, attachments = [], attachmentName, hasAttachment } =
    fields;

  const files =
    attachments.length > 0
      ? attachments
      : hasAttachment
        ? [{ id: null, name: attachmentName || "첨부파일 다운로드" }]
        : [];

  const hasMeta = email || homepage || link1 || link2 || files.length > 0;
  if (!hasMeta) return null;

  return (
    <div className="qa-post-extras">
      <h3 className="qa-post-extras-title">문의 정보</h3>
      <ul className="qa-post-extras-list">
        <PlainTextItem label="이메일" value={email} />
        <PlainTextItem label="홈페이지" value={homepage} />
        <ExternalLink href={link1} label="링크 1" />
        <PlainTextItem label="링크 2" value={link2} />
        {files.map((file, index) => (
          <AttachmentItem
            key={file.id || `${file.name}-${index}`}
            postId={postId}
            file={file}
            index={index}
            total={files.length}
          />
        ))}
      </ul>
    </div>
  );
}
