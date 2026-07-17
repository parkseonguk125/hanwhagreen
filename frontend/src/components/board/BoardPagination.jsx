import { Link } from "react-router-dom";
import { buildBoardUrl } from "../../utils/boardSca";
import { useHgViewport } from "../v2/hooks.js";

const WRITE_PAGES_DESKTOP = 10;
const WRITE_PAGES_MOBILE = 3;

function getPageRange(page, totalPages, windowSize) {
  if (totalPages <= windowSize) {
    return { startPage: 1, endPage: totalPages };
  }

  const half = Math.floor(windowSize / 2);
  let startPage = Math.max(1, page - half);
  let endPage = startPage + windowSize - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - windowSize + 1);
  }

  return { startPage, endPage };
}

export default function BoardPagination({ table, page, totalPages, sca = "" }) {
  const { isMobile } = useHgViewport();
  if (totalPages <= 1) return null;

  const windowSize = isMobile ? WRITE_PAGES_MOBILE : WRITE_PAGES_DESKTOP;
  const { startPage, endPage } = getPageRange(page, totalPages, windowSize);
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

  const labels = isMobile
    ? { start: "\u00AB", prev: "\u2039", next: "\u203A", end: "\u00BB" }
    : { start: "\uCC98\uC74C", prev: "\uC774\uC804", next: "\uB2E4\uC74C", end: "\uB9E8\uB05D" };

  const navButton = (label, targetPage, extraClass, disabled, ariaLabel) =>
    disabled ? (
      <span
        className={`pg_page ${extraClass} pg_disabled`}
        aria-disabled="true"
        aria-label={ariaLabel}
      >
        {label}
      </span>
    ) : (
      <Link
        to={buildBoardUrl(table, { page: targetPage, sca })}
        className={`pg_page ${extraClass}`}
        aria-label={ariaLabel}
      >
        {label}
      </Link>
    );

  if (isMobile) {
    return (
      <nav className="pg_wrap pg_wrap--mobile" aria-label="\uD398\uC774\uC9C0 \uC774\uB3D9">
        <div className="pg pg--mobile">
          {navButton(labels.start, 1, "pg_start", page === 1, "\uCC98\uC74C \uD398\uC774\uC9C0")}
          {navButton(labels.prev, page - 1, "pg_prev", page === 1, "\uC774\uC804 \uD398\uC774\uC9C0")}

          <span className="pg_nums" aria-label="\uD398\uC774\uC9C0 \uBC88\uD638">
            {pages.map((current) =>
              current === page ? (
                <strong key={current} className="pg_current" aria-current="page">
                  {current}
                </strong>
              ) : (
                <Link
                  key={current}
                  to={buildBoardUrl(table, { page: current, sca })}
                  className="pg_page"
                >
                  {current}
                </Link>
              )
            )}
          </span>

          {navButton(
            labels.next,
            page + 1,
            "pg_next",
            page === totalPages,
            "\uB2E4\uC74C \uD398\uC774\uC9C0"
          )}
          {navButton(
            labels.end,
            totalPages,
            "pg_end",
            page === totalPages,
            "\uB9E8\uB05D \uD398\uC774\uC9C0"
          )}
        </div>
        <p className="pg_status">
          <strong>{page}</strong>
          <span aria-hidden="true">/</span>
          <span>{totalPages}</span>
        </p>
      </nav>
    );
  }

  return (
    <nav className="pg_wrap" aria-label="\uD398\uC774\uC9C0 \uC774\uB3D9">
      <div className="pg">
        <span className="pg_arrow_group pg_arrow_group--start">
          {navButton(labels.start, 1, "pg_start", page === 1, "\uCC98\uC74C \uD398\uC774\uC9C0")}
          {navButton(labels.prev, page - 1, "pg_prev", page === 1, "\uC774\uC804 \uD398\uC774\uC9C0")}
        </span>

        <span className="pg_nums" aria-label="\uD398\uC774\uC9C0 \uBC88\uD638">
          {pages.map((current) =>
            current === page ? (
              <strong key={current} className="pg_current" aria-current="page">
                {current}
              </strong>
            ) : (
              <Link
                key={current}
                to={buildBoardUrl(table, { page: current, sca })}
                className="pg_page"
              >
                {current}
              </Link>
            )
          )}
        </span>

        <span className="pg_arrow_group pg_arrow_group--end">
          {navButton(
            labels.next,
            page + 1,
            "pg_next",
            page === totalPages,
            "\uB2E4\uC74C \uD398\uC774\uC9C0"
          )}
          {navButton(
            labels.end,
            totalPages,
            "pg_end",
            page === totalPages,
            "\uB9E8\uB05D \uD398\uC774\uC9C0"
          )}
        </span>
      </div>
    </nav>
  );
}
