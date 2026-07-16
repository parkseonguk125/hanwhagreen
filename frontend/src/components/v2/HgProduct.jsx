import { useEffect, useRef } from "react";
import HgAppLink from "./HgAppLink";
import { projects } from "../../data/projects";
import { useHgHorizontalScroll } from "./hooks";
import { isProgrammaticScrollActive } from "../../utils/scrollControl";

const featuredProjects = projects.slice(0, 11);

function formatProjectTitle(title) {
  return title.replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * ?”ë©´??ê½?ì±„ìš´ ??ì¹´ë“œê°€ ?„ë˜?ì„œ ?„ë¡œ ?¬ë¼?¤ê²Œ ?œë‹¤.
 * - ?¤í¬ë¡¤ì„ ?´ë¦´ ?Œë§Œ ?¬ìƒ
 * - ?„ë¡œ ?¤ì‹œ ?¬ë¼???ŒëŠ” ?¬ìƒ?˜ì? ?ŠìŒ
 * - ?¹ì…˜ë³´ë‹¤ ???˜ì´ì§€ ?ë‹¨ ìª?ë¡??„ì „??ë²—ì–´?˜ë©´ ë¦¬ì…‹ ???¤ì‹œ ?´ë ¤?????¬ìƒ
 */
function useProjectCardScrollRise(stickyRef) {
  useEffect(() => {
    const sticky = stickyRef.current;
    if (!sticky) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let revealed = false;
    let armed = false;
    let lastScrollY = window.scrollY;

    const hide = () => {
      revealed = false;
      sticky.classList.remove("is-cards-up");
      sticky.style.setProperty("--hg-card-up", "0");
    };

    const showInstant = () => {
      revealed = true;
      sticky.style.setProperty("--hg-card-up", "1");
      sticky.classList.add("is-cards-up");
    };

    const play = () => {
      if (revealed) return;
      revealed = true;

      sticky.classList.remove("is-cards-up");
      sticky.style.setProperty("--hg-card-up", "0");
      void sticky.offsetWidth;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          sticky.style.setProperty("--hg-card-up", "1");
          sticky.classList.add("is-cards-up");
        });
      });
    };

    const isFullyFilled = () => {
      const rect = sticky.getBoundingClientRect();
      const vh = window.innerHeight;
      return rect.top <= 2 && rect.bottom >= vh * 0.9;
    };

    const sync = () => {
      if (!armed) return;

      const scrollY = window.scrollY;
      const goingDown = scrollY >= lastScrollY;
      lastScrollY = scrollY;

      if (reduceMotion.matches) {
        showInstant();
        return;
      }

      const rect = sticky.getBoundingClientRect();
      const vh = window.innerHeight;

      // ?¹ì…˜ë³´ë‹¤ ???„ì§ ?„ì°© ??/ ?„ë¡œ ?„ì „??ë¹ ì ¸?˜ê°) ???¤ìŒ ?˜ê°• ì§„ì…??ë¦¬ì…‹
      if (rect.top > vh * 0.12) {
        hide();
        return;
      }

      // ?¹ì…˜ë³´ë‹¤ ?„ë˜(ì§€?˜ê°) ???íƒœ ? ì?. ?„ë¡œ ?¤ì‹œ ?????¬ìƒ ????
      if (rect.bottom < vh * 0.2) {
        return;
      }

      if (isFullyFilled()) {
        if (goingDown) play();
        else showInstant();
      }
    };

    const onScroll = () => {
      if (isProgrammaticScrollActive()) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };

    hide();
    const armTimer = window.setTimeout(() => {
      armed = true;
      lastScrollY = window.scrollY;
      sync();
    }, 80);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    reduceMotion.addEventListener("change", sync);

    return () => {
      window.clearTimeout(armTimer);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reduceMotion.removeEventListener("change", sync);
      sticky.style.removeProperty("--hg-card-up");
      sticky.classList.remove("is-cards-up");
    };
  }, [stickyRef]);
}

export default function HgProduct() {
  const scrollRef = useRef(null);
  const stickyRef = useRef(null);
  const trackRef = useRef(null);

  useHgHorizontalScroll(scrollRef, featuredProjects.length, "--hg-project-progress");
  useProjectCardScrollRise(stickyRef);

  useEffect(() => {
    const zone = scrollRef.current;
    const track = trackRef.current;
    if (!zone || !track) return undefined;

    const syncHeight = () => {
      const mobileQuery = window.matchMedia("(max-width: 1024px)");
      if (mobileQuery.matches) {
        zone.style.height = "";
        return;
      }

      const overflow = Math.max(track.scrollWidth - window.innerWidth, 0);
      const scrollExtra = Math.max(overflow, Math.round(window.innerHeight * 0.45));

      zone.style.setProperty("--hg-project-shift", `${overflow}px`);
      zone.style.height = `calc(100svh + ${scrollExtra}px)`;
    };

    syncHeight();
    window.addEventListener("resize", syncHeight);

    const observer = new ResizeObserver(syncHeight);
    observer.observe(track);

    return () => {
      window.removeEventListener("resize", syncHeight);
      observer.disconnect();
      zone.style.removeProperty("height");
    };
  }, []);

  return (
    <section
      className="hg-project-scroll"
      id="home-business"
      ref={scrollRef}
      aria-labelledby="hg-business-title"
      style={{ "--hg-project-count": featuredProjects.length }}
    >
      <div className="hg-project-sticky" ref={stickyRef}>
        <div className="hg-project-stage">
          <header className="hg-project-stage__head hg-reveal">
            <p className="hg-project-stage__eyebrow">?„ì¥?ì„œ ê²€ì¦ëœ ??Ÿ‰</p>
            <h2 id="hg-business-title" className="hg-project-stage__title">
              <span>?œí™”ê·¸ë¦°??/span>
              <span>ì£¼ìš” ?¤ì </span>
            </h2>
            <HgAppLink to="/bbs/board.php?bo_table=project" className="hg-project-stage__more">
              ?„ì²´ ë³´ê¸°
              <span aria-hidden="true">??/span>
            </HgAppLink>
          </header>

          <div className="hg-project-stage__viewport">
            <div className="hg-project-stage__track" ref={trackRef}>
              {featuredProjects.map((project, index) => (
                <HgAppLink
                  key={project.id}
                  to={`/bbs/board.php?bo_table=project&wr_id=${project.id}`}
                  className="hg-project-card-hd"
                  style={{ "--hg-project-card-index": Math.min(index, 5) }}
                >
                  <div className="hg-project-card-hd__panel">
                    <div className="hg-project-card-hd__meta">
                      <h3 className="hg-project-card-hd__title">
                        {formatProjectTitle(project.title)}
                      </h3>
                      <span className="hg-project-card-hd__badge">
                        Project
                        <span className="hg-project-card-hd__badge-icon" aria-hidden="true">
                          ??
                        </span>
                      </span>
                    </div>
                    <div
                      className="hg-project-card-hd__media"
                      style={{ backgroundImage: `url(${project.image})` }}
                      role="img"
                      aria-hidden="true"
                    />
                  </div>
                </HgAppLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
