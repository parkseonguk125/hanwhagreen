import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../Icons";
import SlideToggle from "../common/SlideToggle";
import { allSubMenus, parseAppHref, subNavGroups } from "../../utils/navRoutes";
import { preloadBannerForHref } from "../../utils/preloadImage";

function NavItemLink({ item, className = "" }) {
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
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          navigate(target);
        }}
      >
        {item.label ? item.label : <span>{item.title}</span>}
      </a>
    );
  }
  return (
    <a href={item.href || "#"} className={className} onClick={(e) => e.preventDefault()}>
      {item.label ? item.label : <span>{item.title}</span>}
    </a>
  );
}

function NavDropdown({ title, children, className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`navi ${className}`.trim()}
      onClick={() => setOpen((prev) => !prev)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen((prev) => !prev);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <p className="tit">{title}</p>
      <SlideToggle
        open={open}
        className={`slide${open ? " on is-open" : ""}`}
      >
        {children}
      </SlideToggle>
      <div className={`navi_btn${open ? " on" : ""}`} aria-hidden="true">
        <span>
          <Icon
            name={open ? "chevron-up" : "chevron-down"}
            size="lg"
            className="navi-arrow-icon"
          />
        </span>
      </div>
    </div>
  );
}

export function SubNavigation({ parentTitle = "고객센터", currentTitle, navGroupIndex = 4 }) {
  return (
    <div id="navigation">
      <div className="inner">
        <div id="navi_home">
          <Link to="/">
            <Icon name="home" size="lg" className="navi-home-icon" />
          </Link>
        </div>

        <NavDropdown title={parentTitle} className="navi1">
          <ul>
            {subNavGroups.map((group) => (
              <li key={group.title}>
                <NavItemLink item={group} />
              </li>
            ))}
          </ul>
        </NavDropdown>

        <NavDropdown title={currentTitle} className="navi2">
          <div id="mysubmenu">
            {allSubMenus.map((items, index) => (
              <ul
                key={index}
                id={`mysub${index}`}
                style={{ display: index === navGroupIndex ? "block" : "none" }}
              >
                {items.map((item) => (
                  <li key={item.label} className="leftmenu_s">
                    <NavItemLink item={item} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </NavDropdown>
      </div>
    </div>
  );
}

export function SubVisual({ title, bannerUrl, subtitle, bannerAsBackground = false }) {
  return (
    <section className={`visual${bannerAsBackground ? " visual-bg" : ""}`}>
      <img
        className="visual-banner-img"
        src={bannerUrl}
        alt=""
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      <div className="text_box">
        <h2>{title}</h2>
        {subtitle ? <p className="text">{subtitle}</p> : <p className="text" />}
      </div>
    </section>
  );
}

export default function SubLayout({
  pageId,
  pageClassName = "",
  title,
  bannerUrl,
  visualSubtitle,
  bannerAsBackground = false,
  currentNavTitle,
  navGroupIndex = 4,
  parentTitle,
  children,
}) {
  const resolvedParentTitle =
    parentTitle ?? subNavGroups[navGroupIndex]?.title ?? "고객센터";

  return (
    <div className={`sub${pageClassName ? ` ${pageClassName}` : ""}`} id={pageId}>
      <SubVisual
        title={title}
        bannerUrl={bannerUrl}
        subtitle={visualSubtitle}
        bannerAsBackground={bannerAsBackground}
      />
      <SubNavigation
        parentTitle={resolvedParentTitle}
        currentTitle={currentNavTitle}
        navGroupIndex={navGroupIndex}
      />
      {children}
    </div>
  );
}
