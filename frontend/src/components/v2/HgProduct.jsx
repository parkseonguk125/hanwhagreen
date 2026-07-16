import { useEffect, useRef } from "react";
import HgAppLink from "./HgAppLink";
import { projects } from "../../data/projects";
import { useHgHorizontalScroll, useHgViewport } from "./hooks";
import { isProgrammaticScrollActive } from "../../utils/scrollControl";

const featuredProjects = projects.slice(0, 11);
const mobileProjects = projects.slice(0, 6);

function formatProjectTitle(title) {
  return title.replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

function useProjectCardScrollRise(stickyRef, enabled) {
  useEffect(() => {
    const sticky = stickyRef.current;
    if (!sticky || !enabled) {
      if (sticky) {
        sticky.classList.add("is-cards-up");
        sticky.style.setProperty("--hg-card-up", "1");
      }
      return undefined;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
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

      if (rect.top > vh * 0.12) {
        hide();
        return;
      }

      if (rect.top <= 2 && rect.bottom >= vh * 0.9) {
        if (goingDown) play();
        else if (!revealed) showInstant();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            armed = true;
            if (isProgrammaticScrollActive()) showInstant();
            else sync();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(sticky);
    window.addEventListener("scroll", sync, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", sync);
    };
  }, [stickyRef, enabled]);
}

export default function HgProduct() {
  const { isMobile } = useHgViewport();
  const scrollRef = useRef(null);
  const stickyRef = useRef(null);
  const trackRef = useRef(null);

  useHgHorizontalScroll(scrollRef, isMobile ? 0 : featuredProjects.length);
  useProjectCardScrollRise(stickyRef, !isMobile);

  useEffect(() => {
    if (isMobile) return undefined;
    const zone = scrollRef.current;
    const track = trackRef.current;
    if (!zone || !track) return undefined;

    const syncHeight = () => {
      const shift = Math.max(track.scrollWidth - window.innerWidth, 0);
      zone.style.setProperty("--hg-project-shift", `${shift}px`);
      zone.style.height = shift > 0 ? `${window.innerHeight + shift}px` : "";
    };

    syncHeight();
    window.addEventListener("resize", syncHeight);
    const observer = new ResizeObserver(syncHeight);
    observer.observe(track);

    return () => {
      window.removeEventListener("resize", syncHeight);
      observer.disconnect();
      zone.style.removeProperty("height");
      zone.style.removeProperty("--hg-project-shift");
    };
  }, [isMobile]);

  if (isMobile) {
    return (
      <section className="hg-m-projects" id="home-business" aria-labelledby="hg-m-projects-title">
        <div className="hg-m-projects__inner">
          <header className="hg-m-sec-head">
            <p className="hg-m-sec-head__eyebrow">Projects</p>
            <h2 id="hg-m-projects-title" className="hg-m-sec-head__title">
              현장에서 검증된
              <br />
              주요 실적
            </h2>
            <HgAppLink to="/bbs/board.php?bo_table=project" className="hg-m-sec-head__link">
              전체 보기
            </HgAppLink>
          </header>

          <div className="hg-m-projects__grid">
            {mobileProjects.map((project, index) => (
              <HgAppLink
                key={project.id}
                to={`/bbs/board.php?bo_table=project&wr_id=${project.id}`}
                className={`hg-m-project-card${index === 0 ? " is-featured" : ""}`}
              >
                <div
                  className="hg-m-project-card__media"
                  style={{ backgroundImage: `url(${project.image})` }}
                  aria-hidden="true"
                />
                <div className="hg-m-project-card__body">
                  <h3 className="hg-m-project-card__title">{formatProjectTitle(project.title)}</h3>
                  <span className="hg-m-project-card__more">자세히</span>
                </div>
              </HgAppLink>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
            <p className="hg-project-stage__eyebrow">현장에서 검증된 실적</p>
            <h2 id="hg-business-title" className="hg-project-stage__title">
              <span>한화그린의</span>
              <span>주요 실적</span>
            </h2>
            <HgAppLink to="/bbs/board.php?bo_table=project" className="hg-project-stage__more">
              전체 보기
              <span aria-hidden="true">↗</span>
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
                          ↗
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
