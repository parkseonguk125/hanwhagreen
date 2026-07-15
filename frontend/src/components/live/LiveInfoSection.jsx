import LiveInfoPanels from "./LiveInfoPanels.jsx";

/** 홈 — 히어로 바로 아래 실시간 대시보드 */
export default function LiveInfoSection() {
  return (
    <section
      className="live-info-section section"
      id="home-live"
      aria-labelledby="live-info-title"
    >
      <div className="live-info-inner">
        <header className="live-info-head">
          <span className="live-info-badge">
            <span className="live-info-pulse" aria-hidden="true" />
            LIVE
          </span>
          <h2 id="live-info-title" className="live-info-title">
            실시간 정보
          </h2>
          <p className="live-info-desc">
            날씨 · 미세먼지 · 주가 · 본사 위치를 한눈에 확인하세요
          </p>
        </header>
        <LiveInfoPanels />
      </div>
    </section>
  );
}
