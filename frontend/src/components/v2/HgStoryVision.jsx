import { useMemo, useRef } from "react";
import { useHgStoryVisionScroll, useHgViewport } from "./hooks";

const STAGES = [
  {
    keyword: "깨끗한 축사",
    image: "/images/story/nature-1.jpg",
    caption: [
      "한화그린은 깨끗한 축사환경 건설과",
      "생산원가 절감 시설로 건강한 양돈 환경을 만듭니다.",
    ],
  },
  {
    keyword: "스마트 생산",
    image: "/images/story/nature-2.jpg",
    caption: [
      "30년 사양기술 기반의 스마트팜·액비순환·바이오가스 등",
      "효율적 ICT 생산관리 솔루션을 제시합니다.",
    ],
  },
  {
    keyword: "탄소중립 미래",
    image: "/images/story/nature-3.jpg",
    caption: [
      "에너지 자가생산과 탄소중립을 동시에 실천하는",
      "세계 유일의 단일 기업, 한화그린입니다.",
    ],
  },
];

const INTRO_LINES = [
  [{ text: "깨끗한 축사환경과 스마트한 생산관리로" }],
  [{ text: "지속가능한 탄소중립 미래를" }],
  [
    { text: "한화그린", tone: "brand" },
    { text: "이 열어 나갑니다." },
  ],
];

function flattenIntro(lines) {
  const chars = [];
  lines.forEach((parts, lineIndex) => {
    parts.forEach((part) => {
      [...part.text].forEach((char) => {
        chars.push({
          char,
          lineIndex,
          tone: part.tone || "plain",
        });
      });
    });
  });
  return chars;
}

function charFillAmount(introFill, index, total) {
  if (total <= 0) return 1;
  const pos = introFill * total;
  if (pos <= index) return 0;
  if (pos >= index + 1) return 1;
  return pos - index;
}

function StoryDesktop({ scrollRef, active, phase, progress, introFill, introPinned }) {
  const introPhase = phase === "intro";
  const introTextReady = introPhase && introPinned;
  const flatChars = useMemo(() => flattenIntro(INTRO_LINES), []);
  const totalChars = flatChars.length;

  let cursor = 0;
  const lines = INTRO_LINES.map((parts, lineIndex) => {
    const lineChars = [];
    parts.forEach((part) => {
      [...part.text].forEach((char) => {
        const fill = introTextReady
          ? charFillAmount(introFill, cursor, totalChars)
          : 0;
        lineChars.push({
          key: `${lineIndex}-${cursor}`,
          char: char === " " ? "\u00a0" : char,
          tone: part.tone || "plain",
          fill,
        });
        cursor += 1;
      });
    });
    return lineChars;
  });

  return (
    <div
      className="hg-story-scroll"
      ref={scrollRef}
      style={{
        "--hg-story-progress": progress.toFixed(4),
        "--hg-story-intro-fill": introFill.toFixed(4),
      }}
      data-phase={phase}
      data-active={active}
      data-intro-pinned={introPinned ? "true" : "false"}
      aria-label="한화그린 비전 스토리"
    >
      <div className="hg-story-sticky">
        <section className="hg-story">
          <div className="hg-story__media" aria-hidden="true">
            {STAGES.map((stage, index) => (
              <div
                key={stage.image}
                className={`hg-story__layer${index === active ? " is-active" : ""}`}
              >
                <img src={stage.image} alt="" loading={index === 0 ? "eager" : "lazy"} />
              </div>
            ))}
            <div className="hg-story__shade" />
          </div>

          <div
            className={`hg-story__intro${introPhase ? " is-covering" : ""}${introTextReady ? " is-visible" : ""}`}
          >
            <div className="hg-story__intro-copy" aria-hidden={!introTextReady}>
              {lines.map((lineChars, lineIndex) => (
                <p
                  key={lineIndex}
                  className="hg-story__intro-line"
                  aria-label={INTRO_LINES[lineIndex].map((p) => p.text).join("")}
                >
                  {lineChars.map((item) => (
                    <span
                      key={item.key}
                      className={
                        item.tone === "brand"
                          ? "hg-story__intro-fill hg-story__intro-fill--brand"
                          : "hg-story__intro-fill"
                      }
                      style={{ "--hg-char-fill": item.fill.toFixed(4) }}
                    >
                      {item.char}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </div>

          <div className={`hg-story__keywords${phase === "story" ? " is-visible" : ""}`}>
            {STAGES.map((stage, index) => (
              <strong
                key={stage.keyword}
                className={`hg-story__keyword${index === active && phase === "story" ? " is-active" : ""}`}
                style={{ "--hg-story-indent": index }}
              >
                {stage.keyword}
                <i className="hg-story__underline" aria-hidden="true" />
              </strong>
            ))}
          </div>

          <div className={`hg-story__caption${phase === "story" ? " is-visible" : ""}`}>
            {STAGES.map((stage, index) => (
              <p
                key={stage.keyword}
                className={`hg-story__caption-item${index === active ? " is-active" : ""}`}
              >
                {stage.caption.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StoryMobile() {
  return (
    <section className="hg-m-story" aria-label="한화그린 비전 스토리">
      <header className="hg-m-story__intro">
        <p className="hg-m-story__eyebrow">Story</p>
        <span className="hg-m-story__rule" aria-hidden="true" />
        <h2 className="hg-m-story__intro-title">
          <span className="hg-m-story__line">깨끗한 축사환경과</span>
          <span className="hg-m-story__line">스마트한 생산관리로</span>
          <span className="hg-m-story__line">
            <em>지속가능한 미래</em>를 엽니다
          </span>
        </h2>
        <p className="hg-m-story__lead">
          현장 기술과 친환경 솔루션으로 내일의 농업·축산을 만듭니다.
        </p>
      </header>

      <div className="hg-m-story__list">
        {STAGES.map((stage, index) => (
          <article key={stage.keyword} className="hg-m-story__card">
            <div className="hg-m-story__media" aria-hidden="true">
              <img src={stage.image} alt="" loading={index === 0 ? "eager" : "lazy"} decoding="async" />
            </div>
            <div className="hg-m-story__body">
              <span className="hg-m-story__index">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="hg-m-story__keyword">{stage.keyword}</h3>
              <p className="hg-m-story__caption">
                {stage.caption.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function HgStoryVision() {
  const scrollRef = useRef(null);
  const { isMobile } = useHgViewport();
  const { active, phase, progress, introFill, introPinned } = useHgStoryVisionScroll(
    scrollRef,
    isMobile ? 0 : STAGES.length
  );

  if (isMobile) return <StoryMobile />;
  return (
    <StoryDesktop
      scrollRef={scrollRef}
      active={active}
      phase={phase}
      progress={progress}
      introFill={introFill}
      introPinned={introPinned}
    />
  );
}
