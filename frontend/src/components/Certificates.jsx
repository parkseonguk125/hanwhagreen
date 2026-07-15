import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import { certificates } from "../data/mock";
import styles from "./Certificates.module.css";
import "swiper/css";
import "swiper/css/navigation";

export default function Certificates() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section className={styles.certs}>
      <div className={`container ${styles.header}`}>
        <div>
          <p className={styles.brand}>한화그린</p>
          <h2 className="section-title">인증서 및 특허증</h2>
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
          slidesPerView={1.3}
          spaceBetween={20}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.5 },
            1280: { slidesPerView: 4 },
          }}
          className={styles.swiper}
        >
          {certificates.map((cert, i) => (
            <SwiperSlide key={cert.id}>
              <a href="#" className={styles.card}>
                <div
                  className={styles.thumb}
                  style={{
                    background: `linear-gradient(160deg, hsl(${200 + i * 15}, 25%, 88%), hsl(${200 + i * 15}, 30%, 75%))`,
                  }}
                >
                  <MdVerified className={styles.thumbIcon} />
                </div>
                <p className={styles.title}>{cert.title}</p>
              </a>
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
