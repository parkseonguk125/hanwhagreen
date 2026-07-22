import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { navGroups } from "../../data/mock";
import { logoutMember } from "../../services/authApi";
import { clearAuth, getStoredMember, isLoggedIn } from "../../services/authAccess";
import { parseAppHref } from "../../utils/navRoutes";
import { HgNavLink } from "./HgNavLink";
import HgAppLink from "./HgAppLink";
import HgMobileMenu from "./HgMobileMenu";
import HgDesktopMenu from "./HgDesktopMenu";
import HgLogo from "./HgLogo";
import { useHgHeaderAutoHide, useHgScrollY, useHgViewport } from "./hooks";

function isNavGroupActive(group, pathname, search) {
  const current = `${pathname}${search}`;
  return group.items.some((item) => {
    const target = parseAppHref(item.href);
    if (!target) return false;
    return current === `${target.pathname}${target.search}`;
  });
}

export default function HgHeader({ hideHamburger = false, stableLogo = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const scrolledRaw = useHgScrollY(20);
  const scrolled = stableLogo ? false : scrolledRaw;
  const { isMobile } = useHgViewport();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openNav, setOpenNav] = useState(null);
  const [member, setMember] = useState(() => getStoredMember());
  const [loggingOut, setLoggingOut] = useState(false);

  const isHome = location.pathname === "/";
  const isHero = isHome && !scrolled;
  const activeGroupIndex = useMemo(
    () =>
      navGroups.findIndex((group) =>
        isNavGroupActive(group, location.pathname, location.search)
      ),
    [location.pathname, location.search]
  );
  const megaOpen = !isMobile && openNav !== null;
  const headerWrapRef = useRef(null);
  useHgHeaderAutoHide({
    disabled: true,
    heroAware: isHome && !isMobile,
    wrapRef: headerWrapRef,
  });

  useEffect(() => {
    setMember(isLoggedIn() ? getStoredMember() : null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    setMenuOpen(false);
    setOpenNav(null);
  }, [location.pathname, location.search, isMobile]);

  useEffect(() => {
    if (hideHamburger && menuOpen) setMenuOpen(false);
  }, [hideHamburger, menuOpen]);

  useEffect(() => {
    document.body.classList.toggle("hg-nav-open", megaOpen || menuOpen);
    return () => document.body.classList.remove("hg-nav-open");
  }, [megaOpen, menuOpen]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logoutMember();
    } catch {
      /* ignore */
    }
    clearAuth();
    setMember(null);
    navigate(0);
  };

  const closeMegaMenu = () => {
    if (!isMobile) setOpenNav(null);
  };

  const handleHeaderMouseLeave = (event) => {
    const related = event.relatedTarget;
    if (related instanceof Element && related.closest(".hg-header__mega-panel")) return;
    closeMegaMenu();
  };

  const handleMegaMouseLeave = (event) => {
    const related = event.relatedTarget;
    if (related instanceof Element && related.closest(".hg-header__nav")) return;
    closeMegaMenu();
  };

  const logoVariant = isHero && !scrolled && !megaOpen ? "light" : "dark";

  return (
    <>
      <div
        ref={headerWrapRef}
        className={`hg-header-wrap${scrolled ? " is-scrolled" : ""}${isHero ? " is-hero" : ""}${megaOpen ? " is-mega-open" : ""}`}
      >
        {!isMobile && (
          <div
            className="hg-header__backdrop"
            aria-hidden={!megaOpen}
          />
        )}

        <header className="hg-header" onMouseLeave={handleHeaderMouseLeave}>
          <div className="hg-header__inner">
            <div className="hg-header__cluster">
              <Link
                to="/"
                className="hg-header__logo"
                onClick={(event) => {
                  setOpenNav(null);
                  /* 이미 메인 홈이면 SPA 이동이 무시되므로 새로고침으로 최상단 홈을 다시 표시 */
                  if (isHome) {
                    event.preventDefault();
                    window.location.reload();
                  }
                }}
              >
                <HgLogo variant={logoVariant} />
              </Link>

              <nav className="hg-header__nav" aria-label="주 메뉴">
              {navGroups.map((group, index) => {
                const isActive = activeGroupIndex === index;
                const isOpen = openNav === index;
                return (
                  <div
                    key={group.title}
                    className={`hg-header__nav-item${isOpen ? " is-open" : ""}${isActive ? " is-active" : ""}`}
                    onMouseEnter={() => !isMobile && setOpenNav(index)}
                    onFocus={() => !isMobile && setOpenNav(index)}
                  >
                    <button
                      type="button"
                      className="hg-header__nav-link"
                      aria-expanded={isOpen}
                      aria-controls="hg-header-mega-menu"
                      onClick={() => setOpenNav(isOpen ? null : index)}
                    >
                      <span>{group.title}</span>
                    </button>
                  </div>
                );
              })}
            </nav>
            </div>

            <div className="hg-header__actions">
              <div className="hg-header__user">
                {member ? (
                  <>
                    <span className="hg-header__user-name">{member.name || member.id}님</span>
                    <button
                      type="button"
                      className="hg-header__logout"
                      onClick={handleLogout}
                      disabled={loggingOut}
                    >
                      {loggingOut ? "로그아웃 중…" : "로그아웃"}
                    </button>
                  </>
                ) : (
                  <HgAppLink to="/bbs/login.php" className="hg-header__login">
                    로그인
                  </HgAppLink>
                )}
              </div>

              {!hideHamburger && (
                <button
                  type="button"
                  className={`hg-header__menu-btn${menuOpen ? " is-open" : ""}`}
                  aria-label="전체 메뉴"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <span className="hg-header__menu-label">MENU</span>
                  <span className="hg-header__menu-icon" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
              )}
            </div>
          </div>
        </header>

        {!isMobile && (
          <div
            id="hg-header-mega-menu"
            className="hg-header__mega-panel"
            aria-hidden={!megaOpen}
            onMouseLeave={handleMegaMouseLeave}
          >
            <div className="hg-header__mega-inner">
              <div className="hg-header__mega-intro">
                <p className="hg-header__mega-eyebrow">HANWHA GREEN</p>
                <h2 className="hg-header__mega-title">한화그린</h2>
                <p className="hg-header__mega-desc">
                  환경을 우선으로 현장에 맞는 정화기술을 제시합니다.
                </p>
              </div>
              <div className="hg-header__mega-groups">
                {navGroups.map((group, groupIndex) => (
                  <section
                    key={group.title}
                    className={`hg-header__mega-group${openNav === groupIndex ? " is-current" : ""}`}
                    style={{ "--hg-mega-stagger": `${groupIndex * 45}ms` }}
                    aria-labelledby={`hg-header-mega-title-${groupIndex}`}
                  >
                    <h2
                      id={`hg-header-mega-title-${groupIndex}`}
                      className="hg-header__mega-group-title"
                    >
                      {group.title}
                    </h2>
                    <div className="hg-header__mega-links">
                      {group.items.map((item) => (
                        <HgNavLink
                          key={item.label}
                          item={item}
                          className="hg-header__mega-link"
                          onNavigate={() => setOpenNav(null)}
                        >
                          <span className="hg-header__mega-link-label">{item.label}</span>
                          <span className="hg-header__mega-link-arrow" aria-hidden="true">
                            →
                          </span>
                        </HgNavLink>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {!hideHamburger && isMobile ? (
        <HgMobileMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          member={member}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />
      ) : null}
      {!hideHamburger && !isMobile ? (
        <HgDesktopMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      ) : null}
    </>
  );
}
