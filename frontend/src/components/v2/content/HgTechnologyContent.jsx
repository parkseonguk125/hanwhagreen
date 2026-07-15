import { useEffect, useMemo, useRef, useState } from "react";

/** 헤드라인 라인들 — 데이터가 아닌 연출용 카피 */
const HEAD_LINES = ["자연과 기술이 만나", "지속가능한 축산을 완성합니다"];

const PILLARS = [
  { key: "악취", label: "無 악취", desc: "액비순환으로 악취를 근본 제거" },
  { key: "퇴비", label: "無 퇴비", desc: "슬러지 발생량 1% 미만 유지" },
  { key: "약품", label: "無 약품", desc: "화학약품 없는 친환경 공정" },
  { key: "미생물", label: "無 미생물", desc: "미생물 투입 없는 순환 공정" },
];

function stripTags(html = "") {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** descHtml("- ..." / "1. ..." 라인들)을 리스트로 정리 */
function parseDescLines(html = "") {
  return html
    .split(/<br\s*\/?>/gi)
    .map((line) => stripTags(line).replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
}

function useArmOnView(rootMargin = "0px 0px -10% 0px", threshold = 0.15) {
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

function AnimatedLine({ text, lineIndex }) {
  const tokens = useMemo(() => text.split(/(\s+)/).filter((t) => t.length > 0), [text]);

  return (
    <span className="hg-tech__quote-line">
      {tokens.map((token, index) => {
        if (/^\s+$/.test(token)) {
          return <span key={`s-${lineIndex}-${index}`}> </span>;
        }
        const delay = 0.12 + lineIndex * 0.3 + index * 0.045;
        return (
          <span key={`${token}-${index}`} className="hg-tech__word">
            <span className="hg-tech__word-inner" style={{ animationDelay: `${delay}s` }}>
              {token}
            </span>
          </span>
        );
      })}
    </span>
  );
}

function TechRow({ item, index }) {
  const [ref, armed] = useArmOnView("0px 0px -8% 0px", 0.2);
  const lines = item.descHtml ? parseDescLines(item.descHtml) : [];
  const isSteps = lines.length > 0 && /^\d/.test(stripTags(item.descHtml).trim());
  const reversed = index % 2 === 1;

  return (
    <article
      ref={ref}
      className={`hg-tech__row${reversed ? " is-reversed" : ""}${armed ? " is-armed" : ""}`}
    >
      <div className="hg-tech__row-copy">
        <span className="hg-tech__row-num" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="hg-tech__row-title">{item.title}</h3>

        {item.desc && <p className="hg-tech__row-desc">{item.desc}</p>}

        {lines.length > 0 && (
          <ul className={`hg-tech__row-list${isSteps ? " is-steps" : ""}`}>
            {lines.map((line, i) => (
              <li key={`${item.title}-${i}`}>
                {isSteps && (
                  <span className="hg-tech__step-badge" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
                <span>{line.replace(/^\d+\.\s*/, "")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="hg-tech__row-visual">
        {item.video ? (
          <div className="hg-tech__video-frame">
            <iframe
              src={item.video}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          <figure className="hg-tech__image-frame">
            <img src={item.image} alt={item.title} loading="lazy" />
            <figcaption className="hg-tech__image-caption">
              <span>{item.title}</span>
            </figcaption>
          </figure>
        )}
      </div>
    </article>
  );
}

export default function HgTechnologyContent({ config }) {
  const [leadRef, leadArmed] = useArmOnView("80px 0px 0px 0px", 0.05);
  const [pillarsRef, pillarsArmed] = useArmOnView("0px 0px -8% 0px", 0.2);
  const [goalsRef, goalsArmed] = useArmOnView("0px 0px -8% 0px", 0.15);
  const [overviewRef, overviewArmed] = useArmOnView("0px 0px -8% 0px", 0.15);

  return (
    <div className="hg-tech">
      <section
        ref={leadRef}
        className={`hg-tech__lead${leadArmed ? " is-armed" : ""}`}
      >
        <p className="hg-tech__eyebrow">Technology</p>
        <div className="hg-tech__accent" aria-hidden="true" />
        <h2 className="hg-tech__quote">
          {HEAD_LINES.map((line, index) => (
            <AnimatedLine key={line} text={line} lineIndex={index} />
          ))}
        </h2>
        <p className="hg-tech__sub">
          30년 현장 경험으로 완성한 한화그린만의 친환경 축산 기술을 소개합니다.
        </p>
      </section>

      <section
        ref={pillarsRef}
        className={`hg-tech__pillars${pillarsArmed ? " is-armed" : ""}`}
        aria-label="4無 실현"
      >
        <header className="hg-tech__pillars-head">
          <p className="hg-tech__eyebrow">Core Value</p>
          <h3 className="hg-tech__section-title">
            4<span className="hg-tech__mu">無</span> 실현
          </h3>
        </header>
        <ul className="hg-tech__pillar-grid">
          {PILLARS.map((pillar, index) => (
            <li
              key={pillar.key}
              className="hg-tech__pillar"
              style={{ "--hg-tech-delay": `${index * 110}ms` }}
            >
              <span className="hg-tech__pillar-num" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong className="hg-tech__pillar-label">{pillar.label}</strong>
              <p className="hg-tech__pillar-desc">{pillar.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="hg-tech__rows" aria-label="보유 기술 목록">
        {config.items.map((item, index) => (
          <TechRow key={item.title} item={item} index={index} />
        ))}
      </section>

      {config.goals?.length > 0 && (
        <section
          ref={goalsRef}
          className={`hg-tech__goals${goalsArmed ? " is-armed" : ""}`}
          aria-label="기술 목표"
        >
          <div className="hg-tech__goals-inner">
            <header className="hg-tech__goals-head">
              <p className="hg-tech__eyebrow hg-tech__eyebrow--light">Goals</p>
              <h3 className="hg-tech__section-title hg-tech__section-title--light">
                우리가 지향하는 가치
              </h3>
            </header>
            <ul className="hg-tech__goal-grid">
              {config.goals.map((goal, index) => (
                <li
                  key={goal}
                  className="hg-tech__goal"
                  style={{ "--hg-tech-delay": `${index * 70}ms` }}
                >
                  <span className="hg-tech__goal-check" aria-hidden="true">
                    ✓
                  </span>
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {config.overview?.length > 0 && (
        <section
          ref={overviewRef}
          className={`hg-tech__overview${overviewArmed ? " is-armed" : ""}`}
          aria-label="시스템 개요"
        >
          <header className="hg-tech__overview-head">
            <p className="hg-tech__eyebrow">Overview</p>
            <h3 className="hg-tech__section-title">액비순환시스템 개요</h3>
          </header>
          <ol className="hg-tech__overview-list">
            {config.overview.map((line, index) => (
              <li
                key={line}
                className="hg-tech__overview-item"
                style={{ "--hg-tech-delay": `${index * 100}ms` }}
              >
                <span className="hg-tech__overview-num" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p>{line}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
