import { useEffect, useState } from "react";
import HgAppLink from "./HgAppLink";
import { promoVideos } from "../../data/mock";
import { fetchNoticePosts } from "../../services/boardApi";
import { fetchLiveAirQuality, fetchLiveWeather } from "../../services/liveDataApi.js";
import {
  boardRouteTarget,
  boardViewRouteTarget,
  boardWriteRouteTarget,
} from "../../utils/navRoutes";
import useLivePanelPoll from "../live/useLivePanelPoll.js";
import HgStockPanel from "./HgStockPanel.jsx";
import HgMapPanel from "./HgMapPanel.jsx";

const TABS = [
  { id: "video", label: "?ÅÏÉÅ" },
  { id: "notice", label: "Í≥µÏ?" },
  { id: "qa", label: "?®Îùº??Î¨∏Ïùò" },
  { id: "attendance", label: "Ï∂úÍ≤∞?úÎπÑ?? },
  { id: "weather", label: "?†Ïî®?Ä ÎØ∏ÏÑ∏Î®ºÏ?" },
  { id: "stock", label: "Ï£ºÍ?" },
  { id: "map", label: "?ÑÏπò" },
];

const AQI_BADGE = {
  Ï¢ãÏùå: "is-good",
  Î≥¥ÌÜµ: "is-moderate",
  ?òÏÅ®: "is-bad",
  Îß§Ïö∞?òÏÅ®: "is-bad",
};

function VideoPanel() {
  return (
    <div className="hg-hub__masonry">
      {promoVideos.map((video) => (
        <HgAppLink
          key={video.id}
          to={boardViewRouteTarget("news", video.id)}
          className="hg-hub__card hg-hub__card--media"
        >
          <img src={video.image} alt="" loading="lazy" />
          <span className="hg-hub__play" aria-hidden="true" />
          <div className="hg-hub__card-body">
            <p className="hg-hub__card-title">{video.title}</p>
            <p className="hg-hub__card-meta">
              <span>?ÅÏÉÅ</span>
            </p>
          </div>
        </HgAppLink>
      ))}
      <HgAppLink to={boardRouteTarget("news")} className="hg-hub__card hg-hub__card--more">
        <span>+</span>
        <p>?çÎ≥¥?ÅÏÉÅ ?îÎ≥¥Í∏?/p>
      </HgAppLink>
    </div>
  );
}

function NoticePanel({ notices }) {
  return (
    <div className="hg-hub__notice">
      <div className="hg-hub__notice-head">
        <h3>Í≥µÏ??¨Ìï≠</h3>
        <HgAppLink to={boardRouteTarget("notice")} className="hg-hub__more-link">
          ?îÎ≥¥Í∏?
        </HgAppLink>
      </div>
      {notices.length === 0 ? (
        <p className="hg-hub__empty">?±Î°ù??Í≥µÏ?Í∞Ä ?ÜÏäµ?àÎã§.</p>
      ) : (
        <ul className="hg-hub__notice-list">
          {notices.map((item, index) => (
            <li key={item.id} className={index === 0 ? "is-featured" : undefined}>
              <HgAppLink to={boardViewRouteTarget("notice", item.id)}>
                <span className="hg-hub__tag">{index === 0 ? "Ï§ëÏöî" : "Í≥µÏ?"}</span>
                <span className="hg-hub__notice-title">{item.subject}</span>
                <span className="hg-hub__notice-date">{item.date}</span>
              </HgAppLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ServicePanel({
  eyebrow,
  title,
  description,
  primaryTo,
  primaryLabel,
  secondaryTo,
  secondaryLabel,
}) {
  return (
    <div className="hg-hub__service">
      <span className="hg-hub__service-eyebrow">{eyebrow}</span>
      <h3 className="hg-hub__service-title">{title}</h3>
      <p className="hg-hub__service-desc">{description}</p>
      <div className="hg-hub__service-actions">
        <HgAppLink to={primaryTo} className="hg-btn hg-btn--primary">
          {primaryLabel}
        </HgAppLink>
        {secondaryTo && (
          <HgAppLink to={secondaryTo} className="hg-btn hg-btn--outline">
            {secondaryLabel}
          </HgAppLink>
        )}
      </div>
    </div>
  );
}

function WeatherPanel() {
  const weather = useLivePanelPoll(fetchLiveWeather);
  const aqi = useLivePanelPoll(fetchLiveAirQuality);

  return (
    <div className="hg-hub__env">
      <section className="hg-hub__env-block">
        <header className="hg-hub__env-head">
          <h3>
            <span className="hg-live__pulse" aria-hidden="true" />
            ?ÑÍµ≠ ?†Ïî®
          </h3>
          {weather.data?.baseDate && (
            <span>
              {weather.data.baseDate.slice(4, 6)}/{weather.data.baseDate.slice(6, 8)}{" "}
              {weather.data.baseTime?.slice(0, 2)}??
            </span>
          )}
        </header>
        {weather.loading && <p className="hg-hub__env-status">Î∂àÎü¨?§Îäî Ï§ë‚Ä?/p>}
        {weather.error && <p className="hg-hub__env-status is-error">{weather.error}</p>}
        {weather.data?.regions && (
          <div className="hg-hub__env-weather">
            {weather.data.regions.map((region) => (
              <div key={region.name} className="hg-hub__env-chip">
                <span className="hg-hub__env-chip-name">{region.name}</span>
                <strong className="hg-hub__env-chip-temp">
                  {region.temp != null ? `${region.temp}¬∞` : "??}
                </strong>
                <span className="hg-hub__env-chip-meta">{region.sky}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="hg-hub__env-block">
        <header className="hg-hub__env-head">
          <h3>?ÑÍµ≠ ÎØ∏ÏÑ∏Î®ºÏ?</h3>
          <span>PM10</span>
        </header>
        {aqi.loading && <p className="hg-hub__env-status">Î∂àÎü¨?§Îäî Ï§ë‚Ä?/p>}
        {aqi.error && <p className="hg-hub__env-status is-error">{aqi.error}</p>}
        {aqi.data?.regions && (
          <div className="hg-hub__env-aqi">
            {aqi.data.regions.map((region) => (
              <div key={region.name} className="hg-hub__env-aqi-item">
                <span className="hg-hub__env-aqi-name">{region.name}</span>
                <span
                  className={`hg-hub__env-aqi-badge ${AQI_BADGE[region.pm10Grade] || ""}`}
                  title={`PM10 ${region.pm10 ?? "??} ¬∑ PM2.5 ${region.pm25 ?? "??}`}
                >
                  {region.pm10Grade || "??}
                  <em>{region.pm10 ?? "??}</em>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StockPanel() {
  return (
    <div className="hg-hub__live-solo hg-hub__live-solo--stock">
      <HgStockPanel />
    </div>
  );
}

function MapPanel() {
  return (
    <div className="hg-hub__live-solo hg-hub__live-solo--map">
      <HgMapPanel />
    </div>
  );
}

function HubPanel({ tab, notices }) {
  switch (tab) {
    case "video":
      return <VideoPanel />;
    case "notice":
      return <NoticePanel notices={notices} />;
    case "qa":
      return (
        <ServicePanel
          eyebrow="Customer Care"
          title="?®Îùº??Î¨∏Ïùò"
          description="?òÏ≤òÎ¶?∑Ïóê?àÏ?¬∑?ÑÏû• Í≥†Î????®Í≤® Ï£ºÏÑ∏?? ?¥Îãπ?êÍ? ?ïÏù∏ ??Îπ†Î•¥Í≤??∞ÎùΩ?úÎ¶Ω?àÎã§."
          primaryTo={boardWriteRouteTarget("qa")}
          primaryLabel="Î¨∏Ïùò ?ëÏÑ±?òÍ∏∞"
          secondaryTo={boardRouteTarget("qa")}
          secondaryLabel="Î¨∏Ïùò Î™©Î°ù"
        />
      );
    case "attendance":
      return (
        <ServicePanel
          eyebrow="Field Service"
          title="Ï∂úÍ≤∞?úÎπÑ??
          description="?ÑÏû•¬∑ÍµêÏú° Ï∂úÍ≤∞ ?¥Ïó≠???ïÏù∏?òÍ≥† Í¥ÄÎ¶¨Ìï† ???àÏäµ?àÎã§."
          primaryTo={boardRouteTarget("attendance")}
          primaryLabel="Ï∂úÍ≤∞ Î∞îÎ°úÍ∞ÄÍ∏?
        />
      );
    case "weather":
      return <WeatherPanel />;
    case "stock":
      return <StockPanel />;
    case "map":
      return <MapPanel />;
    default:
      return null;
  }
}

export default function HgNewsSection() {
  const [activeTab, setActiveTab] = useState("video");
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchNoticePosts()
      .then((posts) => {
        if (!cancelled) setNotices(posts.slice(0, 8));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="hg-section hg-section--hub" id="home-news" aria-labelledby="hg-hub-title">
      <div className="hg-container">
        <div className="hg-hub hg-reveal">
          <aside className="hg-hub__aside">
            <header className="hg-hub__header">
              <span className="hg-label">Media Hub</span>
              <h2 id="hg-hub-title" className="hg-hub__title">
                <span>?úÌôîÍ∑∏Î¶∞??/span>
                <span>?§Ïñë???åÏãù</span>
              </h2>
            </header>

            <div className="hg-hub__tabs" role="tablist" aria-label="?åÏãù Ïπ¥ÌÖåÍ≥†Î¶¨">
              {TABS.map((tab) => {
                const selected = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`hg-hub-tab-${tab.id}`}
                    aria-selected={selected}
                    aria-controls="hg-hub-panel"
                    className={`hg-hub__tab${selected ? " is-active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </aside>

          <div
            className="hg-hub__content"
            role="tabpanel"
            id="hg-hub-panel"
            aria-labelledby={`hg-hub-tab-${activeTab}`}
          >
            <div key={activeTab} className="hg-hub__panel">
              <HubPanel tab={activeTab} notices={notices} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
