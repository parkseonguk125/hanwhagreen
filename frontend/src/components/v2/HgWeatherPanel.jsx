import { fetchLiveWeather } from "../../services/liveDataApi.js";
import useLivePanelPoll from "../live/useLivePanelPoll.js";

export default function HgWeatherPanel() {
  const { data, error, loading } = useLivePanelPoll(fetchLiveWeather);

  return (
    <article className="hg-live__panel">
      <header className="hg-live__panel-head">
        <h3 className="hg-live__panel-title">
          <span className="hg-live__pulse" aria-hidden="true" />
          전국 날씨
        </h3>
        {data?.baseDate && (
          <span className="hg-live__panel-updated">
            {data.baseDate.slice(4, 6)}/{data.baseDate.slice(6, 8)}{" "}
            {data.baseTime?.slice(0, 2)}시
          </span>
        )}
      </header>
      {loading && <p className="hg-live__loading">불러오는 중…</p>}
      {error && <p className="hg-live__error">{error}</p>}
      {data?.regions && (
        <div className="hg-weather__grid">
          {data.regions.map((region) => (
            <div key={region.name} className="hg-weather__city">
              <p className="hg-weather__city-name">{region.name}</p>
              <p className="hg-weather__temp">
                {region.temp != null ? `${region.temp}°` : "—"}
              </p>
              <p className="hg-weather__cond">{region.sky}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
