import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { assets, navGroups } from "../data/mock";
import { parseAppHref } from "../utils/navRoutes";

function AllMenuLink({ item, onClose }) {
  const navigate = useNavigate();
  const target = parseAppHref(item.href);

  if (target) {
    const href = `${target.pathname}${target.search}`;
    return (
      <a
        href={href}
        className="all_tit"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          navigate(target);
          onClose();
        }}
      >
        {item.label}
      </a>
    );
  }

  return (
    <a
      href={item.href || "#"}
      className="all_tit"
      onClick={(event) => event.preventDefault()}
    >
      {item.label}
    </a>
  );
}

export default function DesktopAllMenu({ open, onClose }) {
  useEffect(() => {
    document.body.classList.toggle("nav-all-open", open);

    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      id="nav_all"
      className={open ? "active" : ""}
      aria-hidden={!open}
      onClick={onClose}
    >
      <div
        id="all_menu"
        className={open ? "active" : ""}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="nav_all_logo">
          <img src={assets.logoWhite} alt="한화그린" />
        </div>
        <ul className="menu_ul">
          {navGroups.map((group, index) => (
            <li
              key={group.title}
              className="menu_li gnb_al_li_plus"
              style={{ zIndex: 999 - index }}
            >
              <span className="menu_tit">{group.title}</span>
              <div className="all_box">
                <ul className="all_ul">
                  {group.items.map((item) => (
                    <li key={item.label} className="all_li">
                      <AllMenuLink item={item} onClose={onClose} />
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="all_menu_close"
          aria-label="메뉴 닫기"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>,
    document.body
  );
}
