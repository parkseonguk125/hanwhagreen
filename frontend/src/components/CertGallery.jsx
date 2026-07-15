import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import DetailButton from "./DetailButton";
import Icon from "./Icons";
import "swiper/css";
import "swiper/css/navigation";
import { assets } from "../data/mock";
import { certifications } from "../data/certifications";

/** 메인 갤러리 — 세로 원본 우선 (550×320 가로 썸네일은 잘림 발생) */
function mainCertImage(cert) {
  if (cert.imageLink) return cert.imageLink;
  return cert.image.replace(/_550x320\.(jpe?g|png)$/i, "_460x550.$1");
}

export default function CertGallery() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const bindNavigation = (swiper) => {
    if (!prevRef.current || !nextRef.current) return;

    swiper.params.navigation.prevEl = prevRef.current;
    swiper.params.navigation.nextEl = nextRef.current;
    swiper.navigation.destroy();
    swiper.navigation.init();
    swiper.navigation.update();
  };

  return (
    <div
      className="section gallery background"
      style={{ backgroundImage: `url('${assets.galleryBg}')` }}
    >
      <div className="inner">
        <div className="gall_tit">
          <div className="gall_tit_ani">
            <p className="title">한화그린</p>
            <p className="title">인증서 및 특허증</p>
          </div>
          <div className="gall_arrow">
            <button
              ref={prevRef}
              type="button"
              className="slick-arrow gall-arrow-btn"
              aria-label="이전"
            >
              <Icon name="chevron-left" size="md" />
            </button>
            <button
              ref={nextRef}
              type="button"
              className="slick-arrow gall-arrow-btn"
              aria-label="다음"
            >
              <Icon name="chevron-right" size="md" />
            </button>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ backgroundSize: `${progress}% 100%` }}
          >
            <span className="sr-only">슬라이드 진행률</span>
          </div>
          <DetailButton href="/bbs/board.php?bo_table=certification" />
        </div>

        <div className="gall_con_wrap">
          <Swiper
            modules={[Navigation]}
            slidesPerView={1}
            spaceBetween={0}
            onBeforeInit={bindNavigation}
            onInit={bindNavigation}
            onProgress={(swiper) => {
              setProgress(Math.max(5, Math.abs(swiper.progress) * 100));
            }}
            breakpoints={{
              901: {
                slidesPerView: 2,
                spaceBetween: 0,
              },
              1241: {
                slidesPerView: 3,
                spaceBetween: 0,
              },
            }}
            className="gall_contents"
            autoHeight
            watchSlidesProgress
          >
            {certifications.map((cert) => (
              <SwiperSlide key={cert.id}>
                <div className="gall_con">
                  <Link
                    to={`/bbs/board.php?bo_table=certification&wr_id=${cert.id}`}
                  >
                    <div className="gall_con_img">
                      <img
                        src={mainCertImage(cert)}
                        alt={cert.title}
                      />
                    </div>
                    <dl>
                      <dt>{cert.title}</dt>
                      <dd>{cert.content || cert.subject}</dd>
                    </dl>
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
