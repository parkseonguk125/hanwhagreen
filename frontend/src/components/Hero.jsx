import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeroArrow } from "./Icons";
import { assets } from "../data/mock";
import { fetchNoticePosts } from "../services/boardApi";
import { boardRouteTarget, boardViewRouteTarget } from "../utils/navRoutes";

export default function Hero() {
  const slides = assets.heroSlides;
  const [index, setIndex] = useState(0);
  const [latestNotice, setLatestNotice] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchNoticePosts()
      .then((posts) => {
        if (!cancelled && posts[0]) setLatestNotice(posts[0]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const goPrev = () => {
    setIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    setIndex((current) => (current + 1) % slides.length);
  };

  return (
    <div className="section main_bn">
      <div className="main_bn_wrap hero-track-wrap">
        <div
          className="hero-track"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        >
          {slides.map((image, slideIndex) => (
            <div className="hero-slide" key={image}>
              <div
                className="background hero-slide-bg"
                style={{ backgroundImage: `url('${image}')` }}
                role="img"
                aria-label={`메인 배너 ${slideIndex + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="main_news">
        <div className="main_notice main_latest">
          <h3>NOTICE</h3>
          <ul>
            <li>
              {latestNotice ? (
                <Link to={boardViewRouteTarget("notice", latestNotice.id)}>
                  {latestNotice.subject}
                </Link>
              ) : (
                <Link to={boardRouteTarget("notice")}>공지사항</Link>
              )}
            </li>
          </ul>
          <div className="notice_con" />
        </div>
      </div>

      <div className="main_controll">
        <button
          type="button"
          className="main_arrow arrow_prev"
          aria-label="이전 슬라이드"
          onClick={goPrev}
        >
          <HeroArrow direction="prev" />
        </button>
        <button
          type="button"
          className="main_arrow arrow_next"
          aria-label="다음 슬라이드"
          onClick={goNext}
        >
          <HeroArrow direction="next" />
        </button>
      </div>

      <div className="main_dot">
        {slides.map((_, dotIndex) => (
          <button
            key={dotIndex}
            type="button"
            className={`hero-dot-btn${
              dotIndex === index ? " hero-dot-active" : ""
            }`}
            aria-label={`슬라이드 ${dotIndex + 1}`}
            aria-current={dotIndex === index ? "true" : undefined}
            onClick={() => setIndex(dotIndex)}
          />
        ))}
      </div>
    </div>
  );
}
