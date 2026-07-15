import { fetchLiveAirQuality } from "../../services/liveDataApi.js";
import useLivePanelPoll from "../live/useLivePanelPoll.js";

const BADGE = {
  좋음: "hg-aqi__badge--good",
  보통: "hg-aqi__badge--moderate",
  나쁨: "hg-aqi__badge--bad",
  "매우나쁨": "hg-aqi__badge--bad",
};

export default function HgAirQualityPanel() {
  const { data, error, loading } = useLivePanelPoll(fetchLiveAirQuality);

  return (
    <article className="hg-live__panel">
      <header className="hg-live__panel-head">
        <h3 className="hg-live__panel-title">전국 미세먼지</h3>
        <span className="hg-live__panel-updated">PM10 / PM2.5</span>
      </header>
      {loading && <p className="hg-live__loading">불러오는 중…</p>}
      {error && <p className="hg-live__error">{error}</p>}
      {data?.regions && (
        <ul className="hg-aqi__list">
          {data.regions.map((region) => (
            <li key={region.name} className="hg-aqi__row">
              <span>{region.name}</span>
              <span className={`hg-aqi__badge ${BADGE[region.pm10Grade] || ""}`}>
                PM10 {region.pm10 ?? "—"} ({region.pm10Grade})
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
