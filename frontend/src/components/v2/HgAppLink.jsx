import { forwardRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { scrollToTopInstant } from "../../utils/scrollControl";

/**
 * 내부 페이지 이동 링크 — 도착 시 최상단을 즉시 고정
 * (html scroll-behavior: smooth 영향 제거)
 */
const HgAppLink = forwardRef(function HgAppLink(
  { to, onClick, replace, state, ...rest },
  ref
) {
  const navigate = useNavigate();

  return (
    <Link
      ref={ref}
      to={to}
      replace={replace}
      state={state}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== 0) return;

        event.preventDefault();
        navigate(to, { replace, state });
        scrollToTopInstant();
      }}
      {...rest}
    />
  );
});

export default HgAppLink;
