import { cloneElement, useEffect, useRef, useState } from "react";
import HgAppLink from "./HgAppLink";
import NaverMapEmbed from "../NaverMapEmbed";
import { assets, footerInfo } from "../../data/mock";
import { projects } from "../../data/projects";
import { certifications } from "../../data/certifications";
import { HANWHA_GREEN_LOCATION, getNaverDirectionsUrl } from "../../config/mapLinks";
import { fetchNoticePosts } from "../../services/boardApi";
import {
  boardRouteTarget,
  boardViewRouteTarget,
  boardWriteRouteTarget,
} from "../../utils/navRoutes";
import { useHgReveal } from "./hooks";

const HERO_INTERVAL_MS = 4000;

/* 원본 홈(hanwhagreen.com)의 3개 영역 구성·카피 */
const areaItems = [
  {
    label: "회사소개",
    text: "한화그린은 환경을 우선으로 최적화된 새로운 정화기술을 제시합니다.",
    href: "/bbs/content.php?co_id=company",
    image: assets.areaPanels[0],
  },
  {
    label: "공사실적",
    text: "한화그린은 다양한 수처리, 에너지화 현장에 최적화된 혁신적인 기술과 솔루션을 제시합니다.",
    href: "/bbs/content.php?co_id=construction",
    image: assets.areaPanels[1],
  },
  {
    label: "보유기술",
    text: "한화그린은 많은 현장경험으로 자체 기술력을 보유하고 있습니다.",
    href: "/bbs/content.php?co_id=technology",
    image: assets.areaPanels[2],
  },
];

/* 원본 홈 '홍보영상' 2편 */
const promoVideos = [
  {
    id: "wnj6C5LBa80",
    title: "한화그린 농장폐수 농업기술 폐수처리 하수처리 액비화",
  },
  {
    id: "dU2SQylDQqw",
    title: "[채영국의 한돈사랑TV - 현장검증기] 한돈농가 최대숙원! 악취문제 전격해결!",
  },
];

const curatedProjects = [
  { id: 320, label: "상철농장", category: "스마트축사", region: "축사·환경시설" },
  { id: 275, label: "지렁이농장", category: "자원순환", region: "유기성 자원 현장" },
  { id: 266, label: "정화방류 시설", category: "폐수처리", region: "정화·방류" },
  { id: 251, label: "액비순환 시설", category: "액비순환", region: "액비·악취" },
  { id: 202, label: "안개분무 시설", category: "악취저감", region: "안개분무" },
  { id: 210, label: "바이오커튼 시설", category: "바이오커튼", region: "축사 외벽·ICT" },
];

function projectById(id, fallbackIndex) {
  return projects.find((project) => project.id === id) ?? projects[fallbackIndex];
}

function SectionHeading({ label, title, description, action, titleId }) {
  return (
    <header className="hg3-section-head">
      <div>
        <p className="hg3-section-label hg-reveal">{label}</p>
        <h2 id={titleId} className="hg3-section-title hg-reveal hg-reveal--delay-1">
          {title}
        </h2>
        {description && (
          <p className="hg3-section-desc hg-reveal hg-reveal--delay-2">{description}</p>
        )}
      </div>
      {action
        ? cloneElement(action, {
            className: [action.props?.className, "hg-reveal", "hg-reveal--delay-2"]
              .filter(Boolean)
              .join(" "),
          })
        : null}
    </header>
  );
}

function HomeHero() {
  const slides = assets.heroSlides;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setArmed(true);
      return undefined;
    }
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setArmed(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (paused || slides.length < 2) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = setInterval(
      () => setCurrent((index) => (index + 1) % slides.length),
      HERO_INTERVAL_MS
    );
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  return (
    <section
      className="hg3-hero"
      aria-labelledby="hg3-hero-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hg3-hero__slides" aria-hidden="true">
        {slides.map((src, index) => (
          <img
            key={src}
            className={`hg3-hero__slide${index === current ? " is-active" : ""}`}
            src={src}
            alt=""
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
          />
        ))}
      </div>
      <div className="hg3-hero__shade" aria-hidden="true" />
      <div className={`hg3-container hg3-hero__content${armed ? " is-armed" : ""}`}>
        <p className="hg3-hero__eyebrow hg3-hero__enter hg3-hero__enter--1">
          축산 환경·플랜트 전문기업
        </p>
        <h1 id="hg3-hero-title" className="hg3-hero__title hg3-hero__enter hg3-hero__enter--2">
          한화그린은
          <br />
          녹색환경의 선두주자로서
          <br />
          지속적으로 성장하는 벤처기업입니다
        </h1>
        <p className="hg3-hero__lead hg3-hero__enter hg3-hero__enter--3">
          축산·도축 폐수처리부터 액비순환, 악취저감, 스마트축사까지
          <br className="hg3-desktop-only" />
          현장에 필요한 환경시설을 설계하고 시공합니다.
        </p>
        <ul className="hg3-hero__keywords hg3-hero__enter hg3-hero__enter--4" aria-label="주요 사업분야">
          <li>폐수처리·정화방류</li>
          <li>액비순환</li>
          <li>악취저감</li>
          <li>스마트축사·ICT</li>
        </ul>
        {slides.length > 1 && (
          <div
            className="hg3-hero__dots hg3-hero__enter hg3-hero__enter--5"
            role="tablist"
            aria-label="히어로 이미지 선택"
          >
            {slides.map((src, index) => (
              <button
                key={src}
                type="button"
                role="tab"
                aria-selected={index === current}
                aria-label={`${index + 1}번 이미지`}
                className={`hg3-hero__dot${index === current ? " is-active" : ""}`}
                onClick={() => setCurrent(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AreaSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    /* 히어로를 보는 동안 3장 미리 받아 두고, 등장 시 디코드 히치 줄임 */
    areaItems.forEach((item) => {
      const warm = new Image();
      warm.decoding = "async";
      warm.src = item.image;
    });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    let shown = false;
    let cancelled = false;

    const show = async () => {
      if (shown) return;
      shown = true;

      /* 디코드 전에 is-in 하면 페이드 중간에 비트맵이 붙어 끊긴 느낌 */
      const imgs = [...section.querySelectorAll(".hg3-area__media img")];
      await Promise.all(
        imgs.map((img) => {
          if (typeof img.decode !== "function") return Promise.resolve();
          return img.decode().catch(() => undefined);
        })
      );
      if (cancelled) return;

      requestAnimationFrame(() => {
        if (!cancelled) section.classList.add("is-in");
      });
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("is-in");
      return undefined;
    }

    /* 뷰포트에 살짝 닿기 전에 시작해 스크롤과 애니메이션이 덜 겹침 */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        void show();
      },
      { root: null, threshold: 0.08, rootMargin: "80px 0px 0px 0px" }
    );

    observer.observe(section);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hg3-section hg3-area hg3-area--enter"
      aria-labelledby="hg3-area-title"
    >
      <div className="hg3-container">
        <header className="hg3-section-head hg3-area__head">
          <div>
            <p className="hg3-section-label">한화그린</p>
            <h2 id="hg3-area-title" className="hg3-section-title">
              환경을 우선하는 정화기술 전문기업
            </h2>
          </div>
        </header>
        <div className="hg3-area__grid">
          {areaItems.map((item) => (
            <HgAppLink key={item.label} to={item.href} className="hg3-area__card">
              <div className="hg3-area__media">
                <img
                  src={item.image}
                  alt=""
                  loading="eager"
                  decoding="async"
                  fetchPriority="low"
                />
              </div>
              <div className="hg3-area__body">
                <h3>{item.label}</h3>
                <p>{item.text}</p>
                <span className="hg3-area__more">
                  자세히 보기 <i aria-hidden="true">→</i>
                </span>
              </div>
            </HgAppLink>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsSection() {
  const selected = curatedProjects
    .map((item, index) => ({ ...item, project: projectById(item.id, index) }))
    .filter((item) => item.project);

  return (
    <section className="hg3-section hg3-projects" aria-labelledby="hg3-projects-title">
      <div className="hg3-container">
        <SectionHeading
          label="주요실적"
          title="한화그린 주요실적"
          titleId="hg3-projects-title"
          description="폐수처리·액비순환·악취저감·바이오커튼 등 서로 다른 현장의 대표 사례입니다."
          action={
            <HgAppLink to={boardRouteTarget("project")} className="hg3-head-link">
              전체 실적 보기 <span aria-hidden="true">→</span>
            </HgAppLink>
          }
        />
        <div className="hg3-projects__grid">
          {selected.map(({ project, label, category, region }, index) => (
            <HgAppLink
              key={project.id}
              to={boardViewRouteTarget("project", project.id)}
              className={`hg3-project hg-reveal hg-reveal--delay-${(index % 3) + 1}`}
            >
              <div className={`hg3-project__media hg3-project__media--${(index % 3) + 1}`}>
                <img src={project.image} alt="" loading="lazy" />
              </div>
              <div className="hg3-project__body">
                <span>{category}</span>
                <h3>{label}</h3>
                <p className="hg3-project__region">{region}</p>
                <i aria-hidden="true">↗</i>
              </div>
            </HgAppLink>
          ))}
        </div>
      </div>
    </section>
  );
}

function CertificationSection() {
  const selected = certifications.slice(0, 6);

  return (
    <section className="hg3-section hg3-certs" aria-labelledby="hg3-certs-title">
      <div className="hg3-container">
        <SectionHeading
          label="지식산업권"
          title="인증서 및 특허증"
          titleId="hg3-certs-title"
          description="환경전문공사업 등록과 경영시스템 인증, 폐수처리 관련 특허 자료를 공개합니다."
          action={
            <HgAppLink to={boardRouteTarget("certification")} className="hg3-head-link">
              전체 자료 보기 <span aria-hidden="true">→</span>
            </HgAppLink>
          }
        />
        <div className="hg3-certs__grid">
          {selected.map((cert, index) => (
            <HgAppLink
              key={cert.id}
              to={boardViewRouteTarget("certification", cert.id)}
              className={`hg3-cert hg-reveal hg-reveal--delay-${(index % 3) + 1}`}
            >
              <div className="hg3-cert__thumb">
                <img src={cert.imageLink || cert.image} alt="" loading="lazy" />
              </div>
              <div className="hg3-cert__body">
                <span>{cert.date?.slice(0, 4) || "자료"}</span>
                <h3>{cert.title}</h3>
              </div>
            </HgAppLink>
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoSection() {
  return (
    <section className="hg3-section hg3-videos" aria-labelledby="hg3-videos-title">
      <div className="hg3-container">
        <SectionHeading
          label="홍보영상"
          title="현장에서 확인하는 한화그린"
          titleId="hg3-videos-title"
          action={
            <HgAppLink to={boardRouteTarget("news")} className="hg3-head-link">
              영상 더보기 <span aria-hidden="true">→</span>
            </HgAppLink>
          }
        />
        <div className="hg3-videos__grid">
          {promoVideos.map((video, index) => (
            <figure key={video.id} className={`hg3-video hg-reveal hg-reveal--delay-${index + 1}`}>
              <div className="hg3-video__frame">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <figcaption>{video.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

const inquiryTechs = [
  "스마트팜축사",
  "액비순환",
  "정화방류",
  "바이오가스",
  "태양광",
  "탄소중립",
];

function InquiryBandSection() {
  return (
    <section className="hg3-inquiry" aria-labelledby="hg3-inquiry-title">
      <div className="hg3-inquiry__media" aria-hidden="true">
        <img
          className="hg3-inquiry__bg"
          src={assets.inquiryBg}
          alt=""
          loading="lazy"
        />
        <div className="hg3-inquiry__shade" />
      </div>
      <div className="hg3-container hg3-inquiry__layout">
        <div className="hg3-inquiry__copy hg-reveal">
          <h2 id="hg3-inquiry-title">
            깨끗한 축사환경부터 탄소중립까지
            <br className="hg3-desktop-only" />
            현장에 맞는 솔루션을 제안합니다
          </h2>
          <p>
            30년 양돈 현장 경험을 바탕으로 축사환경 개선, 생산원가 절감, ICT 관리,
            에너지 자가생산까지 함께 설계합니다.
          </p>
          <ul className="hg3-inquiry__techs" aria-label="주요 기술">
            {inquiryTechs.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </div>
        <aside className="hg3-inquiry__aside hg-reveal hg-reveal--delay-2">
          <HgAppLink to={boardWriteRouteTarget("qa")} className="hg3-inquiry__btn">
            문의하기
            <span aria-hidden="true">→</span>
          </HgAppLink>
          <div className="hg3-inquiry__contact">
            <a
              className="hg3-inquiry__phone"
              href={`tel:${footerInfo.phone.replace(/-/g, "")}`}
            >
              <span>대표전화</span>
              {footerInfo.phone}
            </a>
            <p className="hg3-inquiry__hours">{footerInfo.hours}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function NoticesSection() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchNoticePosts()
      .then((posts) => {
        if (!cancelled) setNotices(posts.slice(0, 5));
      })
      .catch(() => {
        if (!cancelled) setNotices([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* 비동기 로드 후 목록에도 스크롤 등장 효과가 걸리도록 */
  useHgReveal([notices.length]);

  return (
    <section className="hg3-section hg3-news" aria-labelledby="hg3-news-title">
      <div className="hg3-container">
        <SectionHeading
          label="공지"
          title="공지사항"
          titleId="hg3-news-title"
          description="한화그린의 운영 안내와 주요 소식을 전해 드립니다."
          action={
            <HgAppLink to={boardRouteTarget("notice")} className="hg3-head-link">
              전체 보기 <span aria-hidden="true">→</span>
            </HgAppLink>
          }
        />

        {notices.length > 0 ? (
          <ul className="hg3-notice-list">
            {notices.map((notice, index) => (
              <li key={notice.id} className={`hg-reveal hg-reveal--delay-${(index % 3) + 1}`}>
                <HgAppLink to={boardViewRouteTarget("notice", notice.id)}>
                  <span className="hg3-notice-list__no" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <strong>{notice.subject}</strong>
                  <time dateTime={notice.date}>{notice.date}</time>
                  <span className="hg3-notice-list__go" aria-hidden="true">
                    →
                  </span>
                </HgAppLink>
              </li>
            ))}
          </ul>
        ) : (
          <p className="hg3-news__empty hg-reveal">
            새로운 공지가 등록되면 이곳에서 안내합니다.
          </p>
        )}
      </div>
    </section>
  );
}

function LocationsBar() {
  const offices = [footerInfo.hq, footerInfo.branch].filter(Boolean);
  const mapUrl = getNaverDirectionsUrl(HANWHA_GREEN_LOCATION);

  return (
    <section className="hg3-locations" aria-labelledby="hg3-locations-title">
      <div className="hg3-container">
        <div className="hg3-locations__layout hg-reveal">
          <div className="hg3-locations__info">
            <div className="hg3-locations__head">
              <h2 id="hg3-locations-title">연락처</h2>
              <p>본사와 전라지사로 편하게 연락해 주세요.</p>
            </div>
            {offices.map((office) => (
              <article key={office.label} className="hg3-location-card">
                <p className="hg3-location-card__label">
                  {office.label}
                  <span>{office.region}</span>
                </p>
                <p className="hg3-location-card__address">{office.address}</p>
                <a
                  className="hg3-location-card__phone"
                  href={`tel:${office.phone.replace(/-/g, "")}`}
                >
                  {office.phone}
                </a>
                <p className="hg3-location-card__hours">{office.hours}</p>
              </article>
            ))}
            <div className="hg3-locations__links">
              <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                네이버 지도 길찾기
              </a>
              <HgAppLink to="/bbs/content.php?co_id=map">오시는길 자세히</HgAppLink>
            </div>
          </div>

          <div className="hg3-locations__map-col">
            <div className="hg3-locations__head">
              <h2 id="hg3-locations-map-title">한화그린 위치</h2>
              <p>네이버 지도에서 본사 위치를 확인하세요.</p>
            </div>
            <div className="hg3-locations__map">
              <NaverMapEmbed
                className="hg3-locations__map-embed"
                height={420}
                lat={HANWHA_GREEN_LOCATION.lat}
                lng={HANWHA_GREEN_LOCATION.lng}
                title={HANWHA_GREEN_LOCATION.name}
                address={HANWHA_GREEN_LOCATION.address}
                markerLabel="한화그린 본사"
                openInfoOnLoad
              />
              <p className="hg3-locations__map-caption">
                한화그린 본사 · {HANWHA_GREEN_LOCATION.address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HgHomeRedesign() {
  useHgReveal([]);

  return (
    <>
      <HomeHero />
      <AreaSection />
      <ProjectsSection />
      <CertificationSection />
      <VideoSection />
      <InquiryBandSection />
      <NoticesSection />
      <LocationsBar />
    </>
  );
}
