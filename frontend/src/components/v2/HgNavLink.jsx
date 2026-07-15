import { useNavigate } from "react-router-dom";
import { parseAppHref } from "../../utils/navRoutes";
import { preloadBannerForHref } from "../../utils/preloadImage";

export function HgNavLink({ item, className = "", onNavigate, children }) {
  const navigate = useNavigate();
  const target = parseAppHref(item.href);
  const label = children ?? item.label;

  if (target) {
    const href = `${target.pathname}${target.search}`;
    return (
      <a
        href={href}
        className={className}
        onMouseEnter={() => preloadBannerForHref(href)}
        onFocus={() => preloadBannerForHref(href)}
        onClick={(e) => {
          e.preventDefault();
          navigate(target);
          onNavigate?.();
        }}
      >
        {label}
      </a>
    );
  }

  return (
    <a href={item.href || "#"} className={className} onClick={(e) => e.preventDefault()}>
      {label}
    </a>
  );
}
