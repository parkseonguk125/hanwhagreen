import { useEffect, useMemo, useRef, useState } from "react";
import { constructionRecords } from "../../../data/constructionRecords";

const HEAD_LINES = ["현장에서 증명한 기술", "숫자로 확인하는 신뢰입니다"];
const UNIT_NOTES = ["평"];

function useArmOnView(rootMargin = "0px 0px -8% 0px", threshold = 0.15) {
  const ref = useRef(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || armed) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      setArmed(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setArmed(true));
          });
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [armed, rootMargin, threshold]);

  return [ref, armed];
}

function AnimatedLine({ text, lineIndex }) {
  const tokens = useMemo(() => text.split(/(\s+)/).filter((t) => t.length > 0), [text]);

  return (
    <span className="hg-cons__quote-line">
      {tokens.map((token, index) => {
        if (/^\s+$/.test(token)) {
          return <span key={`s-${lineIndex}-${index}`}> </span>;
        }
        const delay = 0.12 + lineIndex * 0.3 + index * 0.045;
        return (
          <span key={`${token}-${index}`} className="hg-cons__word">
            <span className="hg-cons__word-inner" style={{ animationDelay: `${delay}s` }}>
              {token}
            </span>
          </span>
        );
      })}
    </span>
  );
}

function CountUp({ value, suffix = "", armed, durationMs = 1600 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!armed) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      setDisplay(value);
      return undefined;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [armed, value, durationMs]);

  return (
    <span>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

function RecordRow({ row }) {
  const capacity = row.capacity && row.capacity !== "-" ? row.capacity : "";
  const isUnitNote = UNIT_NOTES.includes(row.compare);
  const capacityText = capacity ? `${capacity}${isUnitNote ? row.compare : ""}` : "—";
  const note = !isUnitNote && row.compare ? row.compare : "";

  return (
    <div className="hg-cons__row">
      <span className="hg-cons__row-no">{String(row.no).padStart(3, "0")}</span>
      <div className="hg-cons__row-main">
        <strong className="hg-cons__row-client">{row.client}</strong>
        <p className="hg-cons__row-type">
          {row.type}
          {note && <em className="hg-cons__row-note">{note}</em>}
        </p>
      </div>
      <span className="hg-cons__row-region">
        {row.region && row.region !== "-" ? row.region : "—"}
        {row.rep && row.rep !== "-" && row.rep !== "대표" ? ` · ${row.rep}` : ""}
      </span>
      <span className={`hg-cons__row-capacity${capacity ? "" : " is-empty"}`}>
        {capacityText}
        {capacity && !isUnitNote && <small> m²/D</small>}
      </span>
    </div>
  );
}

function YearGroup({ year, rows }) {
  const [ref, armed] = useArmOnView("0px 0px -4% 0px", 0.05);

  return (
    <section ref={ref} className={`hg-cons__group${armed ? " is-armed" : ""}`}>
      <header className="hg-cons__group-head">
        <span className="hg-cons__group-year">{year}</span>
        <span className="hg-cons__group-count">{rows.length}건</span>
        <span className="hg-cons__group-line" aria-hidden="true" />
      </header>
      <ul className="hg-cons__rows">
        {rows.map((row, index) => (
          <li
            key={row.no}
            className="hg-cons__row-wrap"
            style={{ "--hg-cons-delay": `${Math.min(index, 10) * 60}ms` }}
          >
            <RecordRow row={row} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function HgConstructionContent() {
  const [leadRef, leadArmed] = useArmOnView("80px 0px 0px 0px", 0.05);
  const [statsRef, statsArmed] = useArmOnView("0px 0px -8% 0px", 0.2);
  const [activeYear, setActiveYear] = useState("all");
  const [query, setQuery] = useState("");

  const years = useMemo(() => {
    const set = new Set(constructionRecords.map((r) => r.year));
    return [...set].sort((a, b) => b - a);
  }, []);

  const stats = useMemo(() => {
    const regions = new Set(
      constructionRecords.map((r) => r.region).filter((v) => v && v !== "-")
    );
    const clients = new Set(constructionRecords.map((r) => r.client));
    return {
      total: constructionRecords.length,
      years: years[0] - years[years.length - 1] + 1,
      regions: regions.size,
      clients: clients.size,
    };
  }, [years]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return constructionRecords.filter((r) => {
      if (activeYear !== "all" && r.year !== activeYear) return false;
      if (!q) return true;
      return [r.client, r.region, r.type, r.rep].some(
        (v) => v && String(v).toLowerCase().includes(q)
      );
    });
  }, [activeYear, query]);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      if (!map.has(r.year)) map.set(r.year, []);
      map.get(r.year).push(r);
    });
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [filtered]);

  return (
    <div className="hg-cons">
      <section ref={leadRef} className={`hg-cons__lead${leadArmed ? " is-armed" : ""}`}>
        <p className="hg-cons__eyebrow">Projects</p>
        <div className="hg-cons__accent" aria-hidden="true" />
        <h2 className="hg-cons__quote">
          {HEAD_LINES.map((line, index) => (
            <AnimatedLine key={line} text={line} lineIndex={index} />
          ))}
        </h2>
        <p className="hg-cons__sub">
          2011년부터 전국의 농장과 함께해 온 한화그린의 시공 기록입니다.
        </p>
      </section>

      <section
        ref={statsRef}
        className={`hg-cons__stats${statsArmed ? " is-armed" : ""}`}
        aria-label="공사실적 요약"
      >
        {[
          { label: "누적 공사실적", value: stats.total, suffix: "건" },
          { label: "시공 경험", value: stats.years, suffix: "년" },
          { label: "시공 지역", value: stats.regions, suffix: "곳" },
          { label: "함께한 발주처", value: stats.clients, suffix: "곳" },
        ].map((item, index) => (
          <div
            key={item.label}
            className="hg-cons__stat"
            style={{ "--hg-cons-delay": `${index * 120}ms` }}
          >
            <strong className="hg-cons__stat-value">
              <CountUp value={item.value} suffix={item.suffix} armed={statsArmed} />
            </strong>
            <span className="hg-cons__stat-label">{item.label}</span>
          </div>
        ))}
      </section>

      <section className="hg-cons__controls" aria-label="실적 필터">
        <div className="hg-cons__years" role="tablist" aria-label="연도별 보기">
          <button
            type="button"
            role="tab"
            aria-selected={activeYear === "all"}
            className={`hg-cons__year-btn${activeYear === "all" ? " is-active" : ""}`}
            onClick={() => setActiveYear("all")}
          >
            전체
          </button>
          {years.map((year) => (
            <button
              key={year}
              type="button"
              role="tab"
              aria-selected={activeYear === year}
              className={`hg-cons__year-btn${activeYear === year ? " is-active" : ""}`}
              onClick={() => setActiveYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
        <div className="hg-cons__search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="발주처·지역·공사종류 검색"
            aria-label="공사실적 검색"
          />
        </div>
      </section>

      <div className="hg-cons__result-meta" aria-live="polite">
        총 <strong>{filtered.length}</strong>건
      </div>

      <div className="hg-cons__groups">
        {groups.length === 0 ? (
          <p className="hg-cons__empty">검색 결과가 없습니다.</p>
        ) : (
          groups.map(([year, rows]) => <YearGroup key={year} year={year} rows={rows} />)
        )}
      </div>
    </div>
  );
}
