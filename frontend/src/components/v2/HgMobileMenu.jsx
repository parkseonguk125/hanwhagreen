import { useState } from "react";
import { footerInfo, navGroups, topLinks } from "../../data/mock";
import { HgNavLink } from "./HgNavLink";
import HgAppLink from "./HgAppLink";

export default function HgMobileMenu({
  open,
  onClose,
  member = null,
  onLogout,
  loggingOut = false,
}) {
  const [expanded, setExpanded] = useState(0);

  return (
    <div
      className={`hg-drawer${open ? " is-open" : ""}`}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-label="전체 메뉴"
    >
      <div className="hg-drawer__backdrop" onClick={onClose} />
      <div className="hg-drawer__panel">
        <div className="hg-drawer__head">
          <div className="hg-drawer__head-copy">
            <p className="hg-drawer__kicker">한화그린</p>
            <p className="hg-drawer__title">전체 메뉴</p>
          </div>
          <button type="button" className="hg-drawer__close" onClick={onClose} aria-label="닫기">
            <span>닫기</span>
            <i aria-hidden="true" />
          </button>
        </div>

        <div className="hg-drawer__body">
          {navGroups.map((group, index) => {
            const isOpen = expanded === index;
            return (
              <div key={group.title} className={`hg-drawer__group${isOpen ? " is-open" : ""}`}>
                <button
                  type="button"
                  className="hg-drawer__group-btn"
                  onClick={() => setExpanded(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span>{group.title}</span>
                  <i aria-hidden="true" />
                </button>
                {isOpen && (
                  <div className="hg-drawer__sub">
                    {group.items.map((item) => (
                      <HgNavLink key={item.label} item={item} onNavigate={onClose}>
                        {item.label}
                      </HgNavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="hg-drawer__quick">
            {topLinks.map((link) => (
              <HgNavLink key={link.label} item={link} onNavigate={onClose}>
                {link.label}
              </HgNavLink>
            ))}
          </div>

          <dl className="hg-drawer__contacts">
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
        </div>

        <div className="hg-drawer__auth">
          {member ? (
            <>
              <p className="hg-drawer__auth-user">
                <strong>{member.name || member.id}</strong>님 로그인 중
              </p>
              <button
                type="button"
                className="hg-drawer__auth-btn hg-drawer__auth-btn--ghost"
                onClick={async () => {
                  await onLogout?.();
                  onClose?.();
                }}
                disabled={loggingOut}
              >
                {loggingOut ? "로그아웃 중…" : "로그아웃"}
              </button>
            </>
          ) : (
            <HgAppLink
              to="/bbs/login.php"
              className="hg-drawer__auth-btn hg-drawer__auth-btn--primary"
              onClick={onClose}
            >
              로그인
            </HgAppLink>
          )}
        </div>
      </div>
    </div>
  );
}
