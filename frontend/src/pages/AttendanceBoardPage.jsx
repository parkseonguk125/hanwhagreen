import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import HgHeader from "../components/v2/HgHeader";
import HgFooter from "../components/v2/HgFooter";
import HgSubLayout from "../components/v2/HgSubLayout";
import BoardSearch from "../components/board/BoardSearch";
import AttendanceBoardView from "../components/board/AttendanceBoardView";
import { boardBanners } from "../config/boardBanners";
import { fetchAttendancePost, fetchAttendancePosts } from "../services/boardApi";
import { isAdmin } from "../services/authAccess";
import { filterPosts } from "../services/boardStorage";
import { boardViewRouteTarget } from "../utils/navRoutes";

const attendanceConfig = {
  title: "출결서비스",
  navTitle: "출결서비스",
  banner: boardBanners.attendance,
};

function attendanceLoginPath(wrId) {
  const returnPath = `/bbs/board.php?bo_table=attendance&wr_id=${wrId}`;
  return `/bbs/login.php?url=${encodeURIComponent(returnPath)}`;
}

function isAttendanceDateSearch({ field, keyword }) {
  if (!keyword) return false;
  return field === "wr_work_date" || field === "wr_month";
}

function useArmOnView(rootMargin = "0px 0px -6% 0px", threshold = 0.05) {
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

/** "어디서 · 누가 · 무엇을" 형태의 목록 제목을 분해 */
function parseListSubject(post) {
  const raw = post.listSubject || post.subject || "";
  const parts = raw.split(" · ");
  if (parts.length >= 3) {
    return { where: parts[0], who: parts[1], what: parts.slice(2).join(" · ") };
  }
  return { where: raw, who: post.reporterName || "-", what: "" };
}

/** "2024-05-12" → { day: "12", rest: "2024.05" } */
function splitWorkDate(workDate = "") {
  const match = String(workDate).match(/^(\d{4})[.-](\d{2})[.-](\d{2})/);
  if (!match) return { day: "-", rest: workDate || "" };
  return { day: match[3], rest: `${match[1]}.${match[2]}` };
}

function AttendanceLead({ armed, leadRef }) {
  return (
    <section ref={leadRef} className={`hg-proj__lead${armed ? " is-armed" : ""}`}>
      <p className="hg-proj__eyebrow">Attendance</p>
      <div className="hg-proj__accent" aria-hidden="true" />
      <h2 className="hg-proj__headline">
        <span className="hg-proj__headline-line">현장의 하루를 기록하는</span>
        <span className="hg-proj__headline-line">
          <strong>출결 리포트</strong>
        </span>
      </h2>
      <p className="hg-proj__sub">
        현장별 출결 기록을 한눈에 확인하세요. GPS 위치·작업내용·현장사진 등 상세 내용은 관리자
        로그인 후 열람할 수 있습니다.
      </p>
    </section>
  );
}

function AttendanceToolbar({ total, searchState, onClearSearch, onSearchOpen }) {
  const searching = Boolean(searchState.keyword);
  const searchLabel =
    searchState.field === "wr_month"
      ? `${searchState.keyword} 월별`
      : searchState.field === "wr_work_date"
        ? `${searchState.keyword} 작업일`
        : `"${searchState.keyword}"`;

  return (
    <div className="hg-notice__toolbar">
      <div className="hg-proj__meta" aria-live="polite">
        총 <strong>{total}</strong>건
        {searching && (
          <>
            <span> · {searchLabel} 검색 결과</span>
            <button type="button" className="hg-proj__search-clear" onClick={onClearSearch}>
              검색 초기화 ×
            </button>
          </>
        )}
      </div>
      <div className="hg-notice__actions">
        <button
          type="button"
          className="hg-proj__search-btn"
          onClick={onSearchOpen}
          title="게시판 검색"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M21 21l-4.35-4.35m1.85-4.9a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>검색</span>
        </button>
      </div>
    </div>
  );
}

function AttendanceList({ posts }) {
  const [listRef, armed] = useArmOnView();

  if (posts.length === 0) {
    return <p className="hg-proj__empty">출결 기록이 없습니다.</p>;
  }

  return (
    <ol ref={listRef} className={`hg-notice__list${armed ? " is-armed" : ""}`}>
      {posts.map((post, index) => {
        const { where, who, what } = parseListSubject(post);
        const { day, rest } = splitWorkDate(post.workDate);
        return (
          <li
            key={post.id}
            className="hg-notice__item"
            style={{ "--hg-proj-delay": `${(index % 15) * 55}ms` }}
          >
            <Link
              to={boardViewRouteTarget("attendance", post.id)}
              className="hg-notice__row hg-att__row"
            >
              <span className="hg-att__date" aria-label={`작업일 ${post.workDate || ""}`}>
                <span className="hg-att__date-day">{day}</span>
                <span className="hg-att__date-rest">{rest}</span>
              </span>
              <span className="hg-notice__main">
                <span className="hg-notice__title">{where}</span>
                <span className="hg-notice__meta">
                  <span className="hg-att__who">{who}</span>
                  {what && (
                    <>
                      <span className="hg-notice__dot" aria-hidden="true" />
                      <span className="hg-att__what">{what}</span>
                    </>
                  )}
                </span>
              </span>
              <span className="hg-att__lock-hint" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <rect
                    x="5"
                    y="11"
                    width="14"
                    height="9"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 11V7a4 4 0 018 0v4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                관리자
              </span>
              <span className="hg-notice__arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    d="M9 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export default function AttendanceBoardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const wrId = searchParams.get("wr_id");

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchState, setSearchState] = useState({ field: "wr_subject", keyword: "" });
  const [posts, setPosts] = useState([]);
  const [listLoading, setListLoading] = useState(!wrId);
  const [viewPost, setViewPost] = useState(null);
  const [viewLoading, setViewLoading] = useState(Boolean(wrId));
  const [viewMissing, setViewMissing] = useState(false);
  const [leadRef, leadArmed] = useArmOnView("80px 0px 0px 0px", 0.05);

  useEffect(() => {
    if (wrId) return undefined;

    let cancelled = false;
    setListLoading(true);

    const dateSearch = isAttendanceDateSearch(searchState);
    const request = dateSearch
      ? fetchAttendancePosts({
          workDate: searchState.field === "wr_work_date" ? searchState.keyword : "",
          month: searchState.field === "wr_month" ? searchState.keyword : "",
        })
      : fetchAttendancePosts();

    request
      .then((items) => {
        if (!cancelled) setPosts(items);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [wrId, searchState.field, searchState.keyword]);

  useEffect(() => {
    if (!wrId) {
      setViewPost(null);
      setViewLoading(false);
      setViewMissing(false);
      return undefined;
    }

    if (!isAdmin()) {
      navigate(attendanceLoginPath(wrId), { replace: true });
      return undefined;
    }

    let cancelled = false;
    setViewLoading(true);
    setViewMissing(false);
    setViewPost(null);

    fetchAttendancePost(wrId)
      .then((post) => {
        if (!cancelled) setViewPost(post);
      })
      .catch(() => {
        if (!cancelled) setViewMissing(true);
      })
      .finally(() => {
        if (!cancelled) setViewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [wrId, navigate]);

  const filteredPosts = useMemo(() => {
    if (isAttendanceDateSearch(searchState)) {
      return posts;
    }
    return filterPosts(posts, searchState);
  }, [posts, searchState]);

  const handleSearch = ({ field, keyword }) => {
    setSearchState({ field, keyword });
  };

  useEffect(() => {
    if (viewPost) {
      document.title = `${viewPost.detailSubject || viewPost.listSubject || viewPost.subject} > 출결서비스 | 한화그린`;
      return () => {
        document.title = "한화그린";
      };
    }

    document.title = "출결서비스 페이지 | 한화그린";
    return () => {
      document.title = "한화그린";
    };
  }, [viewPost]);

  const layoutProps = {
    title: attendanceConfig.title,
    bannerUrl: attendanceConfig.banner,
    currentNavTitle: attendanceConfig.navTitle,
    navGroupIndex: 4,
  };

  if (wrId) {
    if (viewLoading) {
      return (
        <>
          <HgHeader />
          <HgSubLayout {...layoutProps}>
            <div className="hg-board-loading">불러오는 중...</div>
          </HgSubLayout>
          <HgFooter />
        </>
      );
    }

    if (viewMissing || !viewPost) {
      return (
        <>
          <HgHeader />
          <HgSubLayout {...layoutProps}>
            <div className="hg-board-loading">출결 기록을 찾을 수 없습니다.</div>
          </HgSubLayout>
          <HgFooter />
        </>
      );
    }

    return (
      <>
        <HgHeader />
        <HgSubLayout {...layoutProps}>
          <AttendanceBoardView post={viewPost} />
        </HgSubLayout>
        <HgFooter />
      </>
    );
  }

  return (
    <>
      <HgHeader />
      <HgSubLayout {...layoutProps}>
        <div className="hg-proj hg-att">
          <AttendanceLead armed={leadArmed} leadRef={leadRef} />
          <AttendanceToolbar
            total={filteredPosts.length}
            searchState={searchState}
            onClearSearch={() => setSearchState({ field: "wr_subject", keyword: "" })}
            onSearchOpen={() => setSearchOpen(true)}
          />
          {listLoading ? (
            <p className="hg-board-loading">불러오는 중...</p>
          ) : (
            <AttendanceList
              key={`${searchState.field}-${searchState.keyword}`}
              posts={filteredPosts}
            />
          )}
          <BoardSearch
            mode="attendance"
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            onSearch={handleSearch}
            initialField={searchState.field}
            initialKeyword={searchState.keyword}
          />
        </div>
      </HgSubLayout>
      <HgFooter />
    </>
  );
}
