import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Icon from "./Icons";
import styles from "./MobileMenu.module.css";
import { assets, navGroups } from "../data/mock";
import { parseAppHref } from "../utils/navRoutes";

function MenuLink({ item, className, onClose }) {
  const navigate = useNavigate();
  const target = parseAppHref(item.href);

  if (target) {
    const href = `${target.pathname}${target.search}`;
    return (
      <a
        href={href}
        className={className}
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
      className={className}
      onClick={(event) => event.preventDefault()}
    >
      {item.label}
    </a>
  );
}

export default function MobileMenu({
  open,
  expandedIndex,
  onClose,
  onToggleGroup,
}) {
  useEffect(() => {
    document.body.classList.toggle("hg-mobile-menu-open", open);

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
      className={`${styles.overlay}${open ? ` ${styles.overlayOpen}` : ""}`}
      aria-hidden={!open}
    >
      <div
        className={styles.panel}
        role="dialog"
        aria-modal={open}
        aria-label="전체 메뉴"
        aria-hidden={!open}
      >
        <div className={styles.header}>
          <img src={assets.logoWhite} alt="한화그린" />
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="메뉴 닫기"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <ul className={styles.nav}>
          {navGroups.map((group, index) => (
            <li
              key={group.title}
              className={`${styles.item}${
                expandedIndex === index ? ` ${styles.itemExpanded}` : ""
              }`}
            >
              <button
                type="button"
                className={styles.trigger}
                aria-expanded={expandedIndex === index}
                onClick={() => onToggleGroup(index)}
              >
                <span className={styles.triggerLabel}>{group.title}</span>
                <Icon name="chevron-down" size="sm" className={styles.triggerIcon} />
              </button>
              <ul className={styles.sublist}>
                {group.items.map((item) => (
                  <li key={item.label} className={styles.subitem}>
                    <MenuLink item={item} className={styles.link} onClose={onClose} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body
  );
}
