import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "../Icons";
import { allSubMenus, subNavGroups } from "../../utils/navRoutes";
import { HgNavLink } from "./HgNavLink";

export function HgSubVisual({ title, bannerUrl, subtitle }) {
  return (
    <section className="hg-sub-visual">
      <img className="hg-sub-visual__bg" src={bannerUrl} alt="" loading="eager" />
      <div className="hg-sub-visual__overlay" />
      <div className="hg-sub-visual__content">
        <h1 className="hg-sub-visual__title">{title}</h1>
        {subtitle && <p className="hg-sub-visual__subtitle">{subtitle}</p>}
      </div>
    </section>
  );
}

function readHeaderHeight() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--hg-header-height")
    .trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : 72;
}

export function HgSubNav({ parentTitle, currentTitle, navGroupIndex = 0 }) {
  const location = useLocation();
  const tabs = allSubMenus[navGroupIndex] || [];
  const navRef = useRef(null);
  const sentinelRef = useRef(null);
  const pinnedRef = useRef(false);
  const [pinned, setPinned] = useState(false);
  const [navHeight, setNavHeight] = useState(0);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;

    const syncHeight = () => setNavHeight(nav.offsetHeight);
    syncHeight();

    const observer = new ResizeObserver(syncHeight);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;

    const syncPinned = () => {
      const header = document.querySelector(".hg-header-wrap");
      const stickTop = header
        ? Math.max(0, header.getBoundingClientRect().bottom)
        : readHeaderHeight();
      const next = sentinel.getBoundingClientRect().top <= stickTop + 0.5;
      pinnedRef.current = next;
      setPinned(next);
    };

    syncPinned();
    window.addEventListener("scroll", syncPinned, { passive: true });
    window.addEventListener("resize", syncPinned);

    const rootObserver = new MutationObserver(syncPinned);
    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => {
      window.removeEventListener("scroll", syncPinned);
      window.removeEventListener("resize", syncPinned);
      rootObserver.disconnect();
    };
  }, [location.pathname, location.search]);

  /*
   * 헤더 hide/show 동기화 (전 페이지):
   * - pin 전(배너 아래 흐름/sticky): transform 금지 → 배너와 바 사이 틈 방지
   * - pin 후(fixed): top만 헤더 bottom에 매 프레임 고정
   */
  useEffect(() => {
    const nav = navRef.current;
    const header = document.querySelector(".hg-header-wrap");
    if (!nav || !header) return undefined;

    let raf = 0;
    let running = false;
    let settledFrames = 0;

    const headerTargetBottom = () => {
      const h = readHeaderHeight();
      return header.classList.contains("is-hidden") ? 0 : h;
    };

    const isSettled = () =>
      Math.abs(header.getBoundingClientRect().bottom - headerTargetBottom()) < 0.75;

    const apply = () => {
      const bottom = Math.max(0, header.getBoundingClientRect().bottom);
      /* transform은 레이아웃을 유지한 채 페인팅만 이동 → 배너와 틈 생김. 절대 사용하지 않음. */
      nav.style.removeProperty("transform");
      nav.style.top = `${bottom}px`;
    };

    const tick = () => {
      apply();

      if (isSettled()) settledFrames += 1;
      else settledFrames = 0;

      if (settledFrames < 12) {
        raf = requestAnimationFrame(tick);
        return;
      }

      running = false;
      raf = 0;
      nav.style.removeProperty("transform");
      nav.style.top = `${headerTargetBottom()}px`;
    };

    const start = () => {
      settledFrames = 0;
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    start();
    window.addEventListener("scroll", start, { passive: true });
    window.addEventListener("resize", start);

    const mo = new MutationObserver(start);
    mo.observe(header, { attributes: true, attributeFilter: ["class"] });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      mo.disconnect();
      window.removeEventListener("scroll", start);
      window.removeEventListener("resize", start);
      if (raf) cancelAnimationFrame(raf);
      nav.style.removeProperty("top");
      nav.style.removeProperty("transform");
    };
  }, [location.pathname, location.search]);

  return (
    <>
      <div ref={sentinelRef} className="hg-sub-nav-sentinel" aria-hidden="true" />
      <nav
        ref={navRef}
        className={`hg-sub-nav${pinned ? " is-pinned" : ""}`}
        aria-label="서브 내비게이션"
      >
        <div className="hg-sub-nav__inner">
          <div className="hg-sub-nav__crumbs">
            <Link to="/" className="hg-sub-nav__home" aria-label="홈">
              <Icon name="home" size="sm" />
            </Link>
            <span className="hg-sub-nav__sep" aria-hidden="true">
              <Icon name="chevron-right" size={14} />
            </span>
            <span className="hg-sub-nav__crumb">{parentTitle}</span>
            <span className="hg-sub-nav__sep" aria-hidden="true">
              <Icon name="chevron-right" size={14} />
            </span>
            <span className="hg-sub-nav__crumb hg-sub-nav__crumb--current">{currentTitle}</span>
          </div>
          <div className="hg-sub-nav__tabs" role="tablist" aria-label="하위 메뉴">
            {tabs.map((item) => {
              const target = item.href;
              const isActive =
                location.pathname + location.search === target ||
                (target.includes("co_id=") && location.search.includes(target.split("?")[1]));
              return (
                <HgNavLink
                  key={item.label}
                  item={item}
                  className={`hg-sub-nav__tab${isActive ? " is-active" : ""}`}
                />
              );
            })}
          </div>
        </div>
      </nav>
      {pinned && (
        <div
          className="hg-sub-nav-spacer"
          style={{ height: navHeight }}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default function HgSubLayout({
  title,
  bannerUrl,
  visualSubtitle,
  currentNavTitle,
  navGroupIndex = 0,
  parentTitle,
  children,
  wide = false,
}) {
  const resolvedParent = parentTitle ?? subNavGroups[navGroupIndex]?.title ?? "";

  return (
    <div className="hg-main">
      <HgSubVisual title={title} bannerUrl={bannerUrl} subtitle={visualSubtitle} />
      <HgSubNav
        parentTitle={resolvedParent}
        currentTitle={currentNavTitle || title}
        navGroupIndex={navGroupIndex}
      />
      <div className={`hg-sub-content${wide ? " hg-sub-content--wide" : ""}`}>
        {children}
      </div>
    </div>
  );
}
