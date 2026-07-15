import { fetchLiveAirQuality } from "../../services/liveDataApi.js";
import useLivePanelPoll from "./useLivePanelPoll.js";

const GRADE_CLASS = {
  좋음: "grade-good",
  보통: "grade-normal",
  나쁨: "grade-bad",
  "매우나쁨": "grade-very-bad",
};

function gradeClass(label) {
  return GRADE_CLASS[label] || "grade-unknown";
}

export default function AirQualityPanel() {
  const { data, error, loading } = useLivePanelPoll(fetchLiveAirQuality);

  return (
    <article className="live-panel live-panel-air">
      <header className="live-panel-header">
        <h3>전국 미세먼지</h3>
        <span className="live-panel-meta">시·도별 평균 (PM10 / PM2.5)</span>
      </header>
      <div className="live-panel-body">
        {loading && <p className="live-panel-status">불러오는 중…</p>}
        {error && <p className="live-panel-error">{error}</p>}
        {data?.regions && (
          <ul className="live-region-list">
            {data.regions.map((region) => (
              <li key={region.name} className="live-region-item live-air-item">
                <span className="live-region-name">{region.name}</span>
                <span className="live-air-values">
                  <span className={gradeClass(region.pm10Grade)}>
                    PM10 {region.pm10 ?? "—"} ({region.pm10Grade})
                  </span>
                  <span className={gradeClass(region.pm25Grade)}>
                    PM2.5 {region.pm25 ?? "—"} ({region.pm25Grade})
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
