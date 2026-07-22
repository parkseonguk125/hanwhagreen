import { footerInfo, navGroups, topLinks } from "../../data/mock";
import { HgNavLink } from "./HgNavLink";

export default function HgDesktopMenu({ open, onClose }) {
  return (
    <div
      className={`hg-mega${open ? " is-open" : ""}`}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-label="전체 메뉴"
    >
      <div className="hg-mega__frame">
        <header className="hg-mega__bar">
          <p className="hg-mega__bar-title">전체 메뉴</p>
          <button type="button" className="hg-mega__close" onClick={onClose} aria-label="메뉴 닫기">
            <span>닫기</span>
            <i aria-hidden="true" />
          </button>
        </header>

        <div className="hg-mega__body">
          <aside className="hg-mega__aside">
            <p className="hg-mega__kicker">한화그린</p>
            <h2 className="hg-mega__headline">
              축산·도축 폐수처리와
              <br />
              액비순환·악취저감
            </h2>
            <p className="hg-mega__lede">
              현장에 맞는 정화 기술로 설비부터 운영까지 함께합니다.
            </p>
            <dl className="hg-mega__contacts">
              <div>
                <dt>{footerInfo.hq.label}</dt>
                <dd>
                  <a href={`tel:${footerInfo.hq.phone.replace(/-/g, "")}`}>{footerInfo.hq.phone}</a>
                </dd>
              </div>
              <div>
                <dt>{footerInfo.branch.label}</dt>
                <dd>
                  <a href={`tel:${footerInfo.branch.phone.replace(/-/g, "")}`}>
                    {footerInfo.branch.phone}
                  </a>
                </dd>
              </div>
            </dl>
          </aside>

          <nav className="hg-mega__sitemap" aria-label="사이트 메뉴">
            {navGroups.map((group) => (
              <section key={group.title} className="hg-mega__col">
                <h3 className="hg-mega__col-title">{group.title}</h3>
                <ul className="hg-mega__list">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <HgNavLink item={item} className="hg-mega__link" onNavigate={onClose}>
                        {item.label}
                      </HgNavLink>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>

        <footer className="hg-mega__foot">
          <div className="hg-mega__quick" aria-label="바로가기">
            {topLinks.map((link) => (
              <HgNavLink
                key={link.label}
                item={link}
                className="hg-mega__quick-link"
                onNavigate={onClose}
              >
                {link.label}
              </HgNavLink>
            ))}
          </div>
          <p className="hg-mega__address">{footerInfo.address}</p>
        </footer>
      </div>
    </div>
  );
}
