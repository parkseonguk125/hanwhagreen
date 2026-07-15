import { notices } from "../data/mock";
import styles from "./Notice.module.css";

export default function Notice() {
  return (
    <section className={styles.notice} id="notice">
      <div className="container">
        <h2 className={styles.heading}>공지사항</h2>
        <ul className={styles.list}>
          {notices.map((item) => (
            <li key={item.id}>
              <a href="#" className={styles.item}>
                <strong>{item.title}</strong>
                <span className={styles.date}>{item.date}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
