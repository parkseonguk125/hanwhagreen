import { HiOutlineArrowRight } from "react-icons/hi";
import { MdBusiness, MdBarChart, MdEngineering } from "react-icons/md";
import { introCards } from "../data/mock";
import styles from "./Intro.module.css";

const iconMap = {
  building: MdBusiness,
  chart: MdBarChart,
  gear: MdEngineering,
};

export default function Intro() {
  return (
    <section className={styles.intro}>
      <CopyBlock />
      <p className={styles.quickLinks}>
        <span>회사소개</span>
        <span className={styles.divider}>·</span>
        <span>공사실적</span>
        <span className={styles.divider}>·</span>
        <span>보유기술</span>
      </p>
      <div className={`container ${styles.cards}`}>
        {introCards.map((card) => {
          const Icon = iconMap[card.icon];
          return (
            <article key={card.title} className={styles.card}>
              <div className={styles.cardIcon}>
                <Icon size={48} />
              </div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDesc}>
                {card.desc.split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </p>
              <a href={card.href} className={styles.cardLink}>
                자세히 보기
                <HiOutlineArrowRight />
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CopyBlock() {
  return (
    <div className={`container ${styles.copy}`}>
      <p className={styles.copyLine}>한화그린은</p>
      <p className={styles.copyLine}>녹색환경의 선두주자로서</p>
      <p className={styles.copyLine}>지속적으로 성장하는 벤처기업입니다.</p>
    </div>
  );
}
