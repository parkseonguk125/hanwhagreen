import { useEffect, useMemo, useState } from "react";
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

function ProjectLead() {
  return (
    <header className="hg-proj__lead">
      <h2 className="hg-proj__headline">
        <span className="hg-proj__headline-line">전국 현장에서 쌓아온</span>
        <span className="hg-proj__headline-line">
          한화그린의 <strong>주요실적</strong>
        </span>
      </h2>
      <p className="hg-proj__sub">
        액비순환·정화방류·축사현대화 등 한화그린이 시공한 현장을 사진으로 확인하세요.
      </p>
    </header>
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

function CertLead() {
  return (
    <header className="hg-proj__lead">
      <h2 className="hg-proj__headline">
        <span className="hg-proj__headline-line">기술·품질을 확인할 수 있는</span>
        <span className="hg-proj__headline-line">
          한화그린의 <strong>인증서와 특허</strong>
        </span>
      </h2>
      <p className="hg-proj__sub">
        환경전문공사업 등록, 경영시스템 인증, 폐수처리 관련 특허 자료를 확인하세요.
      </p>
    </header>
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
  if (posts.length === 0) {
    return <p className="hg-proj__empty">게시물이 없습니다.</p>;
  }

  return (
    <div className="hg-cert__grid">
      {posts.map((post) => (
        <Link
          key={post.id}
          to={boardViewRouteTarget(table, post.id)}
          className="hg-cert__card"
          title={post.subject}
        >
          <span className="hg-cert__card-frame">
            <img src={post.imageLink || post.image} alt={post.subject} loading="lazy" />
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
        <h1 className="hg-proj-view__title">{post.subject}</h1>
        <p className="hg-proj-view__date">
          <span className="hg-cert__card-badge">{certBadgeLabel(post)}</span>
          <span>{post.date}</span>
        </p>
      </header>
      <figure className="hg-cert-view__figure">
        <a
          href={post.imageLink || post.image}
          target="_blank"
          rel="noreferrer"
          className="hg-cert-view__image-link"
        >
          <img src={post.imageLink || post.image} alt={post.subject} />
        </a>
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
  if (posts.length === 0) {
    return <p className="hg-proj__empty">게시물이 없습니다.</p>;
  }

  return (
    <div className="hg-proj__grid">
      {posts.map((post) => {
        const { name, date } = parseProjectTitle(post.subject);
        return (
          <Link
            key={post.id}
            to={boardViewRouteTarget(table, post.id)}
            className="hg-proj__card"
            title={post.subject}
          >
            <span className="hg-proj__card-media">
              <img src={post.image} alt={post.subject} loading="lazy" />
            </span>
            <span className="hg-proj__card-body">
              {date && <span className="hg-proj__card-date">{date}</span>}
              <span className="hg-proj__card-name">{name}</span>
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
    <article className="hg-proj-view hg-proj-view--project">
      <header className="hg-proj-view__head">
        
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
          <div className="hg-proj hg-proj--project">
            <ProjectLead />
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
        <div className="hg-proj hg-cert hg-proj--cert">
          <CertLead />
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
