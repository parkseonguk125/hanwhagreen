import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "../../Icons";

function stripIntroHtml(html = "") {
  return html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
}

function AnimatedLine({ text, lineIndex }) {
  const tokens = useMemo(() => text.split(/(\s+)/).filter((t) => t.length > 0), [text]);

  return (
    <span className="hg-company__statement-line">
      {tokens.map((token, index) => {
        const isSpace = /^\s+$/.test(token);
        if (isSpace) {
          return <span key={`s-${lineIndex}-${index}`}> </span>;
        }

        const delay = 0.28 + lineIndex * 0.38 + index * 0.07;
        return (
          <span key={`${token}-${index}`} className="hg-company__word">
            <span
              className="hg-company__word-inner"
              style={{ animationDelay: `${delay}s` }}
            >
              {token}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function HgCompanyContent({ config }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageKey, setImageKey] = useState(0);
  const hoverTimerRef = useRef(0);
  const introLines = stripIntroHtml(config.introHtml)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const activeDivision = config.divisions[activeIndex] ?? config.divisions[0];
  const displayImage = activeDivision?.image || config.defaultDivisionImage;

  useEffect(() => {
    setImageKey((key) => key + 1);
  }, [displayImage]);

  useEffect(() => {
    return () => window.clearTimeout(hoverTimerRef.current);
  }, []);

  const selectDivision = (index, { immediate = false } = {}) => {
    window.clearTimeout(hoverTimerRef.current);
    if (immediate) {
      setActiveIndex(index);
      return;
    }
    hoverTimerRef.current = window.setTimeout(() => {
      setActiveIndex(index);
    }, 220);
  };

  return (
    <div className="hg-company">
      <section className="hg-company__lead hg-reveal">
        <p className="hg-company__eyebrow">Company</p>
        <div className="hg-company__accent" aria-hidden="true" />
        <h2 className="hg-company__statement">
          {introLines.map((line, index) => (
            <AnimatedLine key={`${line}-${index}`} text={line} lineIndex={index} />
          ))}
        </h2>
      </section>

      <section className="hg-company__media hg-reveal hg-reveal--delay-1">
        <div className="hg-company__videos">
          {config.videos.map((src, index) => (
            <article
              key={src}
              className={`hg-company__video${index === 0 ? " is-featured" : ""}`}
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

      <section className="hg-company__downloads hg-reveal hg-reveal--delay-2">
        <div className="hg-company__downloads-inner">
          <div className="hg-company__downloads-copy">
            <p className="hg-company__eyebrow hg-company__eyebrow--light">Resources</p>
            <h3 className="hg-company__section-title hg-company__section-title--light">
              자료 다운로드
            </h3>
          </div>
          <div className="hg-company__download-actions">
            {config.downloads.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="hg-company__download-btn"
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

      <section className="hg-company__divisions hg-reveal hg-reveal--delay-3">
        <div className="hg-company__division-stage">
          <div className="hg-company__division-copy">
            <header className="hg-company__section-head">
              <p className="hg-company__eyebrow">Business</p>
              <h3 className="hg-company__section-title">한화그린의 사업부</h3>
            </header>

            <ul className="hg-company__division-list" role="tablist" aria-label="사업부">
              {config.divisions.map((division, index) => {
                const isActive = index === activeIndex;
                return (
                  <li key={division.title}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`hg-company__division-tab${isActive ? " is-active" : ""}`}
                      onClick={() => selectDivision(index, { immediate: true })}
                      onMouseEnter={() => selectDivision(index)}
                      onFocus={() => selectDivision(index, { immediate: true })}
                    >
                      <span className="hg-company__division-num">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="hg-company__division-name">{division.title}</span>
                      <span className="hg-company__division-arrow" aria-hidden="true">
                        <Icon name="arrow-right" size="md" />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="hg-company__division-visual" aria-live="polite">
            <img
              key={imageKey}
              src={displayImage}
              alt={activeDivision?.title || "한화그린 사업부"}
              className="hg-company__division-image"
            />
            <div className="hg-company__division-caption">
              <span>{activeDivision?.title}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
