import { downloadQaAttachment } from "../../services/boardApi";
import { getQaPassword } from "../../services/boardAccess";
import { normalizeExternalUrl } from "../../utils/qaPostDisplay";

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

export default function QaPostExtras({ postId, fields }) {
  const { email, homepage, link1, link2, attachmentName, hasAttachment } = fields;

  const handleDownload = async () => {
    try {
      await downloadQaAttachment(postId, getQaPassword(postId));
    } catch (error) {
      alert(error.message);
    }
  };

  const hasMeta = email || homepage || link1 || link2 || hasAttachment;
  if (!hasMeta) return null;

  return (
    <div className="qa-post-extras">
      <h3 className="qa-post-extras-title">문의 정보</h3>
      <ul className="qa-post-extras-list">
        <PlainTextItem label="이메일" value={email} />
        <PlainTextItem label="홈페이지" value={homepage} />
        <ExternalLink href={link1} label="링크 1" />
        <PlainTextItem label="링크 2" value={link2} />
        {hasAttachment && (
          <li>
            <span className="qa-extra-label">첨부파일</span>
            <button type="button" className="qa-extra-download" onClick={handleDownload}>
              {attachmentName || "첨부파일 다운로드"}
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
