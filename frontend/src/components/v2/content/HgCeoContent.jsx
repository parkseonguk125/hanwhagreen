import { useEffect, useMemo, useRef, useState } from "react";

function stripTags(html = "") {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function splitHeadingLines(html = "") {
  return html
    .split(/<br\s*\/?>/gi)
    .map((line) => stripTags(line))
    .filter(Boolean);
}

function splitBodyParagraphs(html = "") {
  return html
    .split(/<span\s+class=["']mo_br["']\s*><\/span>/gi)
    .map((part) => stripTags(part))
    .filter(Boolean);
}

function useArmOnView(rootMargin = "0px", threshold = 0.12) {
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

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setArmed(true));
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
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

function AnimatedLine({ text, lineIndex }) {
  const tokens = useMemo(() => text.split(/(\s+)/).filter((t) => t.length > 0), [text]);

  return (
    <span className="hg-ceo__quote-line">
      {tokens.map((token, index) => {
        if (/^\s+$/.test(token)) {
          return <span key={`s-${lineIndex}-${index}`}> </span>;
        }

        const delay = 0.12 + lineIndex * 0.28 + index * 0.04;
        return (
          <span key={`${token}-${index}`} className="hg-ceo__word">
            <span className="hg-ceo__word-inner" style={{ animationDelay: `${delay}s` }}>
              {token}
            </span>
          </span>
        );
      })}
    </span>
  );
}

function RevealBlock({ children, className = "", delay = 0 }) {
  return (
    <div
      className={`hg-ceo__reveal${className ? ` ${className}` : ""}`}
      style={{ "--hg-ceo-reveal-delay": `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function HgCeoContent({ config }) {
  /* 헤드라인: 페이지 진입 직후 */
  const [leadRef, leadArmed] = useArmOnView("80px 0px 0px 0px", 0.05);
  /* 초상·본문: 스크롤로 해당 영역이 보일 때 */
  const [stageRef, stageArmed] = useArmOnView("0px 0px -12% 0px", 0.18);

  const headingLines = splitHeadingLines(config.headingHtml);
  const paragraphs = splitBodyParagraphs(config.bodyHtml);

  return (
    <div className="hg-ceo">
      <section
        ref={leadRef}
        className={`hg-ceo__lead${leadArmed ? " is-lead-armed" : ""}`}
      >
        <p className="hg-ceo__eyebrow">CEO Message</p>
        <div className="hg-ceo__accent" aria-hidden="true" />
        <h2 className="hg-ceo__quote">
          {headingLines.map((line, index) => (
            <AnimatedLine key={`${line}-${index}`} text={line} lineIndex={index} />
          ))}
        </h2>
      </section>

      <section
        ref={stageRef}
        className={`hg-ceo__stage${stageArmed ? " is-stage-armed" : ""}`}
      >
        <RevealBlock className="hg-ceo__portrait-wrap" delay={0}>
          <figure className="hg-ceo__portrait">
            <img src={config.photoUrl} alt="한화그린 대표이사" />
            <figcaption className="hg-ceo__portrait-meta">
              <span>CEO Message</span>
              <strong>대표이사</strong>
            </figcaption>
          </figure>
        </RevealBlock>

        <div className="hg-ceo__copy">
          <RevealBlock delay={140}>
            <p className="hg-ceo__welcome">{config.welcome}</p>
          </RevealBlock>

          <RevealBlock delay={280}>
            <div className="hg-ceo__letter">
              {paragraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 12)}`} className="hg-ceo__paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </RevealBlock>

          <RevealBlock delay={420}>
            <footer className="hg-ceo__sign">
              <span className="hg-ceo__sign-line" aria-hidden="true" />
              <p>{config.signature}</p>
            </footer>
          </RevealBlock>
        </div>
      </section>
    </div>
  );
}
