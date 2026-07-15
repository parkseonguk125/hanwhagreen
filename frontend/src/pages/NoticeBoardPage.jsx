import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import HgHeader from "../components/v2/HgHeader";
import HgFooter from "../components/v2/HgFooter";
import HgSubLayout from "../components/v2/HgSubLayout";
import BoardSearch from "../components/board/BoardSearch";
import { boardBanners } from "../config/boardBanners";
import { deleteNoticePost, fetchNoticePost, fetchNoticePosts } from "../services/boardApi";
import { isAdmin } from "../services/authAccess";
import { filterPosts, boardWriteUrl } from "../services/boardStorage";
import {
  boardRouteTarget,
  boardViewRouteTarget,
  boardWriteRouteTarget,
  parseAppHref,
} from "../utils/navRoutes";
import "../styles/board-pages.css";

const noticeConfig = {
  title: "공지사항",
  navTitle: "공지사항",
  banner: boardBanners.notice,
};

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

function NoticeLead({ armed, leadRef }) {
  return (
    <section ref={leadRef} className={`hg-proj__lead${armed ? " is-armed" : ""}`}>
      <p className="hg-proj__eyebrow">Notice</p>
      <div className="hg-proj__accent" aria-hidden="true" />
      <h2 className="hg-proj__headline">
        <span className="hg-proj__headline-line">한화그린이 전하는</span>
        <span className="hg-proj__headline-line">
          새로운 <strong>소식</strong>을 확인하세요
        </span>
      </h2>
      <p className="hg-proj__sub">
        공지사항과 안내 소식을 통해 한화그린의 최신 소식을 가장 먼저 만나보세요.
      </p>
    </section>
  );
}

function NoticeToolbar({ total, keyword, onClearSearch, onSearchOpen, showWrite }) {
  return (
    <div className="hg-notice__toolbar">
      <div className="hg-proj__meta" aria-live="polite">
        총 <strong>{total}</strong>건
        {keyword && (
          <>
            <span> · "{keyword}" 검색 결과</span>
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
        {showWrite && (
          <Link
            to={parseAppHref(boardWriteUrl("notice"))}
            className="hg-proj__search-btn hg-notice__write-btn"
            title="글쓰기"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path
                d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>글쓰기</span>
          </Link>
        )}
      </div>
    </div>
  );
}

function NoticeList({ posts }) {
  const [listRef, armed] = useArmOnView();

  if (posts.length === 0) {
    return <p className="hg-proj__empty">게시물이 없습니다.</p>;
  }

  return (
    <ol ref={listRef} className={`hg-notice__list${armed ? " is-armed" : ""}`}>
      {posts.map((post, index) => (
        <li
          key={post.id}
          className="hg-notice__item"
          style={{ "--hg-proj-delay": `${(index % 15) * 55}ms` }}
        >
          <Link
            to={boardViewRouteTarget("notice", post.id)}
            className={`hg-notice__row${post.isNotice ? " is-pinned" : ""}`}
          >
            <span className={`hg-notice__badge${post.isNotice ? " is-pinned" : ""}`}>
              {post.isNotice ? "공지" : post.id}
            </span>
            <span className="hg-notice__main">
              <span className="hg-notice__title">{post.subject}</span>
              <span className="hg-notice__meta">
                <span>{post.author}</span>
                <span className="hg-notice__dot" aria-hidden="true" />
                <span>{post.date}</span>
                {post.hits != null && (
                  <>
                    <span className="hg-notice__dot" aria-hidden="true" />
                    <span>조회 {Number(post.hits).toLocaleString()}</span>
                  </>
                )}
              </span>
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
      ))}
    </ol>
  );
}

function NoticeArticleView({ post }) {
  const navigate = useNavigate();
  const canManage = isAdmin();
  const viewDate = post.viewDate || post.date;
  const rawContent = (post.content || "").trim();
  const paragraphs = rawContent
    ? rawContent.split(/\n\n+/).map((part) => part.trim()).filter(Boolean)
    : [];

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteNoticePost(post.id);
      alert("삭제되었습니다.");
      navigate(boardRouteTarget("notice"));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <article className="hg-notice-view">
      <header className="hg-notice-view__head">
        <p className="hg-proj__eyebrow">Notice</p>
        <h1 className="hg-notice-view__title">{post.subject}</h1>
        <p className="hg-notice-view__meta">
          <span>{post.author}</span>
          <span className="hg-notice__dot" aria-hidden="true" />
          <span>{viewDate}</span>
          {post.hits != null && (
            <>
              <span className="hg-notice__dot" aria-hidden="true" />
              <span>조회 {Number(post.hits).toLocaleString()}</span>
            </>
          )}
        </p>
      </header>
      <div className="hg-notice-view__body">
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
        ) : (
          <p>내용이 없습니다.</p>
        )}
      </div>
      <div className="hg-proj-view__actions">
        <Link to={boardRouteTarget("notice")} className="hg-proj-view__list-btn">
          목록으로
        </Link>
        {canManage && (
          <>
            <Link
              to={boardWriteRouteTarget("notice", { wrId: post.id, mode: "u" })}
              className="hg-proj-view__nav"
            >
              수정
            </Link>
            <button type="button" className="hg-proj-view__nav hg-notice-view__delete" onClick={handleDelete}>
              삭제
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export default function NoticeBoardPage() {
  const [searchParams] = useSearchParams();
  const wrId = searchParams.get("wr_id");

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchState, setSearchState] = useState({ field: "wr_subject", keyword: "" });
  const [noticePosts, setNoticePosts] = useState([]);
  const [listLoading, setListLoading] = useState(!wrId);
  const [viewPost, setViewPost] = useState(null);
  const [viewLoading, setViewLoading] = useState(Boolean(wrId));
  const [viewMissing, setViewMissing] = useState(false);
  const [leadRef, leadArmed] = useArmOnView("80px 0px 0px 0px", 0.05);

  useEffect(() => {
    if (wrId) return undefined;

    let cancelled = false;
    setListLoading(true);

    fetchNoticePosts()
      .then((posts) => {
        if (!cancelled) setNoticePosts(posts);
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [wrId]);

  useEffect(() => {
    if (!wrId) {
      setViewPost(null);
      setViewLoading(false);
      setViewMissing(false);
      return undefined;
    }

    let cancelled = false;
    setViewLoading(true);
    setViewMissing(false);
    setViewPost(null);

    fetchNoticePost(wrId)
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
  }, [wrId]);

  const filteredPosts = useMemo(
    () => filterPosts(noticePosts, searchState),
    [noticePosts, searchState]
  );

  useEffect(() => {
    if (viewPost) {
      document.title = `${viewPost.subject} > 공지사항 | 한화그린`;
      return () => {
        document.title = "한화그린";
      };
    }

    document.title = "공지사항  페이지 | 한화그린";
    return () => {
      document.title = "한화그린";
    };
  }, [viewPost]);

  const layoutProps = {
    title: noticeConfig.title,
    bannerUrl: noticeConfig.banner,
    currentNavTitle: noticeConfig.navTitle,
    navGroupIndex: 4,
  };

  if (wrId) {
    if (viewLoading || viewMissing || !viewPost) {
      return (
        <>
          <HgHeader />
          <HgSubLayout {...layoutProps}>
            <div className="hg-board-loading">
              {viewLoading ? "불러오는 중..." : "게시물을 찾을 수 없습니다."}
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
          <div className="hg-proj hg-notice">
            <NoticeArticleView post={viewPost} />
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
        <div className="hg-proj hg-notice">
          <NoticeLead armed={leadArmed} leadRef={leadRef} />
          <NoticeToolbar
            total={filteredPosts.length}
            keyword={searchState.keyword}
            onClearSearch={() => setSearchState({ field: "wr_subject", keyword: "" })}
            onSearchOpen={() => setSearchOpen(true)}
            showWrite={isAdmin()}
          />
          {listLoading ? (
            <p className="hg-board-loading">불러오는 중...</p>
          ) : (
            <NoticeList key={searchState.keyword} posts={filteredPosts} />
          )}
          <BoardSearch
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            onSearch={setSearchState}
            initialField={searchState.field}
            initialKeyword={searchState.keyword}
          />
        </div>
      </HgSubLayout>
      <HgFooter />
    </>
  );
}
