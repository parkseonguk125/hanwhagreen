import { projects } from "../../data/projects";
import { certifications } from "../../data/certifications";
import { constructionRecords } from "../../data/constructionRecords";
import { useHgCountUp } from "./hooks";

function StatItem({ num, label, suffix = "" }) {
  const { ref, value } = useHgCountUp(num);

  return (
    <div className="hg-stats__item" ref={ref}>
      <p className="hg-stats__num">
        {value}
        {suffix && <span className="hg-stats__suffix">{suffix}</span>}
      </p>
      <p className="hg-stats__label">{label}</p>
    </div>
  );
}

const stats = [
  { num: projects.length, label: "주요실적", suffix: "" },
  { num: certifications.length, label: "인증서·특허", suffix: "" },
  { num: constructionRecords.length, label: "공사실적", suffix: "" },
  { num: 30, label: "년 현장경험", suffix: "+" },
];

export default function HgStatsSection() {
  return (
    <section className="hg-section hg-section--stats" aria-labelledby="hg-stats-title">
      <div className="hg-stats__bg" aria-hidden="true" />
      <div className="hg-container">
        <header className="hg-section-header hg-section-header--center hg-reveal">
          <span className="hg-label">Performance</span>
          <h2 id="hg-stats-title" className="hg-section-title hg-section-title--split hg-section-title--center">
            <span>숫자로 보는</span>
            <span>한화그린</span>
          </h2>
        </header>
        <div className="hg-stats hg-reveal hg-reveal--delay-1">
          {stats.map((item) => (
            <StatItem key={item.label} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
