import { useEffect, useLayoutEffect, useRef, useState } from "react";

const DURATION_MS = 400;
const EASING = "ease-in-out";

function animateHeight(el, opening, onComplete) {
  el.style.overflow = "hidden";

  if (opening) {
    el.style.display = "block";
    el.style.transition = "none";
    el.style.height = "0px";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = el.scrollHeight;
        el.style.transition = `height ${DURATION_MS}ms ${EASING}`;
        el.style.height = `${target}px`;

        const finish = (event) => {
          if (event.target !== el || event.propertyName !== "height") return;
          el.removeEventListener("transitionend", finish);
          el.style.height = "auto";
          el.style.overflow = "";
          el.style.transition = "";
          onComplete?.();
        };

        el.addEventListener("transitionend", finish);
      });
    });
    return;
  }

  const current = el.scrollHeight;
  el.style.transition = "none";
  el.style.height = `${current}px`;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.transition = `height ${DURATION_MS}ms ${EASING}`;
      el.style.height = "0px";

      const finish = (event) => {
        if (event.target !== el || event.propertyName !== "height") return;
        el.removeEventListener("transitionend", finish);
        el.style.display = "none";
        el.style.height = "";
        el.style.overflow = "";
        el.style.transition = "";
        onComplete?.();
      };

      el.addEventListener("transitionend", finish);
    });
  });
}

export default function SlideToggle({
  open,
  children,
  className = "",
  style = {},
  as: Tag = "div",
  onAnimationEnd,
}) {
  const contentRef = useRef(null);
  const openRef = useRef(open);
  const [render, setRender] = useState(open);

  useEffect(() => {
    openRef.current = open;
    if (open) setRender(true);
  }, [open]);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el || !render) return undefined;

    animateHeight(el, open, () => {
      if (!openRef.current) setRender(false);
      onAnimationEnd?.();
    });

    return undefined;
  }, [open, render, onAnimationEnd]);

  if (!render) return null;

  return (
    <Tag ref={contentRef} className={className} style={style}>
      {children}
    </Tag>
  );
}
