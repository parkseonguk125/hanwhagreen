import { useEffect, useRef, useState } from "react";
import Icon from "../../Icons";

function stripIntroHtml(html = "") {
  return html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
}

function useSectionInView() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let framed = false;
    const show = () => {
      if (framed) return;
      framed = true;
      requestAnimationFrame(() => el.classList.add("is-in"));
    };

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      show();
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        show();
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function HgCompanyContent({ config }) {
  const [armed, setArmed] = useState(false);
  const mediaRef = useSectionInView();
  const downloadsRef = useSectionInView();
  const divisionsRef = useSectionInView();

  const introLines = stripIntroHtml(config.introHtml)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={`hg-company${armed ? " is-armed" : ""}`}>
      <section className="hg-company__lead hg-company__enter hg-company__enter--lead">
        <p className="hg-company__label">한화그린</p>
        <h2 className="hg-company__statement">
          {introLines.map((line, index) => (
            <span
              key={line}
              className="hg-company__statement-line"
              style={{ "--hg-company-line": `${index * 70}ms` }}
            >
              {line}
            </span>
          ))}
        </h2>
      </section>

      <section
        ref={mediaRef}
        className="hg-company__media hg-company__reveal"
        aria-label="소개 영상"
      >
        <header className="hg-company__block-head">
          <h3 className="hg-company__section-title">소개 영상</h3>
        </header>
        <div className="hg-company__videos">
          {config.videos.map((src, index) => (
            <article
              key={src}
              className={`hg-company__video hg-company__reveal-item${index === 0 ? " is-featured" : ""}`}
              style={{ "--hg-company-stagger": `${index * 80}ms` }}
            >
              <div className="hg-company__video-frame">
                <iframe
                  src={src}
                  title={`한화그린 소개 영상 ${index + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        ref={downloadsRef}
        className="hg-company__downloads hg-company__reveal"
        aria-label="자료 다운로드"
      >
        <div className="hg-company__downloads-inner">
          <div className="hg-company__downloads-copy hg-company__reveal-item">
            <h3 className="hg-company__section-title">자료 다운로드</h3>
          </div>
          <div className="hg-company__download-actions">
            {config.downloads.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className="hg-company__download-btn hg-company__reveal-item"
                style={{ "--hg-company-stagger": `${80 + index * 70}ms` }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{item.label}</span>
                <Icon name="arrow-right" size="md" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={divisionsRef}
        className="hg-company__divisions hg-company__reveal"
        aria-label="사업부"
      >
        <header className="hg-company__block-head hg-company__reveal-item">
          <h3 className="hg-company__section-title">한화그린의 사업부</h3>
        </header>
        <ul className="hg-company__division-cards">
          {config.divisions.map((division, index) => (
            <li
              key={division.title}
              className="hg-company__division-card hg-company__reveal-item"
              style={{ "--hg-company-stagger": `${index * 90}ms` }}
            >
              <div className="hg-company__division-card-media">
                <img
                  src={division.image || config.defaultDivisionImage}
                  alt=""
                  loading="lazy"
                />
              </div>
              <div className="hg-company__division-card-body">
                <span className="hg-company__division-num">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h4 className="hg-company__division-name">{division.title}</h4>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
