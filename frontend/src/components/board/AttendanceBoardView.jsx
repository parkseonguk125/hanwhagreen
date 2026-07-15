import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NaverMapEmbed from "../NaverMapEmbed";
import AttendancePhotoGallery from "./AttendancePhotoGallery";
import { deleteAttendancePost } from "../../services/boardApi";
import { boardRouteTarget } from "../../utils/navRoutes";

function formatCoordinate(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return num.toFixed(6);
}

function isLikelyKoreanAddress(text) {
  return /[가-힣]/.test(text || "");
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M4 21c1.5-3.6 4.4-5.4 8-5.4s6.5 1.8 8 5.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="9" cy="9" r="3.4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="10.5" r="2.6" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3 20c1.2-3 3.4-4.5 6-4.5s4.8 1.5 6 4.5M15.5 15.8c2.4.2 4.3 1.6 5.5 4.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M12 21s-6.5-5.7-6.5-10.4a6.5 6.5 0 1113 0C18.5 15.3 12 21 12 21z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.4" r="2.3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function MetaTile({ icon, label, value, sub }) {
  return (
    <div className="hg-att-view__tile">
      <span className="hg-att-view__tile-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="hg-att-view__tile-text">
        <span className="hg-att-view__tile-label">{label}</span>
        <span className="hg-att-view__tile-value">
          {value}
          {sub && <small className="hg-att-view__tile-sub">{sub}</small>}
        </span>
      </span>
    </div>
  );
}

function SectionTitle({ index, children, extra }) {
  return (
    <h3 className="hg-att-view__card-title">
      <span className="hg-att-view__card-num" aria-hidden="true">
        {index}
      </span>
      {children}
      {extra && <span className="hg-att-view__card-extra">{extra}</span>}
    </h3>
  );
}

export default function AttendanceBoardView({ post }) {
  const navigate = useNavigate();
  const viewDate = post.viewDate || post.date;
  const registeredTime = post.registeredTime || "";
  const [resolvedAddress, setResolvedAddress] = useState(null);

  useEffect(() => {
    setResolvedAddress(null);
  }, [post.id, post.latitude, post.longitude]);

  const handleDelete = async () => {
    if (!window.confirm("이 출결 기록을 삭제하시겠습니까?")) return;

    try {
      await deleteAttendancePost(post.id);
      alert("삭제되었습니다.");
      navigate(boardRouteTarget("attendance"));
    } catch (error) {
      alert(error.message);
    }
  };

  const hasCoordinates =
    Number.isFinite(Number(post.latitude)) && Number.isFinite(Number(post.longitude));

  const displayAddress = useMemo(() => {
    if (resolvedAddress) return resolvedAddress;
    if (isLikelyKoreanAddress(post.address)) return post.address;
    if (post.address?.trim()) return post.address.trim();
    return "";
  }, [resolvedAddress, post.address]);

  const isAddressLoading = hasCoordinates && resolvedAddress === null && !displayAddress;

  const naverMapUrl = hasCoordinates
    ? `https://map.naver.com/v5/?c=${post.longitude},${post.latitude},16,0,0,0,dh`
    : "";

  const photos = post.photos?.length
    ? post.photos
    : post.hasPhoto
      ? [{ id: null, photoName: post.photoName || "현장 사진" }]
      : [];

  const contentLines = (post.workContent || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  let sectionNo = 0;
  const nextSection = () => {
    sectionNo += 1;
    return String(sectionNo).padStart(2, "0");
  };

  return (
    <section className="hg-proj hg-att-view">
      <header className="hg-att-view__head">
        <p className="hg-proj__eyebrow">Attendance Report</p>
        <div className="hg-proj__accent" aria-hidden="true" />
        <h2 className="hg-att-view__title">
          {post.detailSubject || post.listSubject || post.subject}
        </h2>
      </header>

      <div className="hg-att-view__grid">
        <MetaTile icon={<CalendarIcon />} label="작업일" value={post.workDate || "-"} />
        <MetaTile
          icon={<ClockIcon />}
          label="등록일시"
          value={viewDate || "-"}
          sub={registeredTime || undefined}
        />
        <MetaTile icon={<UserIcon />} label="작성자" value={post.reporterName || "-"} />
        <MetaTile
          icon={<TeamIcon />}
          label="투입 인원"
          value={post.personnelCount != null ? `${post.personnelCount}명` : "-"}
        />
      </div>

      {hasCoordinates && (
        <section className="hg-att-view__card">
          <SectionTitle index={nextSection()}>출결 위치</SectionTitle>
          <p className="hg-att-view__address">
            <span className="hg-att-view__address-icon" aria-hidden="true">
              <PinIcon />
            </span>
            {isAddressLoading ? (
              <span className="hg-att-view__address-pending">주소 확인 중…</span>
            ) : (
              displayAddress || "등록된 주소 없음 (좌표만 저장됨)"
            )}
          </p>
          <div className="hg-att-view__map">
            <NaverMapEmbed
              lat={post.latitude}
              lng={post.longitude}
              markerLabel="출결 위치"
              address={displayAddress}
              resolveAddress
              onAddressResolved={setResolvedAddress}
              openInfoOnLoad={false}
              height={400}
              className="hg-att-view__map-embed"
            />
          </div>
          <div className="hg-att-view__map-foot">
            <span className="hg-att-view__coords">
              위도 {formatCoordinate(post.latitude)} · 경도 {formatCoordinate(post.longitude)}
            </span>
            {naverMapUrl && (
              <a
                href={naverMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hg-att-view__map-link"
              >
                네이버 지도에서 보기
                <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                  <path
                    d="M7 17L17 7M9 7h8v8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            )}
          </div>
        </section>
      )}

      <section className="hg-att-view__card">
        <SectionTitle index={nextSection()}>작업 내용</SectionTitle>
        <div className="hg-att-view__content">
          {contentLines.length > 0 ? (
            contentLines.map((line) => <p key={line}>{line}</p>)
          ) : (
            <p className="hg-att-view__content-empty">작업 내용 없음</p>
          )}
        </div>
      </section>

      {photos.length > 0 && (
        <section className="hg-att-view__card">
          <SectionTitle index={nextSection()} extra={`${photos.length}장`}>
            현장 사진
          </SectionTitle>
          <AttendancePhotoGallery postId={post.id} photos={photos} />
        </section>
      )}

      <div className="hg-att-view__actions">
        <Link to={boardRouteTarget("attendance")} className="hg-att-view__btn hg-att-view__btn--list">
          목록으로
        </Link>
        <button
          type="button"
          className="hg-att-view__btn hg-att-view__btn--delete"
          onClick={handleDelete}
        >
          삭제
        </button>
      </div>
    </section>
  );
}
