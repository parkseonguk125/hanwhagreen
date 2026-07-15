import { fetchLiveWeather } from "../../services/liveDataApi.js";
import useLivePanelPoll from "./useLivePanelPoll.js";

export default function WeatherPanel() {
  const { data, error, loading } = useLivePanelPoll(fetchLiveWeather);

  return (
    <article className="live-panel live-panel-weather">
      <header className="live-panel-header">
        <h3>전국 날씨</h3>
        {data?.baseDate && (
          <span className="live-panel-meta">
            기준 {data.baseDate.slice(0, 4)}-{data.baseDate.slice(4, 6)}-
            {data.baseDate.slice(6, 8)} {data.baseTime?.slice(0, 2)}시
          </span>
        )}
      </header>
      <div className="live-panel-body">
        {loading && <p className="live-panel-status">불러오는 중…</p>}
        {error && <p className="live-panel-error">{error}</p>}
        {data?.regions && (
          <ul className="live-region-list">
            {data.regions.map((region) => (
              <li key={region.name} className="live-region-item">
                <span className="live-region-name">{region.name}</span>
                <span className="live-region-temp">
                  {region.temp != null ? `${region.temp}℃` : "—"}
                </span>
                <span className="live-region-detail">
                  {region.sky}
                  {region.pty !== "없음" && region.pty !== region.sky
                    ? ` · ${region.pty}`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
