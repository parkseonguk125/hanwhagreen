import { useRef } from "react";
import { assets } from "../../data/mock";
import { HgNavLink } from "./HgNavLink";
import { useHgBusinessScroll, useHgViewport } from "./hooks";

const showcaseItems = [
  {
    id: 0,
    tab: "회사소개",
    headline: ["한화그린은", "환경을 우선으로", "최적화된 정화기술을", "제시합니다"],
    mobileTitle: "환경을 우선하는\n정화 기술",
    desc: "친환경 수처리·폐수관리 분야에서 현장 경험과 기술력으로 지속가능한 미래를 만들어갑니다.",
    href: "/bbs/content.php?co_id=company",
    image: assets.areaPanels[0],
    objectPosition: "center 35%",
  },
  {
    id: 1,
    tab: "공사실적",
    headline: ["한화그린은", "다양한 수처리·에너지화", "현장에 최적화된", "솔루션을 제시합니다"],
    mobileTitle: "현장 맞춤\n수처리 솔루션",
    desc: "농장폐수, 하수처리, 액비화 등 환경 효율화 프로젝트의 풍부한 실적을 보유하고 있습니다.",
    href: "/bbs/content.php?co_id=construction",
    image: assets.areaPanels[1],
    objectPosition: "center center",
  },
  {
    id: 2,
    tab: "보유기술",
    headline: ["한화그린은", "많은 현장경험으로", "자체 기술력을", "보유하고 있습니다"],
    mobileTitle: "자체 기술력으로\n문제를 해결합니다",
    desc: "스마트 환경 기술과 플랜트 건설 역량으로 현장의 문제를 해결합니다.",
    href: "/bbs/content.php?co_id=technology",
    image: assets.areaPanels[2],
    objectPosition: "center 40%",
  },
];

export default function HgAreaSection() {
  const scrollRef = useRef(null);
  const { isMobile } = useHgViewport();
  const maxIndex = Math.max(showcaseItems.length - 1, 1);
  const { activeIndex, contentRevealIndex } = useHgBusinessScroll(
    scrollRef,
    isMobile ? 0 : showcaseItems.length
  );

  if (isMobile) {
    return (
      <section className="hg-m-biz" id="home-about" aria-label="사업 소개">
        <div className="hg-m-biz__inner">
          <header className="hg-m-sec-head">
            <p className="hg-m-sec-head__eyebrow">사업소개</p>
            <h2 className="hg-m-sec-head__title">
              한화그린이
              <br />
              만들어 가는 가치
            </h2>
          </header>

          <div className="hg-m-biz__list">
            {showcaseItems.map((item, i) => (
              <article key={item.id} className="hg-m-biz__card">
                <HgNavLink
                  item={{ label: item.tab, href: item.href }}
                  className="hg-m-biz__hit"
                >
                  <div className="hg-m-biz__media">
                    <img
                      src={item.image}
                      alt=""
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      style={{ objectPosition: item.objectPosition }}
                    />
                    <span className="hg-m-biz__index">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="hg-m-biz__body">
                    <p className="hg-m-biz__label">{item.tab}</p>
                    <h3 className="hg-m-biz__title">
                      {item.mobileTitle.split("\n").map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </h3>
                    <p className="hg-m-biz__desc">{item.desc}</p>
                    <span className="hg-m-biz__more">자세히 보기</span>
                  </div>
                </HgNavLink>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="hg-biz"
      id="home-about"
      ref={scrollRef}
      aria-label="회사 소개 쇼케이스"
      style={{
        "--hg-panel-count": showcaseItems.length,
        "--hg-biz-max-index": maxIndex,
      }}
    >
      <div className="hg-biz-sticky">
        <div className="hg-biz-shell">
          <div className="hg-biz-viewport">
            {showcaseItems.map((item, i) => (
              <article
                key={item.id}
                id={`hg-biz-panel-${item.id}`}
                className={`hg-biz-panel${activeIndex === i ? " is-active" : ""}${
                  contentRevealIndex === i ? " is-content-revealed" : ""
                }`}
                data-hg-panel-index={i}
                aria-hidden={activeIndex !== i}
                style={{
                  "--hg-panel-index": i,
                  "--hg-panel-offset": i,
                  "--hg-panel-travel": i * 1.16,
                  "--hg-panel-scale": i === 0 ? 1 : 0.92,
                  "--hg-panel-rotate": i === 0 ? 0 : -6.5,
                  "--hg-panel-z": i === 0 ? 0 : -68,
                  "--hg-panel-origin-x": i === 0 ? "50%" : "86%",
                  "--hg-panel-opacity": 1,
                }}
              >
                <div className="hg-biz-panel__inner">
                  <img
                    className="hg-biz-panel__img"
                    src={item.image}
                    alt=""
                    loading={item.id === 0 ? "eager" : "lazy"}
                    decoding="async"
                    style={{ objectPosition: item.objectPosition }}
                  />
                  <div className="hg-biz-panel__shade" aria-hidden="true" />
                  <div className="hg-biz-panel__body">
                    <span className="hg-biz-panel__badge">{item.tab}</span>
                    <h2 className="hg-biz-panel__headline">
                      {item.headline.map((line, lineIndex) => (
                        <span
                          key={line}
                          className="hg-biz-panel__headline-line"
                          style={{ "--hg-biz-line-index": lineIndex }}
                        >
                          {line}
                        </span>
                      ))}
                    </h2>
                    <p className="hg-biz-panel__desc">{item.desc}</p>
                    <HgNavLink
                      item={{ label: item.tab, href: item.href }}
                      className="hg-btn hg-btn--outline hg-biz-panel__cta"
                    >
                      자세히 보기
                      <span className="hg-btn__arrow" aria-hidden="true">
                        →
                      </span>
                    </HgNavLink>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
