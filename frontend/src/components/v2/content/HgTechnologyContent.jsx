import { useEffect, useId, useRef, useState } from "react";
import Icon from "../../Icons";
import HgAppLink from "../HgAppLink";
import HgTechPillarArt from "./HgTechPillarArt";
import {
  boardRouteTarget,
  boardWriteRouteTarget,
} from "../../../utils/navRoutes";

const PILLARS = [
  {
    key: "악취",
    label: "악취 저감",
    points: ["액비순환", "바이오커튼", "축사 안팎 악취 저감"],
  },
  {
    key: "퇴비",
    label: "슬러지 저감",
    points: ["고속산화 공정", "슬러지 발생 최소화", "고형물 분해 처리"],
  },
  {
    key: "약품",
    label: "약품 사용 최소화",
    points: ["무약품·저약품 공정", "화학 의존 축소", "안정적 처리수질"],
  },
  {
    key: "순환",
    label: "자원 순환",
    points: ["다단계 액비 생산", "재활용수 활용", "현장 자원 재이용"],
  },
];

function stripTags(html = "") {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parseDescLines(html = "") {
  return html
    .split(/<br\s*\/?>/gi)
    .map((line) => stripTags(line).replace(/^[-•]\s*/, "").trim())
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

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      show();
      return undefined;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      show();
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        show();
        observer.disconnect();
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function TechAccordionItem({ item, index, open, onToggle }) {
  const panelId = useId();
  const buttonId = useId();
  const lines = item.descHtml ? parseDescLines(item.descHtml) : [];
  const isSteps = lines.length > 0 && /^\d/.test(stripTags(item.descHtml || "").trim());
  const hasCopy = Boolean(item.desc || lines.length > 0);
  const hasMedia = Boolean(item.video || item.image);
  const hasBody = hasCopy || hasMedia;
  const num = String(index + 1).padStart(2, "0");

  return (
    <article className={`hg-tech__acc${open ? " is-open" : ""}`}>
      <h3 className="hg-tech__acc-heading">
        <button
          type="button"
          id={buttonId}
          className="hg-tech__acc-trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="hg-tech__acc-num" aria-hidden="true">
            {num}
          </span>
          <span className="hg-tech__acc-title">{item.title}</span>
          <span className="hg-tech__acc-icon" aria-hidden="true">
            <Icon name="chevron-down" size="sm" />
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="hg-tech__acc-panel"
        hidden={!open}
      >
        <div className="hg-tech__acc-panel-inner">
          {hasBody ? (
            <>
              {hasCopy && (
                <div className="hg-tech__acc-copy">
                  {item.desc && (
                    <p className="hg-tech__item-desc">{item.desc}</p>
                  )}
                  {lines.length > 0 && (
                    <ul
                      className={`hg-tech__item-list${
                        isSteps ? " is-steps" : " is-points"
                      }`}
                    >
                      {lines.map((line, i) => (
                        <li key={`${item.title}-${i}`}>
                          {isSteps ? (
                            <span className="hg-tech__step-num" aria-hidden="true">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                          ) : (
                            <span className="hg-tech__bullet" aria-hidden="true">
                              ·
                            </span>
                          )}
                          <span>{line.replace(/^\d+\.\s*/, "")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {hasMedia && (
                <div className={`hg-tech__acc-media${item.video ? " is-video" : ""}`}>
                  {item.video ? (
                    <div className="hg-tech__video">
                      <iframe
                        src={open ? item.video : undefined}
                        title={item.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <figure className="hg-tech__figure">
                      <img src={item.image} alt="" loading="lazy" />
                    </figure>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="hg-tech__acc-empty">상세 내용을 준비 중입니다.</p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function HgTechnologyContent({ config }) {
  const leadRef = useSectionInView();
  const whyRef = useSectionInView();
  const processRef = useSectionInView();
  const catalogRef = useSectionInView();
  const ctaRef = useSectionInView();
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <div className="hg-tech">
      <section ref={leadRef} className="hg-tech__lead hg-tech__reveal">
        <p className="hg-tech__label hg-tech__reveal-item">보유기술</p>
        <h2
          className="hg-tech__quote hg-tech__reveal-item"
          style={{ "--hg-tech-stagger": "40ms" }}
        >
          축산·도축 폐수처리부터 액비순환·악취저감·스마트축사까지
        </h2>
        <p
          className="hg-tech__sub hg-tech__reveal-item"
          style={{ "--hg-tech-stagger": "80ms" }}
        >
          한화그린은 현장에 맞는 처리 기술로 안정적인 축산 환경을 설계하고 시공합니다.
          폐수처리·액비순환·악취저감·에너지·ICT까지 보유 기술을 정리했습니다.
        </p>
      </section>

      <section
        ref={whyRef}
        className="hg-tech__why hg-tech__reveal"
        aria-label="현장에서 다루는 과제"
      >
        <header className="hg-tech__head hg-tech__reveal-item">
          <h3 className="hg-tech__section-title">현장에서 다루는 과제</h3>
          <p className="hg-tech__section-desc">
            농장마다 조건이 다릅니다. 한화그린은 아래 방향을 기준으로 공정을 조합합니다.
          </p>
        </header>
        <ol className="hg-tech__why-list">
          {PILLARS.map((pillar, index) => (
            <li
              key={pillar.key}
              className="hg-tech__why-item hg-tech__reveal-item"
              style={{ "--hg-tech-stagger": `${index * 40}ms` }}
            >
              <HgTechPillarArt type={pillar.key} />
              <div className="hg-tech__why-copy">
                <strong className="hg-tech__why-label">{pillar.label}</strong>
                <ul className="hg-tech__why-points">
                  {pillar.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="hg-tech__catalog" aria-label="보유 기술 목록">
        <div ref={catalogRef} className="hg-tech__reveal">
          <header className="hg-tech__head hg-tech__reveal-item">
            <h3 className="hg-tech__section-title">보유 기술</h3>
            <p className="hg-tech__section-desc">
              항목을 누르면 설명과 이미지가 펼쳐집니다.
            </p>
          </header>
        </div>

        <div className="hg-tech__acc-list">
          {config.items.map((item, index) => (
            <TechAccordionItem
              key={item.title}
              item={item}
              index={index}
              open={openIndex === index}
              onToggle={() =>
                setOpenIndex((current) => (current === index ? -1 : index))
              }
            />
          ))}
        </div>
      </section>

      {(config.overview?.length > 0 || config.goals?.length > 0) && (
        <section
          ref={processRef}
          className="hg-tech__duo hg-tech__reveal"
          aria-label="시스템 개요와 기대 효과"
        >
          {config.overview?.length > 0 && (
            <div className="hg-tech__duo-col" aria-label="액비순환시스템 개요">
              <header className="hg-tech__head hg-tech__reveal-item">
                <h3 className="hg-tech__section-title">액비순환시스템 개요</h3>
              </header>
              <ol className="hg-tech__flow">
                {config.overview.map((line, index) => (
                  <li
                    key={line}
                    className="hg-tech__flow-item hg-tech__reveal-item"
                    style={{ "--hg-tech-stagger": `${index * 40}ms` }}
                  >
                    <span className="hg-tech__flow-num" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p>{line}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {config.goals?.length > 0 && (
            <div
              className="hg-tech__duo-col"
              aria-label="기술 적용으로 기대하는 효과"
            >
              <header className="hg-tech__head hg-tech__reveal-item">
                <h3 className="hg-tech__section-title">기술 적용으로 기대하는 효과</h3>
              </header>
              <ul className="hg-tech__outcome-list">
                {config.goals.map((goal, index) => (
                  <li
                    key={goal}
                    className="hg-tech__outcome hg-tech__reveal-item"
                    style={{ "--hg-tech-stagger": `${index * 45}ms` }}
                  >
                    <span className="hg-tech__outcome-num" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section
        ref={ctaRef}
        className="hg-tech__cta hg-tech__reveal"
        aria-label="문의 및 실적"
      >
        <div className="hg-tech__cta-inner hg-tech__reveal-item">
          <div>
            <h3 className="hg-tech__section-title">현장에 맞는 기술 구성을 상담해 드립니다</h3>
            <p className="hg-tech__section-desc">
              농장 규모와 처리 목표에 맞춰 공정을 제안합니다. 실적도 함께 확인해 보세요.
            </p>
          </div>
          <div className="hg-tech__cta-actions">
            <HgAppLink to={boardWriteRouteTarget("qa")} className="hg-tech__cta-btn hg-tech__cta-btn--primary">
              문의하기
            </HgAppLink>
            <HgAppLink to={boardRouteTarget("project")} className="hg-tech__cta-btn">
              주요실적 보기
            </HgAppLink>
          </div>
        </div>
      </section>
    </div>
  );
}
