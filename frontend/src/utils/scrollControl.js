/**
 * TOP 스크롤 — HD현대중공업(hd-hhi.com)과 동일 패턴
 * Manager.scroll.animateTo(0, 0.8) ≈ GSAP 0.8초로 최상단 이동
 * @see https://hd-hhi.com/kr/main
 */

let bypassUntil = 0;
let topRaf = 0;
let settleTimer = 0;
let savedScrollBehavior = null;

/** HD: animateTo 기본 ease ≈ GSAP power1.out */
function easePower1Out(t) {
  return 1 - (1 - t) ** 1.7;
}

export function beginProgrammaticScroll(durationMs = 2800) {
  bypassUntil = Math.max(bypassUntil, performance.now() + durationMs);
}

export function isProgrammaticScrollActive() {
  return performance.now() < bypassUntil;
}

function lockCssSmoothScroll() {
  if (savedScrollBehavior !== null) return;
  const html = document.documentElement;
  savedScrollBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  html.classList.add("hg-scrolling-top");
}

function unlockCssSmoothScroll() {
  const html = document.documentElement;
  html.classList.remove("hg-scrolling-top");
  if (savedScrollBehavior === null) return;
  html.style.scrollBehavior = savedScrollBehavior;
  savedScrollBehavior = null;
}

function hardScrollTo(y) {
  lockCssSmoothScroll();
  const top = Math.max(0, y);
  try {
    window.scrollTo({ top, left: 0, behavior: "instant" });
  } catch {
    window.scrollTo(0, top);
  }
  document.documentElement.scrollTop = top;
  if (document.body) document.body.scrollTop = top;
}

function stopTopAnimation() {
  if (topRaf) {
    cancelAnimationFrame(topRaf);
    topRaf = 0;
  }
  if (settleTimer) {
    window.clearTimeout(settleTimer);
    settleTimer = 0;
  }
}

function readScrollY() {
  return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
}

function notifyScrollEffectsResume() {
  window.dispatchEvent(new CustomEvent("hg:scroll-top-end"));
}

/** HD: animateTo(0, 0.8) — 0.8초에 최상단으로 확 이동 */
const HD_TOP_DURATION_SEC = 0.8;

/**
 * 히어로(문서 맨 위)로 이동 — HD현대중공업 top-button 동작과 동일
 */
export function scrollToPageTop() {
  stopTopAnimation();
  lockCssSmoothScroll();

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const startY = readScrollY();

  document.querySelector(".hg-top-btn")?.classList.add("is-active");

  if (startY <= 1) {
    hardScrollTo(0);
    beginProgrammaticScroll(600);
    settleTimer = window.setTimeout(() => {
      document.querySelector(".hg-top-btn")?.classList.remove("is-active");
      unlockCssSmoothScroll();
      notifyScrollEffectsResume();
      settleTimer = 0;
    }, 200);
    return;
  }

  if (reduced) {
    beginProgrammaticScroll(1000);
    hardScrollTo(0);
    settleTimer = window.setTimeout(() => {
      hardScrollTo(0);
      document.querySelector(".hg-top-btn")?.classList.remove("is-active");
      unlockCssSmoothScroll();
      notifyScrollEffectsResume();
      settleTimer = 0;
    }, HD_TOP_DURATION_SEC * 1000);
    return;
  }

  const durationMs = HD_TOP_DURATION_SEC * 1000;
  const startedAt = performance.now();
  beginProgrammaticScroll(durationMs + 2000);

  const finish = () => {
    topRaf = 0;
    hardScrollTo(0);
    beginProgrammaticScroll(1200);

    let guard = 0;
    const pin = () => {
      hardScrollTo(0);
      beginProgrammaticScroll(400);
      guard += 1;
      if (guard < 10) {
        topRaf = requestAnimationFrame(pin);
        return;
      }
      topRaf = 0;
      document.querySelector(".hg-top-btn")?.classList.remove("is-active");
      settleTimer = window.setTimeout(() => {
        hardScrollTo(0);
        unlockCssSmoothScroll();
        notifyScrollEffectsResume();
        settleTimer = 0;
      }, 120);
    };
    topRaf = requestAnimationFrame(pin);
  };

  const tick = (now) => {
    beginProgrammaticScroll(1200);
    const t = Math.min(1, (now - startedAt) / durationMs);
    const nextY = startY * (1 - easePower1Out(t));
    hardScrollTo(nextY);

    if (t < 1 && readScrollY() > 0.5) {
      topRaf = requestAnimationFrame(tick);
      return;
    }
    finish();
  };

  tick(startedAt);
}
