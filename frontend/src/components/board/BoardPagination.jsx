import { Link } from "react-router-dom";
import { buildBoardUrl } from "../../utils/boardSca";

const WRITE_PAGES = 10;

function getPageRange(page, totalPages) {
  if (page <= WRITE_PAGES) {
    return { startPage: 1, endPage: Math.min(WRITE_PAGES, totalPages) };
  }
  const startPage = Math.floor((page - 1) / WRITE_PAGES) * WRITE_PAGES + 1;
  return { startPage, endPage: Math.min(startPage + WRITE_PAGES - 1, totalPages) };
}

export default function BoardPagination({ table, page, totalPages, sca = "" }) {
  if (totalPages <= 1) return null;

  const { startPage, endPage } = getPageRange(page, totalPages);
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

  const navButton = (label, targetPage, extraClass, disabled) =>
    disabled ? (
      <span className={`pg_page ${extraClass} pg_disabled`} aria-disabled="true">
        {label}
      </span>
    ) : (
      <Link to={buildBoardUrl(table, { page: targetPage, sca })} className={`pg_page ${extraClass}`}>
        {label}
      </Link>
    );

  return (
    <nav className="pg_wrap">
      <span className="pg">
        <span className="pg_arrow_group pg_arrow_group--start">
          {navButton("처음", 1, "pg_start", page === 1)}
          {navButton("이전", page - 1, "pg_prev", page === 1)}
        </span>
        {pages.map((current) =>
          current === page ? (
            <strong key={current} className="pg_current" aria-current="page">
              {current}
              <span className="sound_only">페이지</span>
            </strong>
          ) : (
            <Link key={current} to={buildBoardUrl(table, { page: current, sca })} className="pg_page">
              {current}
              <span className="sound_only">페이지</span>
            </Link>
          )
        )}
        <span className="pg_arrow_group pg_arrow_group--end">
          {navButton("다음", page + 1, "pg_next", page === totalPages)}
          {navButton("맨끝", totalPages, "pg_end", page === totalPages)}
        </span>
      </span>
    </nav>
  );
}

