import { useEffect, useMemo, useState } from "react";
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

/** "어디서 · 누가 · 무엇을" 형태의 목록 제목을 분해 */
function parseListSubject(post) {
  const raw = post.listSubject || post.subject || "";
  const parts = raw.split(" · ");
  if (parts.length >= 3) {
    return { where: parts[0], who: parts[1], what: parts.slice(2).join(" · ") };
  }
  return { where: raw, who: post.reporterName || "-", what: "" };
}

function AttendanceLead() {
  return (
    <header className="hg-proj__lead">
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
    </header>
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
  if (posts.length === 0) {
    return <p className="hg-proj__empty">출결 기록이 없습니다.</p>;
  }

  return (
    <div className="hg-board-table-wrap">
      <table className="hg-board-table hg-board-table--att">
        <caption className="sound_only">출결서비스 목록</caption>
        <thead>
          <tr>
            <th scope="col" className="hg-board-table__date">
              작업일
            </th>
            <th scope="col" className="hg-board-table__subject">
              현장
            </th>
            <th scope="col" className="hg-board-table__author">
              담당
            </th>
            <th scope="col" className="hg-board-table__what">
              작업내용
            </th>
            <th scope="col" className="hg-board-table__lock">
              열람
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => {
            const { where, who, what } = parseListSubject(post);
            return (
              <tr key={post.id}>
                <td className="hg-board-table__date">{post.workDate || "-"}</td>
                <td className="hg-board-table__subject">
                  <Link to={boardViewRouteTarget("attendance", post.id)}>{where}</Link>
                </td>
                <td className="hg-board-table__author">{who}</td>
                <td className="hg-board-table__what">{what || "-"}</td>
                <td className="hg-board-table__lock">관리자</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
          <div className="hg-proj hg-att hg-proj--cs">
            <AttendanceBoardView post={viewPost} />
          </div>
        </HgSubLayout>
        <HgFooter />
      </>
    );
  }

  return (
    <>
      <HgHeader />
      <HgSubLayout {...layoutProps}>
        <div className="hg-proj hg-att hg-proj--cs">
          <AttendanceLead />
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
