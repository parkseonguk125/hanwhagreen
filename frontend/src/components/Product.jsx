import { Link } from "react-router-dom";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Icon from "./Icons";
import "swiper/css";
import "swiper/css/navigation";
import { projects } from "../data/projects";

/** 메인 페이지 썸네일 — 원본과 동일한 480×420 */
function mainThumb(url) {
  return url.replace(/_383x240\.jpg$/, "_480x420.jpg");
}

export default function Product() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const bindNavigation = (swiper) => {
    if (!prevRef.current || !nextRef.current) return;

    swiper.params.navigation.prevEl = prevRef.current;
    swiper.params.navigation.nextEl = nextRef.current;
    swiper.navigation.destroy();
    swiper.navigation.init();
    swiper.navigation.update();
  };

  return (
    <div className="section product">
      <div className="inner">
        <div className="pro_tit">
          <dl>
            <dt className="title">한화그린 주요실적</dt>
            <dd>주요실적 현황</dd>
          </dl>
          <div className="pro_controll">
            <Link to="/bbs/board.php?bo_table=project">자세히 보기</Link>
            <div className="pro_arrow">
              <button
                ref={prevRef}
                type="button"
                className="slick-arrow pro-arrow-btn"
                aria-label="이전"
              >
                <Icon name="chevron-left" size="md" />
              </button>
              <button
                ref={nextRef}
                type="button"
                className="slick-arrow pro-arrow-btn"
                aria-label="다음"
              >
                <Icon name="chevron-right" size="md" />
              </button>
            </div>
          </div>
        </div>

        <div className="pro_contents">
          <Swiper
            modules={[Navigation]}
            slidesPerView={1}
            spaceBetween={0}
            centeredSlides={false}
            onBeforeInit={bindNavigation}
            onInit={bindNavigation}
            breakpoints={{
              601: {
                slidesPerView: 1,
                centeredSlides: true,
              },
              901: {
                slidesPerView: 3,
                centeredSlides: false,
              },
            }}
            className="pro_slick"
            watchSlidesProgress
          >
            {projects.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="pro_con">
                  <Link to={`/bbs/board.php?bo_table=project&wr_id=${item.id}`}>
                    <div className="pro_con_img">
                      <img
                        src={mainThumb(item.image)}
                        alt={item.title}
                      />
                    </div>
                    <p>{item.title}</p>
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
