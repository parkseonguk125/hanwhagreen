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

  return (
    <section className="sec1 attendance-view">
      <section className="viewSkin">
        <article className="inner attendance-view-cards">
          <section className="attendance-card attendance-card-header">
            <p className="title attendance-post-title">{post.detailSubject || post.listSubject || post.subject}</p>
            <div className="attendance-meta-grid">
              <div className="attendance-meta-item">
                <span className="attendance-meta-label">작업일</span>
                <span className="attendance-meta-value attendance-meta-value--date">{post.workDate || "-"}</span>
              </div>
              <div className="attendance-meta-item">
                <span className="attendance-meta-label">등록일</span>
                <span className="attendance-meta-value attendance-meta-value--date">{viewDate}</span>
              </div>
              <div className="attendance-meta-item">
                <span className="attendance-meta-label">등록시간</span>
                <span className="attendance-meta-value attendance-meta-value--date">{registeredTime || "-"}</span>
              </div>
              <div className="attendance-meta-item">
                <span className="attendance-meta-label">작성자</span>
                <span className="attendance-meta-value">{post.reporterName || "-"}</span>
              </div>
              <div className="attendance-meta-item">
                <span className="attendance-meta-label">인원</span>
                <span className="attendance-meta-value">{post.personnelCount ?? "-"}명</span>
              </div>
              <div className="attendance-meta-item attendance-meta-item--location">
                <span className="attendance-meta-label">위치</span>
                <span className="attendance-meta-value">
                  {!hasCoordinates ? (
                    "-"
                  ) : isAddressLoading ? (
                    <span className="attendance-address-pending">주소 확인 중…</span>
                  ) : (
                    displayAddress || "등록된 주소 없음 (좌표만 저장됨)"
                  )}
                </span>
              </div>
            </div>
          </section>

          {hasCoordinates && (
            <section className="attendance-card">
              <h3 className="attendance-section-title">출결 위치</h3>
              <div className="attendance-map-shell">
                <NaverMapEmbed
                  lat={post.latitude}
                  lng={post.longitude}
                  markerLabel="출결 위치"
                  address={displayAddress}
                  resolveAddress
                  onAddressResolved={setResolvedAddress}
                  openInfoOnLoad={false}
                  height={360}
                  className="attendance-map-embed"
                />
              </div>
              <p className="attendance-coords">
                위도 {formatCoordinate(post.latitude)}, 경도{" "}
                {formatCoordinate(post.longitude)}
                {naverMapUrl ? (
                  <>
                    {" "}
                    ·{" "}
                    <a
                      href={naverMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="attendance-map-external-link"
                    >
                      네이버 지도에서 보기
                    </a>
                  </>
                ) : null}
              </p>
            </section>
          )}

          <section className="attendance-card">
            <h3 className="attendance-section-title">작업 내용</h3>
            <div className="attendance-content">
              {(post.workContent || "")
                .split(/\n+/)
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => (
                  <p key={line}>{line}</p>
                ))}
              {!post.workContent?.trim() && <p>작업 내용 없음</p>}
            </div>
          </section>

          {photos.length > 0 && (
            <section className="attendance-card">
              <h3 className="attendance-section-title">
                현장 사진
                <span className="attendance-photo-count">{photos.length}장</span>
              </h3>
              <AttendancePhotoGallery postId={post.id} photos={photos} />
            </section>
          )}

          <div className="bo_v_btn attendance-card-actions">
            <Link to={boardRouteTarget("attendance")} className="btn_b01 btn">
              목록
            </Link>
            <button type="button" className="btn_b01 btn btn_admin" onClick={handleDelete}>
              삭제
            </button>
          </div>
        </article>
      </section>
    </section>
  );
}
