import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icons";
import DesktopAllMenu from "./DesktopAllMenu";
import MobileMenu from "./MobileMenu";
import { assets, navGroups, topLinks } from "../data/mock";
import { logoutMember } from "../services/authApi";
import { clearAuth, getStoredMember, isLoggedIn } from "../services/authAccess";
import { parseAppHref } from "../utils/navRoutes";
import { preloadBannerForHref } from "../utils/preloadImage";

const MOBILE_MENU_BREAKPOINT = 1024;

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.innerWidth <= MOBILE_MENU_BREAKPOINT
      : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_MENU_BREAKPOINT}px)`
    );
    const sync = () => setIsMobile(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

function AppNavLink({ item, className, onNavigate, onAfterNavigate }) {
  const navigate = useNavigate();
  const target = parseAppHref(item.href);

  if (target) {
    const href = `${target.pathname}${target.search}`;

    return (
      <a
        href={href}
        className={className}
        onMouseEnter={() => preloadBannerForHref(href)}
        onFocus={() => preloadBannerForHref(href)}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          navigate(target);
          onNavigate?.();
          onAfterNavigate?.();
        }}
      >
        {item.label}
      </a>
    );
  }

  return (
    <a
      href={item.href || "#"}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {item.label}
    </a>
  );
}

export default function Header({ hideHamburger = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [expandedMobileGroup, setExpandedMobileGroup] = useState(null);
  const [member, setMember] = useState(() => getStoredMember());
  const [loggingOut, setLoggingOut] = useState(false);
  const isMobileViewport = useIsMobileViewport();

  useEffect(() => {
    setMember(isLoggedIn() ? getStoredMember() : null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    setMenuOpen(false);
    setExpandedMobileGroup(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    setMenuOpen(false);
    setExpandedMobileGroup(null);
  }, [isMobileViewport]);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    closeHoverMenu();
    closeMenu();

    try {
      await logoutMember();
    } catch {
      /* ignore */
    }

    clearAuth();
    setMember(null);

    navigate(0);
  };

  useEffect(() => {
    if (hideHamburger && menuOpen) {
      setMenuOpen(false);
      setExpandedMobileGroup(null);
    }
  }, [hideHamburger, menuOpen]);

  const handleMenuEnter = (index) => {
    if (window.innerWidth > 1024) {
      setHoveredMenu(index);
    }
  };

  const handleNavLeave = (event) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }
    setHoveredMenu(null);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setExpandedMobileGroup(null);
  };
  const closeHoverMenu = () => setHoveredMenu(null);

  const toggleMobileGroup = (index) => {
    setExpandedMobileGroup((prev) => (prev === index ? null : index));
  };

  const handleTopLinkClick = (event, target) => {
    event.preventDefault();
    navigate(target);
    closeHoverMenu();
  };

  const openMenu = () => {
    setMenuOpen(true);
    setExpandedMobileGroup(null);
  };

  return (
    <>
      <header id="header">
        <div className="inner">
          <div className="inner-top">
            <ul className="tp_link">
              {topLinks.map((link) => {
                const target = parseAppHref(link.href);
                return (
                  <li key={link.label}>
                    {target ? (
                      <a
                        href={`${target.pathname}${target.search}`}
                        onClick={(event) => handleTopLinkClick(event, target)}
                      >
                        <Icon name={link.icon} size="sm" />
                        <p>{link.label}</p>
                      </a>
                    ) : (
                      <a href={link.href} onClick={(event) => event.preventDefault()}>
                        <Icon name={link.icon} size="sm" />
                        <p>{link.label}</p>
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="logo-brand">
              <div className="logo">
                <Link to="/" onClick={closeHoverMenu}>
                  <img src={assets.logoBlack} alt="한화그린" />
                </Link>
              </div>
              <span className="clone-coding-badge">클론 코딩 작업</span>
            </div>
            <div className="userBox">
              <ul>
                <li>
                  {member ? (
                    <>
                      <span className="header-user-name">
                        <Icon name="lock" size="sm" className="login-icon" />{" "}
                        {member.name || member.id}님
                      </span>
                      <button
                        type="button"
                        className="header-logout-btn"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        aria-busy={loggingOut}
                      >
                        {loggingOut ? "로그아웃 중…" : "로그아웃"}
                      </button>
                    </>
                  ) : (
                    <Link to="/bbs/login.php" onClick={closeHoverMenu}>
                      <Icon name="lock" size="sm" className="login-icon" /> 로그인
                    </Link>
                  )}
                </li>
              </ul>
              {!hideHamburger && (
                <button
                  type="button"
                  className="hamburger"
                  aria-label="전체 메뉴"
                  aria-expanded={menuOpen}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openMenu();
                  }}
                >
                  <span className="ham_line" />
                  <span className="ham_line" />
                  <span className="ham_line" />
                </button>
              )}
            </div>
          </div>

          <div className="header-nav-wrap" onMouseLeave={handleNavLeave}>
            <div id="nav">
              <nav>
                <ul className="menu_ul">
                  {navGroups.map((group, index) => (
                    <li
                      key={group.title}
                      className={`menu_li gnb_al_li_plus${
                        hoveredMenu === index ? " is-active" : ""
                      }`}
                      style={{ zIndex: 999 - index }}
                      onMouseEnter={() => handleMenuEnter(index)}
                    >
                      <a href="#" className="menu_tit" onClick={(event) => event.preventDefault()}>
                        {group.title}
                      </a>
                      <div
                        className={`gnb_box${hoveredMenu === index ? " is-open" : ""}`}
                        onMouseEnter={() => handleMenuEnter(index)}
                      >
                        <div className="inner">
                          <ul className="gnb_ul">
                            {group.items.map((item) => (
                              <li key={item.label} className="gnb_li">
                                <AppNavLink
                                  item={item}
                                  className="gnb_a"
                                  onAfterNavigate={closeHoverMenu}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="clearfix" />
              </nav>
            </div>
            <div
              className={`gnb_box_back${hoveredMenu !== null ? " is-visible" : ""}`}
              aria-hidden="true"
            />
          </div>
        </div>
      </header>

      {!hideHamburger && isMobileViewport ? (
        <MobileMenu
          open={menuOpen}
          expandedIndex={expandedMobileGroup}
          onClose={closeMenu}
          onToggleGroup={toggleMobileGroup}
        />
      ) : null}
      {!hideHamburger && !isMobileViewport ? (
        <DesktopAllMenu open={menuOpen} onClose={closeMenu} />
      ) : null}
    </>
  );
}
