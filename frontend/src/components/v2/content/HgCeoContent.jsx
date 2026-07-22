import { useEffect, useRef, useState } from "react";

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

export default function HgCeoContent({ config }) {
  const [armed, setArmed] = useState(false);
  const stageRef = useSectionInView();
  const headingLines = splitHeadingLines(config.headingHtml);
  const paragraphs = splitBodyParagraphs(config.bodyHtml);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={`hg-ceo${armed ? " is-armed" : ""}`}>
      <section className="hg-ceo__lead">
        <p className="hg-ceo__label">인사말</p>
        <h2 className="hg-ceo__quote">
          {headingLines.map((line, index) => (
            <span
              key={line}
              className="hg-ceo__quote-line"
              style={{ "--hg-ceo-line": `${index * 80}ms` }}
            >
              {line}
            </span>
          ))}
        </h2>
      </section>

      <section ref={stageRef} className="hg-ceo__stage hg-ceo__reveal">
        <div className="hg-ceo__portrait-wrap hg-ceo__reveal-item">
          <figure className="hg-ceo__portrait">
            <img src={config.photoUrl} alt="한화그린 대표이사 김용우" />
            <figcaption className="hg-ceo__portrait-meta">
              <span>대표이사</span>
              <strong>김용우</strong>
            </figcaption>
          </figure>
        </div>

        <div className="hg-ceo__copy">
          <p
            className="hg-ceo__welcome hg-ceo__reveal-item"
            style={{ "--hg-ceo-stagger": "60ms" }}
          >
            {config.welcome}
          </p>
          <div className="hg-ceo__letter">
            {paragraphs.map((paragraph, index) => (
              <p
                key={`${index}-${paragraph.slice(0, 12)}`}
                className="hg-ceo__paragraph hg-ceo__reveal-item"
                style={{ "--hg-ceo-stagger": `${120 + index * 55}ms` }}
              >
                {paragraph}
              </p>
            ))}
          </div>
          <footer
            className="hg-ceo__sign hg-ceo__reveal-item"
            style={{ "--hg-ceo-stagger": `${160 + paragraphs.length * 55}ms` }}
          >
            <span className="hg-ceo__sign-line" aria-hidden="true" />
            <p>{config.signature}</p>
          </footer>
        </div>
      </section>
    </div>
  );
}
