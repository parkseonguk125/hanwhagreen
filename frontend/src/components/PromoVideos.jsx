import { BsPlayCircle } from "react-icons/bs";
import { promoVideos } from "../data/mock";
import styles from "./PromoVideos.module.css";

export default function PromoVideos() {
  return (
    <section className={styles.promo}>
      <div className="container">
        <h2 className={styles.heading}>홍보영상</h2>
        <ul className={styles.list}>
          {promoVideos.map((video, i) => (
            <li key={video.id}>
              <a href="#" className={styles.card}>
                <div
                  className={styles.thumb}
                  style={{
                    background: `linear-gradient(135deg, hsl(${130 + i * 20}, 40%, 25%), hsl(${130 + i * 20}, 45%, 40%))`,
                  }}
                >
                  <BsPlayCircle className={styles.playIcon} />
                </div>
                <p className={styles.title}>{video.title}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
