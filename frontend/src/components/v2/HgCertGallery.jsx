import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { certificates } from "../../data/mock";

const pillars = [
  {
    label: "환경",
    title: "Green Wave",
    desc: "친환경 수처리·폐수관리 솔루션",
    href: "/bbs/content.php?co_id=technology",
    accent: "#2cb573",
  },
  {
    label: "기술",
    title: "Smart Tech",
    desc: "현장 경험 기반 자체 보유 기술력",
    href: "/bbs/content.php?co_id=construction",
    accent: "#1a8f5c",
  },
  {
    label: "인증",
    title: "Trust & Proof",
    desc: "인증서·특허로 검증된 품질",
    href: "/bbs/board.php?bo_table=certification",
    accent: "#147a4d",
  },
];

const SUSTAIN_BUFFER_PX = 120;

function mainCertImage(cert) {
  if (cert.imageLink) return cert.imageLink;
  return cert.image.replace(/_550x320\.(jpe?g|png)$/i, "_460x550.$1");
}

function CertCard({ cert, duplicate = false }) {
  return (
    <Link
      to={`/bbs/board.php?bo_table=certification&wr_id=${cert.id}`}
      className="hg-cert__item"
      tabIndex={duplicate ? -1 : undefined}
    >
      <div className="hg-cert__frame">
        <img src={mainCertImage(cert)} alt={duplicate ? "" : cert.title} loading="lazy" />
      </div>
      <p className="hg-cert__caption">{cert.title}</p>
    </Link>
  );
}

export default function HgCertGallery() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const syncHeight = () => {
      if (window.matchMedia("(max-width: 1024px)").matches) {
        stage.style.height = "";
        stage.style.minHeight = "";
        section.style.height = "";
        section.style.minHeight = "";
        return;
      }

      const h = Math.round(window.visualViewport?.height || window.innerHeight);
      stage.style.height = `${h}px`;
      stage.style.minHeight = `${h}px`;
      section.style.height = `${h + SUSTAIN_BUFFER_PX}px`;
      section.style.minHeight = `${h + SUSTAIN_BUFFER_PX}px`;
    };

    syncHeight();
    window.addEventListener("resize", syncHeight);
    window.visualViewport?.addEventListener("resize", syncHeight);
    window.visualViewport?.addEventListener("scroll", syncHeight);

    return () => {
      window.removeEventListener("resize", syncHeight);
      window.visualViewport?.removeEventListener("resize", syncHeight);
      window.visualViewport?.removeEventListener("scroll", syncHeight);
    };
  }, []);

  const durationSec = Math.max(certificates.length * 6, 32);

  return (
    <section
      ref={sectionRef}
      className="hg-section hg-section--sustain"
      id="home-cert"
      aria-labelledby="hg-cert-title"
    >
      <div ref={stageRef} className="hg-section--sustain__stage">
        <div className="hg-section--sustain__bg" aria-hidden="true" />
        <div className="hg-container">
          <header className="hg-section-header hg-flex-between hg-reveal">
            <div>
              <span className="hg-label hg-label--light">Sustainability</span>
              <h2 id="hg-cert-title" className="hg-section-title hg-section-title--split hg-section-title--light">
                <span>지속가능한 미래를 위한</span>
                <span>한화그린의 약속</span>
              </h2>
            </div>
            <Link to="/bbs/board.php?bo_table=certification" className="hg-link-arrow hg-link-arrow--light">
              전체 보기 →
            </Link>
          </header>

          <div className="hg-pillars hg-reveal">
            {pillars.map((item, i) => (
              <Link
                key={item.label}
                to={item.href}
                className="hg-pillars__card"
                style={{ "--pillar-accent": item.accent, "--pillar-delay": `${i * 0.12}s` }}
              >
                <span className="hg-pillars__glow" aria-hidden="true" />
                <span className="hg-pillars__label">{item.label}</span>
                <h3 className="hg-pillars__title">{item.title}</h3>
                <p className="hg-pillars__desc">{item.desc}</p>
                <span className="hg-pillars__arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 현대차처럼 화면 전폭으로 흘러 들어가고 나가게 (컨테이너 클리핑 제거) */}
        <div className="hg-cert-block hg-reveal hg-reveal--delay-2">
          <div className="hg-container">
            <div className="hg-cert-block__head">
              <p className="hg-cert-block__label">Certification</p>
            </div>
          </div>

          <div className={`hg-cert-marquee${playing ? "" : " is-paused"}`}>
            <div className="hg-cert-marquee__viewport">
              <div
                className="hg-cert-marquee__track"
                style={{ "--hg-cert-duration": `${durationSec}s` }}
              >
                <div className="hg-cert-marquee__group">
                  {certificates.map((cert) => (
                    <CertCard key={cert.id} cert={cert} />
                  ))}
                </div>
                <div className="hg-cert-marquee__group" aria-hidden="true">
                  {certificates.map((cert) => (
                    <CertCard key={`dup-${cert.id}`} cert={cert} duplicate />
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="hg-cert-marquee__toggle"
              onClick={() => setPlaying((prev) => !prev)}
              aria-pressed={!playing}
              aria-label={playing ? "슬라이드 정지" : "슬라이드 재생"}
            >
              <span className="hg-cert-marquee__toggle-icon" aria-hidden="true">
                {playing ? (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M8 5.5v13l11-6.5L8 5.5z" />
                  </svg>
                )}
              </span>
              <span className="hg-sr-only">{playing ? "정지" : "재생"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
