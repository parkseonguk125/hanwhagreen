import HgWeatherPanel from "./HgWeatherPanel.jsx";
import HgAirQualityPanel from "./HgAirQualityPanel.jsx";
import HgStockPanel from "./HgStockPanel.jsx";
import HgMapPanel from "./HgMapPanel.jsx";

export default function HgLiveInfoSection() {
  return (
    <section className="hg-section hg-live" id="home-live" aria-labelledby="hg-live-title">
      <div className="hg-live__bg" aria-hidden="true" />
      <div className="hg-container">
        <header className="hg-section-header hg-section-header--center hg-reveal">
          <span className="hg-label">Live Dashboard</span>
          <h2 id="hg-live-title" className="hg-section-title">
            실시간 정보
          </h2>
          <p className="hg-section-desc">
            날씨 · 미세먼지 · 주가 · 본사 위치를 한눈에 확인하세요
          </p>
        </header>
        <div className="hg-live__bento hg-reveal">
          <div className="hg-live__bento-item hg-live__bento-item--weather">
            <HgWeatherPanel />
          </div>
          <div className="hg-live__bento-item hg-live__bento-item--aqi">
            <HgAirQualityPanel />
          </div>
          <div className="hg-live__bento-item hg-live__bento-item--stock">
            <HgStockPanel />
          </div>
          <div className="hg-live__bento-item hg-live__bento-item--map">
            <HgMapPanel />
          </div>
        </div>
      </div>
    </section>
  );
}
