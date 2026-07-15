import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import HgHeader from "../components/v2/HgHeader";
import HgFooter from "../components/v2/HgFooter";
import HgSubLayout from "../components/v2/HgSubLayout";
import BoardSearch from "../components/board/BoardSearch";
import BoardPagination from "../components/board/BoardPagination";
import { scaMatches } from "../components/board/ProjectCategoryNav";
import projectGalleryMeta from "../data/projectGalleryMeta.json";
import { buildBoardUrl } from "../utils/boardSca";
import { boardBanners } from "../config/boardBanners";
import {
  filterPosts,
  getGalleryPost,
  incrementGalleryHits,
  galleryPostsForTable,
} from "../services/boardStorage";
import { boardViewRouteTarget, subNavGroups } from "../utils/navRoutes";

/** "상철농장_202505291_51" → { name: "상철농장", date: "2025.05" } */
function parseProjectTitle(title = "") {
  const name = title.split("_")[0].trim() || title;
  const match = title.match(/(20\d{2})(0[1-9]|1[0-2])([0-3]\d)/);
  const date = match ? `${match[1]}.${match[2]}` : "";
  return { name, date };
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

function ProjectLead({ total, armed, leadRef }) {
  return (
    <section ref={leadRef} className={`hg-proj__lead${armed ? " is-armed" : ""}`}>
      <p className="hg-proj__eyebrow">Portfolio</p>
      <div className="hg-proj__accent" aria-hidden="true" />
      <h2 className="hg-proj__headline">
        <span className="hg-proj__headline-line">전국 현장에서 쌓아온</span>
        <span className="hg-proj__headline-line">
          <strong>{total.toLocaleString()}</strong>건의 생생한 기록
        </span>
      </h2>
      <p className="hg-proj__sub">
        액비순환시스템부터 축사현대화까지, 한화그린이 시공한 현장을 사진으로 확인하세요.
      </p>
    </section>
  );
}

/* ─── 인증서 (certification) ─── */

const CERT_CATEGORIES = [
  { key: "", label: "전체" },
  { key: "patent", label: "특허" },
  { key: "management", label: "경영시스템 인증" },
  { key: "license", label: "등록·확인서" },
  { key: "award", label: "평가·선정" },
];

function certCategoryKey(post) {
  const text = `${post.subject} ${post.content || ""}`;
  if (/평가|선정|협력사업|지원사업/.test(text)) return "award";
  if (/경영시스템/.test(text)) return "management";
  if (/등록증|확인서/.test(text)) return "license";
  return "patent";
}

function certBadgeLabel(post) {
  const key = certCategoryKey(post);
  return CERT_CATEGORIES.find((category) => category.key === key)?.label ?? "";
}

function CertLead({ total, armed, leadRef }) {
  return (
    <section ref={leadRef} className={`hg-proj__lead${armed ? " is-armed" : ""}`}>
      <p className="hg-proj__eyebrow">Certification &amp; Patent</p>
      <div className="hg-proj__accent" aria-hidden="true" />
      <h2 className="hg-proj__headline">
        <span className="hg-proj__headline-line">기술력을 증명하는</span>
        <span className="hg-proj__headline-line">
          <strong>{total.toLocaleString()}</strong>건의 인증과 특허
        </span>
      </h2>
      <p className="hg-proj__sub">
        특허등록증부터 경영시스템 인증까지, 한화그린의 공인된 기술 경쟁력을 확인하세요.
      </p>
    </section>
  );
}

function CertCategoryChips({ activeKey, onSelect, onSearchOpen }) {
  return (
    <div className="hg-proj__filter">
      <nav className="hg-proj__cats" aria-label="인증서 분류">
        {CERT_CATEGORIES.map((category) => (
          <button
            key={category.key}
            type="button"
            className={`hg-proj__cat${activeKey === category.key ? " is-active" : ""}`}
            aria-pressed={activeKey === category.key}
            onClick={() => onSelect(category.key)}
          >
            {category.label}
          </button>
        ))}
      </nav>
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
  );
}

function CertGalleryList({ posts, table }) {
  const [gridRef, armed] = useArmOnView();

  if (posts.length === 0) {
    return <p className="hg-proj__empty">게시물이 없습니다.</p>;
  }

  return (
    <div ref={gridRef} className={`hg-cert__grid${armed ? " is-armed" : ""}`}>
      {posts.map((post, index) => (
        <Link
          key={post.id}
          to={boardViewRouteTarget(table, post.id)}
          className="hg-cert__card"
          title={post.subject}
          style={{ "--hg-proj-delay": `${(index % 15) * 60}ms` }}
        >
          <span className="hg-cert__card-frame">
            <img src={post.imageLink || post.image} alt={post.subject} loading="lazy" />
            <span className="hg-cert__card-glare" aria-hidden="true" />
          </span>
          <span className="hg-cert__card-body">
            <span className="hg-cert__card-badge">{certBadgeLabel(post)}</span>
            <span className="hg-cert__card-title">{post.subject}</span>
            <span className="hg-cert__card-date">{post.date}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

function CertBoardView({ post, table }) {
  const listTarget = `/bbs/board.php?bo_table=${table}`;
  const posts = galleryPostsForTable(table);
  const currentIndex = posts.findIndex((p) => p.id === post.id);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost =
    currentIndex >= 0 && currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return (
    <article className="hg-proj-view hg-cert-view">
      <header className="hg-proj-view__head">
        <p className="hg-proj__eyebrow">Certification &amp; Patent</p>
        <h1 className="hg-proj-view__title">{post.subject}</h1>
        <p className="hg-proj-view__date">
          <span className="hg-cert__card-badge">{certBadgeLabel(post)}</span> {post.date}
        </p>
      </header>
      <figure className="hg-cert-view__figure">
        <img src={post.imageLink || post.image} alt={post.subject} />
      </figure>
      <div className="hg-proj-view__actions">
        {prevPost ? (
          <Link to={boardViewRouteTarget(table, prevPost.id)} className="hg-proj-view__nav">
            ← 이전
          </Link>
        ) : (
          <span className="hg-proj-view__nav is-disabled">← 이전</span>
        )}
        <Link to={listTarget} className="hg-proj-view__list-btn">
          목록으로
        </Link>
        {nextPost ? (
          <Link to={boardViewRouteTarget(table, nextPost.id)} className="hg-proj-view__nav">
            다음 →
          </Link>
        ) : (
          <span className="hg-proj-view__nav is-disabled">다음 →</span>
        )}
      </div>
    </article>
  );
}

function ProjectCategoryChips({ table, activeSca, onSearchOpen }) {
  return (
    <div className="hg-proj__filter">
      <nav className="hg-proj__cats" aria-label="실적 분류">
        {projectGalleryMeta.categories.map((category) => {
          const isActive = scaMatches(activeSca, category.sca);
          return (
            <Link
              key={category.label}
              to={buildBoardUrl(table, { sca: category.sca })}
              className={`hg-proj__cat${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "true" : undefined}
            >
              {category.label}
            </Link>
          );
        })}
      </nav>
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
  );
}

const galleryConfigs = {
  project: {
    table: "project",
    title: "주요실적",
    navTitle: "주요실적",
    navGroupIndex: 2,
    pageSize: 15,
  },
  certification: {
    table: "certification",
    title: "인증서",
    navTitle: "인증서",
    navGroupIndex: 3,
    parentTitle: "지식산업권 외",
    pageSize: 15,
  },
};

function ProjectGalleryList({ posts, table }) {
  const [gridRef, armed] = useArmOnView();

  if (posts.length === 0) {
    return <p className="hg-proj__empty">게시물이 없습니다.</p>;
  }

  return (
    <div ref={gridRef} className={`hg-proj__grid${armed ? " is-armed" : ""}`}>
      {posts.map((post, index) => {
        const { name, date } = parseProjectTitle(post.subject);
        return (
          <Link
            key={post.id}
            to={boardViewRouteTarget(table, post.id)}
            className="hg-proj__card"
            title={post.subject}
            style={{ "--hg-proj-delay": `${(index % 15) * 55}ms` }}
          >
            <span className="hg-proj__card-media">
              <img src={post.image} alt={post.subject} loading="lazy" />
            </span>
            <span className="hg-proj__card-veil" aria-hidden="true" />
            <span className="hg-proj__card-body">
              {date && <span className="hg-proj__card-date">{date}</span>}
              <span className="hg-proj__card-name">{name}</span>
            </span>
            <span className="hg-proj__card-plus" aria-hidden="true">
              +
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function ProjectBoardView({ post, table }) {
  const listTarget = `/bbs/board.php?bo_table=${table}`;
  const { name, date } = parseProjectTitle(post.subject);
  const posts = galleryPostsForTable(table);
  const currentIndex = posts.findIndex((p) => p.id === post.id);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost =
    currentIndex >= 0 && currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return (
    <article className="hg-proj-view">
      <header className="hg-proj-view__head">
        <p className="hg-proj__eyebrow">Portfolio</p>
        <h1 className="hg-proj-view__title">{name}</h1>
        {date && <p className="hg-proj-view__date">{date}</p>}
      </header>
      <figure className="hg-proj-view__figure">
        <img src={post.imageLink || post.image} alt={post.subject} />
      </figure>
      <div className="hg-proj-view__actions">
        {prevPost ? (
          <Link
            to={boardViewRouteTarget(table, prevPost.id)}
            className="hg-proj-view__nav"
          >
            ← 이전
          </Link>
        ) : (
          <span className="hg-proj-view__nav is-disabled">← 이전</span>
        )}
        <Link to={listTarget} className="hg-proj-view__list-btn">
          목록으로
        </Link>
        {nextPost ? (
          <Link
            to={boardViewRouteTarget(table, nextPost.id)}
            className="hg-proj-view__nav"
          >
            다음 →
          </Link>
        ) : (
          <span className="hg-proj-view__nav is-disabled">다음 →</span>
        )}
      </div>
    </article>
  );
}

export default function GalleryBoardPage({ table }) {
  const config = galleryConfigs[table];
  const [searchParams] = useSearchParams();
  const wrId = searchParams.get("wr_id");
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const activeSca = searchParams.get("sca") || "";
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchState, setSearchState] = useState({ field: "wr_subject", keyword: "" });
  const [certCategory, setCertCategory] = useState("");
  const [leadRef, leadArmed] = useArmOnView("80px 0px 0px 0px", 0.05);
  const allPosts = useMemo(() => galleryPostsForTable(table), [table]);

  const filteredPosts = useMemo(() => {
    let posts = filterPosts(allPosts, searchState);

    if (table === "project" && activeSca) {
      posts = posts.filter((post) => scaMatches(activeSca, post.categorySca));
    }

    if (table === "certification" && certCategory) {
      posts = posts.filter((post) => certCategoryKey(post) === certCategory);
    }

    return posts;
  }, [allPosts, searchState, table, activeSca, certCategory]);

  const pageSize = config?.pageSize ?? 15;
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagePosts = filteredPosts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const viewPost = useMemo(
    () => (wrId ? getGalleryPost(table, wrId) : null),
    [table, wrId]
  );

  useEffect(() => {
    if (viewPost) {
      incrementGalleryHits(table, viewPost.id);
      document.title = `${viewPost.subject} > ${config.title} | 한화그린`;
      return () => {
        document.title = "한화그린";
      };
    }
    document.title = `${config.title}  페이지 | 한화그린`;
    return () => {
      document.title = "한화그린";
    };
  }, [viewPost, config?.title]);

  if (!config) {
    return null;
  }

  const parentTitle = config.parentTitle ?? subNavGroups[config.navGroupIndex]?.title ?? "";
  const banner = boardBanners[table];

  const layoutProps = {
    title: config.title,
    bannerUrl: banner,
    visualSubtitle: config.visualSubtitle,
    currentNavTitle: config.navTitle,
    navGroupIndex: config.navGroupIndex,
    parentTitle,
  };

  if (wrId) {
    if (!viewPost) {
      return (
        <>
          <HgHeader />
          <HgSubLayout {...layoutProps}>
            <div className="hg-board-loading">게시물을 찾을 수 없습니다.</div>
          </HgSubLayout>
          <HgFooter />
        </>
      );
    }

    return (
      <>
        <HgHeader />
        <HgSubLayout {...layoutProps}>
          {table === "certification" ? (
            <CertBoardView post={viewPost} table={table} />
          ) : (
            <ProjectBoardView post={viewPost} table={table} />
          )}
        </HgSubLayout>
        <HgFooter />
      </>
    );
  }

  if (table === "project") {
    return (
      <>
        <HgHeader />
        <HgSubLayout {...layoutProps} wide>
          <div className="hg-proj">
            <ProjectLead total={allPosts.length} armed={leadArmed} leadRef={leadRef} />
            <ProjectCategoryChips
              table={table}
              activeSca={activeSca}
              onSearchOpen={() => setSearchOpen(true)}
            />
            <div className="hg-proj__meta" aria-live="polite">
              총 <strong>{filteredPosts.length}</strong>건
              {searchState.keyword && (
                <>
                  <span> · "{searchState.keyword}" 검색 결과</span>
                  <button
                    type="button"
                    className="hg-proj__search-clear"
                    onClick={() => setSearchState({ field: "wr_subject", keyword: "" })}
                  >
                    검색 초기화 ×
                  </button>
                </>
              )}
            </div>
            <ProjectGalleryList key={`${activeSca}-${currentPage}-${searchState.keyword}`} posts={pagePosts} table={table} />
            {pagePosts.length > 0 && (
              <BoardPagination
                table={table}
                page={currentPage}
                totalPages={totalPages}
                sca={activeSca}
              />
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

  return (
    <>
      <HgHeader />
      <HgSubLayout {...layoutProps} wide>
        <div className="hg-proj hg-cert">
          <CertLead total={allPosts.length} armed={leadArmed} leadRef={leadRef} />
          <CertCategoryChips
            activeKey={certCategory}
            onSelect={setCertCategory}
            onSearchOpen={() => setSearchOpen(true)}
          />
          <div className="hg-proj__meta" aria-live="polite">
            총 <strong>{filteredPosts.length}</strong>건
            {searchState.keyword && (
              <>
                <span> · "{searchState.keyword}" 검색 결과</span>
                <button
                  type="button"
                  className="hg-proj__search-clear"
                  onClick={() => setSearchState({ field: "wr_subject", keyword: "" })}
                >
                  검색 초기화 ×
                </button>
              </>
            )}
          </div>
          <CertGalleryList
            key={`${certCategory}-${currentPage}-${searchState.keyword}`}
            posts={pagePosts}
            table={table}
          />
          {pagePosts.length > 0 && (
            <BoardPagination
              table={table}
              page={currentPage}
              totalPages={totalPages}
              sca={activeSca}
            />
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
