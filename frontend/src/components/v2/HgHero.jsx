import { useEffect, useRef, useState } from "react";
import { assets } from "../../data/mock";
import { useHgHeroScroll } from "./hooks";

const slideCopy = [
  {
    tagline: "친환경 솔루션의 새로운 기준",
    title: "환경을 우선으로,",
    subtitle: "더 나은 내일을 만듭니다",
    tabLabel: "Company",
  },
  {
    tagline: "스마트 환경 기술로 현장을 바꿉니다",
    title: "친환경 기술로",
    subtitle: "현장의 문제를 해결합니다",
    tabLabel: "Business",
  },
  {
    tagline: "현장 경험이 만드는 플랜트 역량",
    title: "다년간의 현장 경험,",
    subtitle: "최적화된 플랜트 건설",
    tabLabel: "Vision",
  },
];

const SLIDE_DURATION_MS = 6000;

export default function HgHero() {
  const slides = assets.heroSlides;
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useHgHeroScroll(scrollRef);

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [slides.length, paused, index]);

  const copy = slideCopy[index] ?? slideCopy[0];

  return (
    <div className="hg-hero-scroll" ref={scrollRef} aria-label="메인 비주얼">
      <div className="hg-hero-sticky">
        <div className="hg-hero-shell">
          <section className="hg-hero-wrap">
            <section className="hg-hero">
              <div
                className="hg-hero__track"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {slides.map((image, i) => (
                  <div
                    key={image}
                    className={`hg-hero__slide${i === index ? " is-active" : ""}`}
                  >
                    <img
                      className="hg-hero__img"
                      src={image}
                      alt={`메인 배너 ${i + 1}`}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      style={{
                        objectPosition: i === 0 ? "center 30%" : "center center",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="hg-hero__overlay" />

              <div className="hg-hero__content">
                <p className="hg-hero__tagline hg-animate-fade-up">
                  <span className="hg-hero__tagline-line" aria-hidden="true" />
                  {copy.tagline}
                </p>
                <h1 className="hg-hero__title hg-animate-fade-up hg-animate-delay-1">
                  <span className="hg-hero__title-line">{copy.title}</span>
                  <span className="hg-hero__title-line">{copy.subtitle}</span>
                </h1>
              </div>

              <div className="hg-hero__dock">
                <button
                  type="button"
                  className="hg-hero__dock-play"
                  aria-label={paused ? "슬라이드 재생" : "슬라이드 정지"}
                  onClick={() => setPaused((value) => !value)}
                >
                  {paused ? "▶" : "‖"}
                </button>

                <div className="hg-hero__dock-tabs" role="tablist" aria-label="메인 슬라이드">
                  {slideCopy.map((slide, i) => {
                    const isActive = index === i;
                    return (
                      <button
                        key={slide.tabLabel}
                        type="button"
                        role="tab"
                        className={`hg-hero__dock-tab${isActive ? " is-active" : ""}`}
                        aria-selected={isActive}
                        onClick={() => setIndex(i)}
                      >
                        <span className="hg-hero__dock-tab-label">{slide.tabLabel}</span>
                        {isActive && (
                          <span
                            key={`progress-${index}-${paused}`}
                            className={`hg-hero__dock-progress${paused ? " is-paused" : ""}`}
                            style={{ animationDuration: `${SLIDE_DURATION_MS}ms` }}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
}
