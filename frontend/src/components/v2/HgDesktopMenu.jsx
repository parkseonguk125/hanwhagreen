import { assets, navGroups, topLinks } from "../../data/mock";
import { HgNavLink } from "./HgNavLink";

export default function HgDesktopMenu({ open, onClose }) {
  return (
    <div className={`hg-mega${open ? " is-open" : ""}`} aria-hidden={!open}>
      <button type="button" className="hg-mega__close" onClick={onClose} aria-label="메뉴 닫기">
        CLOSE
      </button>
      <div className="hg-mega__inner">
        <div className="hg-mega__brand">
          <img src={assets.logoWhite} alt="한화그린" />
          <p>환경을 우선으로, 최적화된 정화기술을 제시합니다.</p>
        </div>
        <div className="hg-mega__content">
          <div className="hg-mega__grid">
            {navGroups.map((group) => (
              <div key={group.title}>
                <p className="hg-mega__group-title">{group.title}</p>
                {group.items.map((item) => (
                  <HgNavLink
                    key={item.label}
                    item={item}
                    className="hg-mega__link"
                    onNavigate={onClose}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="hg-mega__quick">
            {topLinks.map((link) => (
              <HgNavLink
                key={link.label}
                item={link}
                className="hg-mega__quick-link"
                onNavigate={onClose}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
