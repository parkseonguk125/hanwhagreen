import { useEffect, useMemo, useState } from "react";
import HgAppLink from "./HgAppLink";
import { promoVideos } from "../../data/mock";
import { fetchNoticePosts } from "../../services/boardApi";
import {
  fetchLiveAirQuality,
  fetchLiveStocks,
  fetchLiveWeather,
} from "../../services/liveDataApi.js";
import {
  boardRouteTarget,
  boardViewRouteTarget,
  boardWriteRouteTarget,
} from "../../utils/navRoutes";
import useLivePanelPoll from "../live/useLivePanelPoll.js";
import { useHgViewport } from "./hooks.js";
import HgStockPanel from "./HgStockPanel.jsx";
import HgMapPanel from "./HgMapPanel.jsx";

const TABS = [
  { id: "video", label: "영상" },
  { id: "notice", label: "공지" },
  { id: "qa", label: "온라인 문의" },
  { id: "attendance", label: "출결서비스" },
  { id: "weather", label: "날씨와 미세먼지" },
  { id: "stock", label: "주가" },
  { id: "map", label: "위치" },
];

const AQI_BADGE = {
  좋음: "is-good",
  보통: "is-moderate",
  나쁨: "is-bad",
  매우나쁨: "is-bad",
};

const FEATURED_STOCKS = ["한화솔루션", "한화에어로스페이스", "한화오션", "삼성전자"];

function stockChangeClass(rate) {
  if (rate > 0) return "is-up";
  if (rate < 0) return "is-down";
  return "is-flat";
}

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
              <span>영상</span>
            </p>
          </div>
        </HgAppLink>
      ))}
      <HgAppLink to={boardRouteTarget("news")} className="hg-hub__card hg-hub__card--more">
        <span>+</span>
        <p>홍보영상 더보기</p>
      </HgAppLink>
    </div>
  );
}

function NoticePanel({ notices }) {
  return (
    <div className="hg-hub__notice">
      <div className="hg-hub__notice-head">
        <h3>공지사항</h3>
        <HgAppLink to={boardRouteTarget("notice")} className="hg-hub__more-link">
          더보기
        </HgAppLink>
      </div>
      {notices.length === 0 ? (
        <p className="hg-hub__empty">등록된 공지가 없습니다.</p>
      ) : (
        <ul className="hg-hub__notice-list">
          {notices.map((item, index) => (
            <li key={item.id} className={index === 0 ? "is-featured" : undefined}>
              <HgAppLink to={boardViewRouteTarget("notice", item.id)}>
                <span className="hg-hub__tag">{index === 0 ? "중요" : "공지"}</span>
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

function WeatherPanelDesktop({ weather, aqi }) {
  return (
    <div className="hg-hub__env">
      <section className="hg-hub__env-block">
        <header className="hg-hub__env-head">
          <h3>
            <span className="hg-live__pulse" aria-hidden="true" />
            전국 날씨
          </h3>
          {weather.data?.baseDate && (
            <span>
              {weather.data.baseDate.slice(4, 6)}/{weather.data.baseDate.slice(6, 8)}{" "}
              {weather.data.baseTime?.slice(0, 2)}시
            </span>
          )}
        </header>
        {weather.loading && <p className="hg-hub__env-status">불러오는 중…</p>}
        {weather.error && <p className="hg-hub__env-status is-error">{weather.error}</p>}
        {weather.data?.regions && (
          <div className="hg-hub__env-weather">
            {weather.data.regions.map((region) => (
              <div key={region.name} className="hg-hub__env-chip">
                <span className="hg-hub__env-chip-name">{region.name}</span>
                <strong className="hg-hub__env-chip-temp">
                  {region.temp != null ? `${region.temp}°` : "—"}
                </strong>
                <span className="hg-hub__env-chip-meta">{region.sky}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="hg-hub__env-block">
        <header className="hg-hub__env-head">
          <h3>전국 미세먼지</h3>
          <span>PM10</span>
        </header>
        {aqi.loading && <p className="hg-hub__env-status">불러오는 중…</p>}
        {aqi.error && <p className="hg-hub__env-status is-error">{aqi.error}</p>}
        {aqi.data?.regions && (
          <div className="hg-hub__env-aqi">
            {aqi.data.regions.map((region) => (
              <div key={region.name} className="hg-hub__env-aqi-item">
                <span className="hg-hub__env-aqi-name">{region.name}</span>
                <span
                  className={`hg-hub__env-aqi-badge ${AQI_BADGE[region.pm10Grade] || ""}`}
                  title={`PM10 ${region.pm10 ?? "—"} · PM2.5 ${region.pm25 ?? "—"}`}
                >
                  {region.pm10Grade || "—"}
                  <em>{region.pm10 ?? "—"}</em>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function WeatherPanelMobile({ weather, aqi }) {
  const rows = useMemo(() => {
    const weatherMap = new Map((weather.data?.regions || []).map((r) => [r.name, r]));
    const aqiMap = new Map((aqi.data?.regions || []).map((r) => [r.name, r]));
    const names = weatherMap.size
      ? [...weatherMap.keys()]
      : [...aqiMap.keys()];
    return names.map((name) => ({
      name,
      weather: weatherMap.get(name),
      aqi: aqiMap.get(name),
    }));
  }, [weather.data, aqi.data]);

  const loading = (weather.loading && !weather.data) || (aqi.loading && !aqi.data);
  const error = weather.error || aqi.error;
  const stamp =
    weather.data?.baseDate &&
    `${weather.data.baseDate.slice(4, 6)}/${weather.data.baseDate.slice(6, 8)} ${weather.data.baseTime?.slice(0, 2) || "--"}시`;

  return (
    <div className="hg-m-live">
      <header className="hg-m-live__head">
        <div>
          <p className="hg-m-live__eyebrow">
            <span className="hg-live__pulse" aria-hidden="true" />
            Live Atmosphere
          </p>
          <h3 className="hg-m-live__title">날씨 · 미세먼지</h3>
        </div>
        {stamp && <span className="hg-m-live__stamp">{stamp}</span>}
      </header>

      {loading && <p className="hg-m-live__status">불러오는 중…</p>}
      {error && <p className="hg-m-live__status is-error">{error}</p>}

      {rows.length > 0 && (
        <div className="hg-m-live__grid">
          {rows.map(({ name, weather: w, aqi: q }) => {
            const grade = q?.pm10Grade || "—";
            return (
              <article key={name} className="hg-m-live__card">
                <div className="hg-m-live__card-top">
                  <span className="hg-m-live__city">{name}</span>
                  <span className={`hg-m-live__grade ${AQI_BADGE[grade] || ""}`}>
                    {grade}
                  </span>
                </div>
                <div className="hg-m-live__card-main">
                  <strong className="hg-m-live__temp">
                    {w?.temp != null ? `${w.temp}°` : "—"}
                  </strong>
                  <span className="hg-m-live__sky">{w?.sky || "—"}</span>
                </div>
                <div className="hg-m-live__card-foot">
                  <span>PM10 {q?.pm10 ?? "—"}</span>
                  <span>PM2.5 {q?.pm25 ?? "—"}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WeatherPanel() {
  const { isMobile } = useHgViewport();
  const weather = useLivePanelPoll(fetchLiveWeather);
  const aqi = useLivePanelPoll(fetchLiveAirQuality);

  if (isMobile) return <WeatherPanelMobile weather={weather} aqi={aqi} />;
  return <WeatherPanelDesktop weather={weather} aqi={aqi} />;
}

function StockPanelMobile() {
  const { data, error, loading } = useLivePanelPoll(fetchLiveStocks, {
    shouldPoll: (r) => (r?.pollIntervalMs ?? 0) > 0,
  });

  const { featured, rest } = useMemo(() => {
    const stocks = data?.stocks || [];
    const featuredSet = new Set(FEATURED_STOCKS);
    const featuredList = FEATURED_STOCKS.map((name) => stocks.find((s) => s.name === name)).filter(
      Boolean
    );
    const restList = stocks.filter((s) => !featuredSet.has(s.name));
    // 한화 종목이 없으면 상위 4개를 피처로
    if (featuredList.length === 0 && stocks.length) {
      return { featured: stocks.slice(0, 4), rest: stocks.slice(4) };
    }
    return { featured: featuredList, rest: restList };
  }, [data?.stocks]);

  return (
    <div className="hg-m-stock">
      <header className="hg-m-stock__head">
        <div>
          <p className="hg-m-stock__eyebrow">Market Snapshot</p>
          <h3 className="hg-m-stock__title">핵심 주가</h3>
        </div>
        <span className="hg-m-stock__stamp">
          {data?.basDtDisplay || (data?.live ? "실시간" : "종가")}
        </span>
      </header>

      {loading && !data && <p className="hg-m-stock__status">시세 불러오는 중…</p>}
      {error && <p className="hg-m-stock__status is-error">{error}</p>}
      {data?.note && <p className="hg-m-stock__status is-error">{data.note}</p>}

      {featured.length > 0 && (
        <div className="hg-m-stock__featured">
          {featured.map((stock) => (
            <article key={stock.name} className={`hg-m-stock__hero ${stockChangeClass(stock.changeRate)}`}>
              <span className="hg-m-stock__hero-name">{stock.name}</span>
              <strong className="hg-m-stock__hero-price">
                {stock.closePrice != null ? stock.closePrice.toLocaleString() : "—"}
              </strong>
              <span className="hg-m-stock__hero-rate">
                {stock.changeRate != null
                  ? `${stock.changeRate > 0 ? "+" : ""}${stock.changeRate.toFixed(2)}%`
                  : "—"}
              </span>
            </article>
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="hg-m-stock__rail" role="list">
          {rest.map((stock) => (
            <div key={stock.name} className="hg-m-stock__row" role="listitem">
              <span className="hg-m-stock__name">{stock.name}</span>
              <span className="hg-m-stock__price">
                {stock.closePrice != null ? stock.closePrice.toLocaleString() : "—"}
              </span>
              <span className={`hg-m-stock__rate ${stockChangeClass(stock.changeRate)}`}>
                {stock.changeRate != null
                  ? `${stock.changeRate > 0 ? "+" : ""}${stock.changeRate.toFixed(2)}%`
                  : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StockPanel() {
  const { isMobile } = useHgViewport();
  if (isMobile) return <StockPanelMobile />;
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
          title="온라인 문의"
          description="수처리·에너지·현장 고민을 남겨 주세요. 담당자가 확인 후 빠르게 연락드립니다."
          primaryTo={boardWriteRouteTarget("qa")}
          primaryLabel="문의 작성하기"
          secondaryTo={boardRouteTarget("qa")}
          secondaryLabel="문의 목록"
        />
      );
    case "attendance":
      return (
        <ServicePanel
          eyebrow="Field Service"
          title="출결서비스"
          description="현장·교육 출결 내역을 확인하고 관리할 수 있습니다."
          primaryTo={boardRouteTarget("attendance")}
          primaryLabel="출결 바로가기"
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
                <span>한화그린의</span>
                <span>다양한 소식</span>
              </h2>
            </header>

            <div className="hg-hub__tabs" role="tablist" aria-label="소식 카테고리">
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
