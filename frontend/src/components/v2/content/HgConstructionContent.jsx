import { useMemo, useState } from "react";
import { constructionRecords } from "../../../data/constructionRecords";

const UNIT_NOTES = ["평"];

function displayCell(value) {
  if (value === null || value === undefined) return "—";
  const text = String(value).trim();
  if (!text || text === "-") return "—";
  return text;
}

function displayCapacity(row) {
  const capacity = displayCell(row.capacity);
  if (capacity === "—") return "—";
  if (UNIT_NOTES.includes(row.compare)) return `${capacity}${row.compare}`;
  return capacity;
}

function displayCompare(row) {
  if (!row.compare || row.compare === "-" || UNIT_NOTES.includes(row.compare)) {
    return "—";
  }
  return row.compare;
}

export default function HgConstructionContent() {
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
    return {
      total: constructionRecords.length,
      from: years[years.length - 1],
      to: years[0],
      regions: regions.size,
    };
  }, [years]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return constructionRecords
      .filter((r) => {
        if (activeYear !== "all" && r.year !== activeYear) return false;
        if (!q) return true;
        return [r.client, r.region, r.type, r.rep].some(
          (v) => v && String(v).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.year - a.year || b.no - a.no);
  }, [activeYear, query]);

  return (
    <div className="hg-cons">
      <header className="hg-cons__lead">
        <h2 className="hg-cons__quote">공사실적</h2>
        <p className="hg-cons__sub">
          발주처·지역·공사종류·용량 등 시공 기록을 연도별로 확인할 수 있습니다.
        </p>
        <p className="hg-cons__summary" aria-label="실적 요약">
          <span>
            총 <strong>{stats.total}</strong>건
          </span>
          <span>
            {stats.from}~{stats.to}년
          </span>
          <span>
            시공 지역 <strong>{stats.regions}</strong>곳
          </span>
        </p>
      </header>

      <section className="hg-cons__toolbar" aria-label="실적 검색·필터">
        <div className="hg-cons__filter">
          <label className="hg-cons__filter-label" htmlFor="hg-cons-year">
            연도
          </label>
          <select
            id="hg-cons-year"
            className="hg-cons__year-select"
            value={activeYear}
            onChange={(e) =>
              setActiveYear(e.target.value === "all" ? "all" : Number(e.target.value))
            }
          >
            <option value="all">전체</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
        </div>

        <div className="hg-cons__search">
          <label className="hg-cons__filter-label" htmlFor="hg-cons-query">
            검색
          </label>
          <input
            id="hg-cons-query"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="발주처·지역·공사종류·대표"
            aria-label="공사실적 검색"
          />
        </div>

        <p className="hg-cons__result-meta" aria-live="polite">
          조회 <strong>{filtered.length}</strong>건
        </p>
      </section>

      <div className="hg-cons__table-wrap">
        <table className="hg-cons__table">
          <caption className="hg-cons__caption">
            한화그린 공사실적 목록
          </caption>
          <thead>
            <tr>
              <th scope="col">번호</th>
              <th scope="col">년도</th>
              <th scope="col">발주처</th>
              <th scope="col">지역</th>
              <th scope="col">대표</th>
              <th scope="col">공사종류</th>
              <th scope="col">
                용량
                <span className="hg-cons__unit">(m²/D)</span>
              </th>
              <th scope="col">비교</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="hg-cons__empty">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.no}>
                  <td className="hg-cons__cell-num">{row.no}</td>
                  <td className="hg-cons__cell-year">{row.year}</td>
                  <td className="hg-cons__cell-client">{displayCell(row.client)}</td>
                  <td>{displayCell(row.region)}</td>
                  <td>{displayCell(row.rep)}</td>
                  <td className="hg-cons__cell-type">{displayCell(row.type)}</td>
                  <td className="hg-cons__cell-capacity">{displayCapacity(row)}</td>
                  <td>{displayCompare(row)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
