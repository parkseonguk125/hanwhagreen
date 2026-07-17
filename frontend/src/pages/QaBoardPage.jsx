import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import HgHeader from "../components/v2/HgHeader";
import HgFooter from "../components/v2/HgFooter";
import HgSubLayout from "../components/v2/HgSubLayout";
import BoardSearch from "../components/board/BoardSearch";
import QaPostExtras from "../components/board/QaPostExtras";
import { deleteQaPost, fetchQaPost, fetchQaPosts } from "../services/boardApi";
import {
  clearUnlockedQaPost,
  getQaPassword,
  getUnlockedQaPost,
  isQaPostUnlocked,
} from "../services/boardAccess";
import { isAdmin } from "../services/authAccess";
import { filterPosts, boardWriteUrl } from "../services/boardStorage";
import { getQaDisplayFields } from "../utils/qaPostDisplay";
import { boardBanners } from "../config/boardBanners";
import {
  boardPasswordRouteTarget,
  boardRouteTarget,
  boardViewRouteTarget,
  boardWriteRouteTarget,
  parseAppHref,
} from "../utils/navRoutes";

const qaConfig = {
  title: "온라인문의",
  navTitle: "온라인문의",
  banner: boardBanners.qa,
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

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
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
  );
}

function QaLead({ armed, leadRef }) {
  return (
    <section ref={leadRef} className={`hg-proj__lead${armed ? " is-armed" : ""}`}>
      <p className="hg-proj__eyebrow">Contact Us</p>
      <div className="hg-proj__accent" aria-hidden="true" />
      <h2 className="hg-proj__headline">
        <span className="hg-proj__headline-line">궁금하신 내용을 남겨주시면</span>
        <span className="hg-proj__headline-line">
          <strong>성심껏</strong> 답변해 드리겠습니다
        </span>
      </h2>
      <p className="hg-proj__sub">
        시공 상담부터 기술 문의까지, 문의글을 남겨주시면 담당자가 빠르게 확인 후 답변드립니다.
      </p>
    </section>
  );
}

function QaToolbar({ total, keyword, onClearSearch, onSearchOpen }) {
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
        <Link
          to={parseAppHref(boardWriteUrl("qa"))}
          className="hg-proj__search-btn hg-qa__write-btn"
          title="문의하기"
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
          <span>문의하기</span>
        </Link>
      </div>
    </div>
  );
}

function QaList({ posts }) {
  const [listRef, armed] = useArmOnView();

  if (posts.length === 0) {
    return <p className="hg-proj__empty">등록된 문의가 없습니다.</p>;
  }

  return (
    <ol ref={listRef} className={`hg-notice__list${armed ? " is-armed" : ""}`}>
      {posts.map((post, index) => (
        <li
          key={post.id}
          className="hg-notice__item"
          style={{ "--hg-proj-delay": `${(index % 15) * 55}ms` }}
        >
          <Link to={boardViewRouteTarget("qa", post.id)} className="hg-notice__row">
            <span
              className={`hg-qa__status${post.status === "답변완료" ? " is-done" : ""}`}
            >
              {post.status || "접수완료"}
            </span>
            <span className="hg-notice__main">
              <span className="hg-notice__title">
                {post.isSecret && (
                  <span className="hg-qa__lock" title="비밀글">
                    <LockIcon />
                  </span>
                )}
                {post.subject}
              </span>
              <span className="hg-notice__meta">
                <span>{post.author}</span>
                <span className="hg-notice__dot" aria-hidden="true" />
                <span>{post.listDate || post.date}</span>
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

function QaArticleView({ post }) {
  const navigate = useNavigate();
  const viewDate = post.viewDate || post.date;
  const qaFields = getQaDisplayFields(post);
  const rawContent = (qaFields.content || "").trim();
  const paragraphs = rawContent
    ? rawContent.split(/\n\n+/).map((part) => part.trim()).filter(Boolean)
    : [];
  const qaUnlocked = isQaPostUnlocked(post.id);
  const adminLoggedIn = isAdmin();

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      if (adminLoggedIn) {
        await deleteQaPost(post.id);
      } else {
        const password = getQaPassword(post.id);
        if (!password) {
          navigate(boardPasswordRouteTarget("qa", post.id, "d"));
          return;
        }
        await deleteQaPost(post.id, password);
      }
      clearUnlockedQaPost(post.id);
      alert("삭제되었습니다.");
      navigate(boardRouteTarget("qa"));
    } catch (error) {
      alert(error.message);
    }
  };

  const editTarget =
    adminLoggedIn || qaUnlocked || !post.isSecret
      ? boardWriteRouteTarget("qa", { wrId: post.id, mode: "u" })
      : boardPasswordRouteTarget("qa", post.id, "u");

  return (
    <article className="hg-notice-view">
      <header className="hg-notice-view__head">
        <p className="hg-proj__eyebrow">Contact Us</p>
        <h1 className="hg-notice-view__title">
          {post.isSecret && (
            <span className="hg-qa__lock hg-qa__lock--view" title="비밀글">
              <LockIcon />
            </span>
          )}
          {post.subject}
        </h1>
        <p className="hg-notice-view__meta">
          <span className={`hg-qa__status${post.status === "답변완료" ? " is-done" : ""}`}>
            {post.status || "접수완료"}
          </span>
          <span>{post.author}</span>
          <span className="hg-notice__dot" aria-hidden="true" />
          <span>{viewDate}</span>
        </p>
      </header>
      <div className="hg-notice-view__body">
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
        ) : (
          <p>내용이 없습니다.</p>
        )}
      </div>
      <QaPostExtras postId={post.id} fields={qaFields} />
      <div className="hg-proj-view__actions">
        <Link to={boardRouteTarget("qa")} className="hg-proj-view__list-btn">
          목록으로
        </Link>
        <Link to={editTarget} className="hg-proj-view__nav">
          수정
        </Link>
        <button
          type="button"
          className="hg-proj-view__nav hg-notice-view__delete"
          onClick={handleDelete}
        >
          삭제
        </button>
      </div>
    </article>
  );
}

export default function QaBoardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const wrId = searchParams.get("wr_id");
  const adminLoggedIn = isAdmin();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchState, setSearchState] = useState({ field: "wr_subject", keyword: "" });
  const [qaPosts, setQaPosts] = useState([]);
  const [qaLoading, setQaLoading] = useState(!wrId);
  const [viewPost, setViewPost] = useState(() => {
    if (!wrId || !getQaPassword(wrId)) return null;
    return getUnlockedQaPost(wrId);
  });
  const [viewLoading, setViewLoading] = useState(
    () => Boolean(wrId) && !(getQaPassword(wrId) && getUnlockedQaPost(wrId))
  );
  const [needsPassword, setNeedsPassword] = useState(false);
  const [leadRef, leadArmed] = useArmOnView("80px 0px 0px 0px", 0.05);

  useEffect(() => {
    if (wrId) return undefined;

    let cancelled = false;
    setQaLoading(true);

    fetchQaPosts()
      .then((posts) => {
        if (!cancelled) setQaPosts(posts);
      })
      .finally(() => {
        if (!cancelled) setQaLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [wrId]);

  useEffect(() => {
    if (!wrId) {
      setViewPost(null);
      setNeedsPassword(false);
      setViewLoading(false);
      return undefined;
    }

    /* 비밀번호 인증(또는 작성 직후)으로만 캐시 허용 — 관리자 열람 캐시는 게스트 우회로 쓰이지 않음 */
    const unlockedPost = getUnlockedQaPost(wrId);
    const hasPasswordUnlock = Boolean(getQaPassword(wrId));
    if (
      hasPasswordUnlock &&
      unlockedPost &&
      Object.prototype.hasOwnProperty.call(unlockedPost, "content")
    ) {
      setViewPost(unlockedPost);
      setViewLoading(false);
      setNeedsPassword(false);
      return undefined;
    }

    let cancelled = false;
    setViewLoading(true);
    setViewPost(null);
    setNeedsPassword(false);

    fetchQaPost(wrId)
      .then((post) => {
        if (cancelled) return;

        /* 비밀글이면서 content 필드가 없으면 잠금 상태 (빈 문자열 content는 열람 가능) */
        const locked = Boolean(post.isSecret) && !Object.prototype.hasOwnProperty.call(post, "content");

        if (locked) {
          if (adminLoggedIn) {
            /* 관리자인데 content가 없으면 세션 만료 등으로 인증 실패 → 로그인으로 */
            const returnPath = `/bbs/board.php?bo_table=qa&wr_id=${wrId}`;
            navigate(`/bbs/login.php?url=${encodeURIComponent(returnPath)}`, { replace: true });
            return;
          }
          setNeedsPassword(true);
          return;
        }

        /* 관리자/공개 열람은 sessionStorage에 저장하지 않음 (로그아웃 후 보호 우회 방지) */
        setViewPost(post);
      })
      .catch(() => {
        if (!cancelled) setViewPost(null);
      })
      .finally(() => {
        if (!cancelled) setViewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [wrId, adminLoggedIn, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!viewPost) return undefined;

    document.title = `${viewPost.subject} > 온라인문의 | 한화그린`;
    return () => {
      document.title = "한화그린";
    };
  }, [viewPost]);

  const filteredPosts = useMemo(
    () => filterPosts(qaPosts, searchState),
    [qaPosts, searchState]
  );

  const layoutProps = {
    title: qaConfig.title,
    bannerUrl: qaConfig.banner,
    currentNavTitle: qaConfig.navTitle,
    navGroupIndex: 4,
  };

  if (wrId && needsPassword && !(getQaPassword(wrId) && isQaPostUnlocked(wrId)) && !adminLoggedIn) {
    return <Navigate to={boardPasswordRouteTarget("qa", wrId)} replace />;
  }

  if (wrId && viewLoading) {
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

  if (wrId && viewPost) {
    return (
      <>
        <HgHeader />
        <HgSubLayout {...layoutProps}>
          <div className="hg-proj hg-qa">
            <QaArticleView post={viewPost} />
          </div>
        </HgSubLayout>
        <HgFooter />
      </>
    );
  }

  if (wrId) {
    return (
      <>
        <HgHeader />
        <HgSubLayout {...layoutProps}>
          <div className="hg-board-loading">게시물을 불러올 수 없습니다.</div>
        </HgSubLayout>
        <HgFooter />
      </>
    );
  }

  return (
    <>
      <HgHeader />
      <HgSubLayout {...layoutProps}>
        <div className="hg-proj hg-qa">
          <QaLead armed={leadArmed} leadRef={leadRef} />
          <QaToolbar
            total={filteredPosts.length}
            keyword={searchState.keyword}
            onClearSearch={() => setSearchState({ field: "wr_subject", keyword: "" })}
            onSearchOpen={() => setSearchOpen(true)}
          />
          {qaLoading ? (
            <p className="hg-board-loading">불러오는 중...</p>
          ) : (
            <QaList key={searchState.keyword} posts={filteredPosts} />
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
