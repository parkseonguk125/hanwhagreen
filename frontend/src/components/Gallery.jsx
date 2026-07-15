import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { galleryItems } from "../data/mock";
import styles from "./Gallery.module.css";
import "swiper/css";
import "swiper/css/navigation";

export default function Gallery() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section className={styles.gallery}>
      <div className={`container ${styles.header}`}>
        <div className={styles.headerText}>
          <h2 className="section-title">한화그린 주요실적</h2>
          <p className="section-subtitle">주요실적 현황</p>
        </div>
        <a href="#" className="btn-circle dark" aria-label="자세히 보기">
          <HiOutlineArrowRight size={20} />
        </a>
      </div>

      <div className={styles.sliderWrap}>
        <button
          ref={prevRef}
          type="button"
          className={styles.arrow}
          aria-label="이전"
        >
          <HiOutlineArrowLeft size={20} />
        </button>

        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          slidesPerView={1.2}
          spaceBetween={16}
          breakpoints={{
            640: { slidesPerView: 2.2, spaceBetween: 20 },
            1024: { slidesPerView: 3.5, spaceBetween: 24 },
            1280: { slidesPerView: 4.2, spaceBetween: 24 },
          }}
          className={styles.swiper}
        >
          {galleryItems.map((item) => (
            <SwiperSlide key={item.id}>
              <figure className={styles.slide}>
                <div
                  className={styles.placeholder}
                  style={{
                    background: `linear-gradient(145deg, hsl(${item.hue}, 45%, 28%), hsl(${item.hue + 20}, 50%, 42%))`,
                  }}
                />
                <figcaption className={styles.caption}>
                  <span>{item.title}</span>
                </figcaption>
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          ref={nextRef}
          type="button"
          className={styles.arrow}
          aria-label="다음"
        >
          <HiOutlineArrowRight size={20} />
        </button>
      </div>
    </section>
  );
}
