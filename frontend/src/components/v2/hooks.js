import { useEffect, useRef, useState } from "react";
import { isProgrammaticScrollActive } from "../../utils/scrollControl";

export const HG_MOBILE_BREAKPOINT = 1024;

/** sticky pin / wheel lock / 강제 snap — 홈·서브 모두 네이티브 스크롤만 사용 */
export const HG_SCROLL_JACK_ENABLED = false;

export function useHgViewport() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= HG_MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${HG_MOBILE_BREAKPOINT}px)`);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return { isMobile, breakpoint: HG_MOBILE_BREAKPOINT };
}

export function useHgScrollY(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    let last = window.scrollY > threshold;

    const apply = () => {
      ticking = false;
      const next = window.scrollY > threshold;
      if (next !== last) {
        last = next;
        setScrolled(next);
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

const HG_HEADER_HIDE_DELTA = 8;
const HG_HEADER_SHOW_DELTA = 8;
const HG_HEADER_HIDE_DELTA_MOBILE = 16;
const HG_HEADER_SHOW_DELTA_MOBILE = 20;
const HG_HEADER_TOP_REVEAL = 48;
const HG_HEADER_HIDE_START = 72;
const HG_HEADER_HERO_HIDE_PROGRESS = 0.38;

function getHeroScrollProgress() {
  const heroScroll = document.querySelector(".hg-hero-scroll");
  if (!heroScroll) return null;

  const raw = Number.parseFloat(
    getComputedStyle(heroScroll).getPropertyValue("--hg-hero-progress")
  );

  if (Number.isFinite(raw)) return Math.max(0, Math.min(raw, 1));

  const range = heroScroll.offsetHeight - window.innerHeight;
  if (range <= 0) return 1;

  const scrolled = Math.min(
    Math.max(window.scrollY - heroScroll.offsetTop, 0),
    range
  );

  return scrolled / range;
}

/**
 * Hide/show header via classList (no React state) so scroll-up reveal
 * does not re-render the whole header tree and stutter on mobile.
 */
export function useHgHeaderAutoHide({
  disabled = false,
  heroAware = false,
  wrapRef = null,
} = {}) {
  const lastScrollY = useRef(0);
  const hiddenRef = useRef(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef?.current ?? document.querySelector(".hg-header-wrap");

    const applyHidden = (isHidden) => {
      hiddenRef.current = isHidden;
      wrap?.classList.toggle("is-hidden", isHidden);
      document.documentElement.classList.toggle("hg-header-hidden", isHidden);
    };

    const revealHeader = () => {
      if (!hiddenRef.current) return;
      applyHidden(false);
    };

    if (disabled) {
      revealHeader();
      return undefined;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia(`(max-width: ${HG_MOBILE_BREAKPOINT}px)`);

    const update = () => {
      tickingRef.current = false;

      if (motionQuery.matches) {
        revealHeader();
        return;
      }

      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      const isMobile = mobileQuery.matches;
      const hideDelta = isMobile ? HG_HEADER_HIDE_DELTA_MOBILE : HG_HEADER_HIDE_DELTA;
      const showDelta = isMobile ? HG_HEADER_SHOW_DELTA_MOBILE : HG_HEADER_SHOW_DELTA;
      /* Mobile home uses hg-m-hero (no pin scroll) — skip getComputedStyle cost */
      const heroProgress = heroAware && !isMobile ? getHeroScrollProgress() : null;
      let nextHidden = hiddenRef.current;

      if (currentY <= HG_HEADER_TOP_REVEAL) {
        nextHidden = false;
      } else if (
        heroProgress !== null &&
        heroProgress < HG_HEADER_HERO_HIDE_PROGRESS
      ) {
        nextHidden = false;
      } else if (delta > hideDelta && currentY > HG_HEADER_HIDE_START) {
        nextHidden = true;
      } else if (delta < -showDelta) {
        nextHidden = false;
      }

      lastScrollY.current = currentY;

      if (nextHidden !== hiddenRef.current) {
        applyHidden(nextHidden);
      }
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(update);
    };

    lastScrollY.current = window.scrollY;
    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    motionQuery.addEventListener("change", update);
    mobileQuery.addEventListener("change", update);

    return () => {
      window.removeEventListener("scroll", onScroll);
      motionQuery.removeEventListener("change", update);
      mobileQuery.removeEventListener("change", update);
      document.documentElement.classList.remove("hg-header-hidden");
      wrap?.classList.remove("is-hidden");
    };
  }, [disabled, heroAware, wrapRef]);
}

const HG_STICKY_SCROLL_LERP = 0.32;
const HG_STICKY_SCROLL_SETTLE = 0.002;

/* 히어로 축소 전용: 낮은 lerp로 휠 입력을 부드럽게 따라가고,
   smoothstep 이징으로 축소의 시작/끝을 완만하게 처리 */
const HG_HERO_SCROLL_LERP = 0.12;
const HG_HERO_SCROLL_SETTLE = 0.0008;
const easeHeroProgress = (p) => p * p * (3 - 2 * p);

export function useHgStickyScroll(scrollRef, progressVar = "--hg-sticky-progress", enabled = true) {
  useEffect(() => {
    if (!HG_SCROLL_JACK_ENABLED) return undefined;
    const zone = scrollRef.current;
    if (!zone || !enabled) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia(`(max-width: ${HG_MOBILE_BREAKPOINT}px)`);

    let frame = 0;
    let displayProgress = 0;

    const getTargetProgress = () => {
      if (motionQuery.matches || mobileQuery.matches) return 0;

      const range = zone.offsetHeight - window.innerHeight;
      if (range <= 0) return 0;

      const scrolled = Math.min(Math.max(-zone.getBoundingClientRect().top, 0), range);
      return scrolled / range;
    };

    const applyProgress = (progress) => {
      zone.style.setProperty(progressVar, easeHeroProgress(progress).toFixed(4));
      zone.classList.toggle("is-scrolled-through", progress >= 0.98);
    };

    const tick = () => {
      const target = getTargetProgress();
      const diff = target - displayProgress;

      if (Math.abs(diff) > HG_HERO_SCROLL_SETTLE) {
        displayProgress += diff * HG_HERO_SCROLL_LERP;
        applyProgress(displayProgress);
        frame = requestAnimationFrame(tick);
        return;
      }

      displayProgress = target;
      applyProgress(displayProgress);
    };

    const kick = () => {
      if (isProgrammaticScrollActive()) {
        /* TOP 스크롤 중: lerp 없이 현재 위치를 즉시 반영해 화면이 멈춰 보이지 않게 */
        cancelAnimationFrame(frame);
        displayProgress = getTargetProgress();
        applyProgress(displayProgress);
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };

    const onMotionChange = () => {
      displayProgress = getTargetProgress();
      kick();
    };

    const onTopEnd = () => {
      displayProgress = getTargetProgress();
      applyProgress(displayProgress);
    };

    motionQuery.addEventListener("change", onMotionChange);
    mobileQuery.addEventListener("change", onMotionChange);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    window.addEventListener("hg:scroll-top-end", onTopEnd);
    kick();

    return () => {
      cancelAnimationFrame(frame);
      motionQuery.removeEventListener("change", onMotionChange);
      mobileQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      window.removeEventListener("hg:scroll-top-end", onTopEnd);
      zone.style.removeProperty(progressVar);
      zone.classList.remove("is-scrolled-through");
    };
  }, [scrollRef, progressVar, enabled]);
}

export function useHgHeroScroll(scrollRef, enabled = true) {
  return useHgStickyScroll(scrollRef, "--hg-hero-progress", enabled);
}

/** intro: 전체화면 핀 후 연한 글자 표시 → 채움 → 유지 → keyword phases */
const HG_STORY_FILL_END = 0.3;
const HG_STORY_INTRO_END = 0.44;
const HG_STORY_PIN_TOLERANCE = 6;

export function useHgStoryVisionScroll(scrollRef, stageCount = 3) {
  const [progress, setProgress] = useState(0);
  const [introFill, setIntroFill] = useState(0);
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState("intro");
  const [introPinned, setIntroPinned] = useState(false);

  useEffect(() => {
    if (!HG_SCROLL_JACK_ENABLED) {
      setProgress(1);
      setIntroFill(1);
      setActive(0);
      setPhase("done");
      setIntroPinned(false);
      return undefined;
    }
    const zone = scrollRef.current;
    if (!zone || stageCount < 1) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia(`(max-width: ${HG_MOBILE_BREAKPOINT}px)`);
    let frame = 0;
    let display = 0;

    const isFullyPinned = () => {
      const rect = zone.getBoundingClientRect();
      return (
        rect.top <= HG_STORY_PIN_TOLERANCE &&
        rect.bottom >= window.innerHeight - HG_STORY_PIN_TOLERANCE
      );
    };

    const derive = (raw) => {
      if (motionQuery.matches || mobileQuery.matches) {
        setPhase("story");
        setActive(0);
        setIntroFill(1);
        setIntroPinned(false);
        return;
      }

      const pinned = isFullyPinned();
      setIntroPinned(pinned);

      /* 전체화면이 되기 전에는 채움 0(연한 글자만 준비). 핀 이후 스크롤로 채움 */
      const fill = !pinned
        ? 0
        : Math.min(Math.max(raw / HG_STORY_FILL_END, 0), 1);
      setIntroFill(fill);

      if (raw < HG_STORY_INTRO_END) {
        setPhase("intro");
        setActive(0);
        return;
      }

      setPhase("story");
      const story = Math.min(
        Math.max((raw - HG_STORY_INTRO_END) / (1 - HG_STORY_INTRO_END), 0),
        1
      );
      const index = Math.min(Math.floor(story * stageCount), stageCount - 1);
      setActive(index);
    };

    const getTarget = () => {
      if (motionQuery.matches || mobileQuery.matches) return 0;
      const range = zone.offsetHeight - window.innerHeight;
      if (range <= 0) return 0;
      const scrolled = Math.min(Math.max(-zone.getBoundingClientRect().top, 0), range);
      return scrolled / range;
    };

    const tick = () => {
      const target = getTarget();
      const diff = target - display;
      const lerp = display < HG_STORY_INTRO_END || target < HG_STORY_INTRO_END ? 0.32 : 0.18;
      if (Math.abs(diff) > 0.0005) {
        display += diff * lerp;
        setProgress(display);
        derive(display);
        frame = requestAnimationFrame(tick);
        return;
      }
      display = target;
      setProgress(display);
      derive(display);
    };

    const kick = () => {
      if (isProgrammaticScrollActive()) {
        /* TOP 스크롤 중: lerp 없이 즉시 반영 */
        cancelAnimationFrame(frame);
        display = getTarget();
        setProgress(display);
        derive(display);
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };

    const onModeChange = () => {
      if (motionQuery.matches || mobileQuery.matches) {
        display = 0;
        setProgress(0);
        setIntroFill(1);
        setPhase("story");
        setActive(0);
        setIntroPinned(false);
        return;
      }
      kick();
    };

    motionQuery.addEventListener("change", onModeChange);
    mobileQuery.addEventListener("change", onModeChange);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    window.addEventListener("hg:scroll-top-end", kick);
    onModeChange();
    kick();

    return () => {
      cancelAnimationFrame(frame);
      motionQuery.removeEventListener("change", onModeChange);
      mobileQuery.removeEventListener("change", onModeChange);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      window.removeEventListener("hg:scroll-top-end", kick);
    };
  }, [scrollRef, stageCount]);

  return { progress, introFill, active, phase, introPinned };
}

const HG_VISION_PAUSE_VH = 50;
const HG_VISION_WHEEL_COOLDOWN = 320;
const HG_VISION_SNAP_TOLERANCE = 6;

function getVisionZoneHeight() {
  return `calc(100svh + ${HG_VISION_PAUSE_VH}vh)`;
}

export function useHgVisionScroll(scrollRef, enabled = true) {
  useEffect(() => {
    if (!HG_SCROLL_JACK_ENABLED) return undefined;
    const zone = scrollRef?.current;
    if (!zone || !enabled) return undefined;

    const vision = zone.querySelector(".hg-vision");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia(`(max-width: ${HG_MOBILE_BREAKPOINT}px)`);

    if (mobileQuery.matches || motionQuery.matches) {
      zone.style.height = "";
      vision?.classList.add("is-animated");
      return () => {
        zone.style.removeProperty("height");
      };
    }

    const syncHeight = () => {
      zone.style.height = getVisionZoneHeight();
    };

    const revealVision = () => {
      if (!vision) return;
      vision.classList.add("is-animated");
    };

    const hideVision = () => {
      vision?.classList.remove("is-animated");
    };

    syncHeight();

    let wheelLocked = false;
    let wheelLockTimer = 0;
    let mobileObserver;

    const getRange = () => Math.max(zone.offsetHeight - window.innerHeight, 0);

    const isPinned = () => {
      const rect = zone.getBoundingClientRect();
      return rect.top <= HG_VISION_SNAP_TOLERANCE && rect.bottom >= window.innerHeight - HG_VISION_SNAP_TOLERANCE;
    };

    const getRaw = () => {
      const range = getRange();
      if (range <= 0) return 0;
      const scrolled = Math.min(Math.max(-zone.getBoundingClientRect().top, 0), range);
      return scrolled / range;
    };

    const isAtHold = () => isPinned() && getRaw() < 0.08;

    const syncVisionReveal = () => {
      if (motionQuery.matches || mobileQuery.matches) return;

      if (isAtHold()) {
        revealVision();
        return;
      }

      const rect = zone.getBoundingClientRect();
      if (getRaw() < 0.03 || rect.top > 48) {
        hideVision();
      }
    };

    const holdY = () => zone.offsetTop;
    const exitY = () => zone.offsetTop + getRange();

    const snapTo = (y) => {
      if (isProgrammaticScrollActive()) return;
      window.scrollTo({ top: y, behavior: "auto" });
    };

    const enterHold = () => {
      snapTo(holdY());
      zone.classList.add("is-holding");
      revealVision();
    };

    const exitHold = () => {
      wheelLocked = true;
      window.clearTimeout(wheelLockTimer);
      wheelLockTimer = window.setTimeout(() => {
        wheelLocked = false;
      }, HG_VISION_WHEEL_COOLDOWN);

      zone.classList.remove("is-holding");
      zone.classList.add("is-scrolled-through");
      snapTo(exitY());
    };

    const softenHold = () => {
      if (isProgrammaticScrollActive()) return;
      if (motionQuery.matches || mobileQuery.matches || !isPinned()) return;
      if (zone.classList.contains("is-scrolled-through")) return;

      const raw = getRaw();
      if (raw > 0.08) return;

      const drift = window.scrollY - holdY();
      if (Math.abs(drift) > window.innerHeight * 0.06) {
        snapTo(holdY());
      }
    };

    const isZoneActive = () => {
      const rect = zone.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };

    const onWheel = (event) => {
      if (isProgrammaticScrollActive()) return;
      if (motionQuery.matches || mobileQuery.matches || wheelLocked) return;
      if (!isZoneActive()) return;

      const goingDown = event.deltaY > 0;
      const goingUp = event.deltaY < 0;
      const raw = getRaw();
      const rect = zone.getBoundingClientRect();

      if (!isPinned()) {
        if (
          goingDown &&
          raw <= 0.04 &&
          rect.top < window.innerHeight * 0.92 &&
          rect.top > -window.innerHeight * 0.2
        ) {
          event.preventDefault();
          enterHold();
        }
        return;
      }

      if (goingUp) {
        if (raw <= 0.08 || raw >= 0.9) {
          return;
        }
        event.preventDefault();
        enterHold();
        return;
      }

      if (raw >= 0.12) {
        return;
      }

      event.preventDefault();

      if (zone.classList.contains("is-holding") || vision?.classList.contains("is-animated")) {
        exitHold();
      } else {
        enterHold();
      }
    };

    const onScroll = () => {
      if (isProgrammaticScrollActive()) return;
      softenHold();

      const raw = getRaw();
      const holding = isPinned() && raw < 0.08;
      zone.classList.toggle("is-holding", holding);
      zone.classList.toggle("is-scrolled-through", raw >= 0.98);
      syncVisionReveal();

      if (!isPinned() && raw < 0.03) {
        zone.classList.remove("is-holding", "is-scrolled-through");
      }
    };

    const setupMobileReveal = () => {
      mobileObserver?.disconnect();
      mobileObserver = undefined;

      if (!vision || (!motionQuery.matches && !mobileQuery.matches)) return;

      mobileObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) revealVision();
            else hideVision();
          });
        },
        { threshold: 0.45 }
      );
      mobileObserver.observe(vision);
    };

    const onMotionChange = () => {
      syncHeight();
      zone.classList.remove("is-holding", "is-scrolled-through");
      hideVision();
      setupMobileReveal();
    };

    setupMobileReveal();
    motionQuery.addEventListener("change", onMotionChange);
    mobileQuery.addEventListener("change", onMotionChange);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncHeight);
    onScroll();

    return () => {
      window.clearTimeout(wheelLockTimer);
      mobileObserver?.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      mobileQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", syncHeight);
      zone.style.removeProperty("height");
      zone.classList.remove("is-holding", "is-scrolled-through");
      hideVision();
    };
  }, [scrollRef, enabled]);
}

const HG_BUSINESS_EXPAND_SEGMENT = 0.55;

/* HD현대중공업 메인 사업분야 섹션 전환값 (참고 영상 기준) */
const HD_BIZ_SCALE_MIN = 0.92;
const HD_BIZ_SCALE_ACTIVE = 1;
const HD_BIZ_SCALE_LEAVE = 0.94;
const HD_BIZ_ROTATE_DEG = 6.5;
const HD_BIZ_DEPTH_PX = -68;
const HD_BIZ_SCROLL_LERP = 0.22;
const HD_BIZ_PANEL_SPACING = 1.16;
const HD_BIZ_SNAP_DURATION = 920;
const HD_BIZ_WHEEL_COOLDOWN = 980;
const HD_BIZ_SCROLL_LOCK_TOLERANCE = 4;

function getBusinessZoneHeight(panelCount) {
  return `calc(100svh + 38vh + 32vh * ${panelCount})`;
}

function smoothstep(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/* 히어로→첫 카드 진입처럼 이미 움직이던 중에는 관성이 이어지도록 빠르게 시작해 완만히 정지 */
function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

const HD_BIZ_ENTRY_SNAP_DURATION = 760;

function getBusinessSnapRaws(panelCount) {
  const expandPortion = getBusinessExpandPortion(panelCount);
  const maxIndex = Math.max(panelCount - 1, 0);
  const raws = [];

  for (let i = 0; i < panelCount; i += 1) {
    const slide = maxIndex === 0 ? 0 : i / maxIndex;
    raws.push(expandPortion + slide * (1 - expandPortion));
  }

  return { raws, expandPortion };
}

function getNearestSnapIndex(raw, raws) {
  let nearest = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  raws.forEach((value, index) => {
    const distance = Math.abs(value - raw);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = index;
    }
  });

  return nearest;
}

function getBusinessExpandPortion(panelCount) {
  return HG_BUSINESS_EXPAND_SEGMENT / (panelCount + HG_BUSINESS_EXPAND_SEGMENT);
}

function getPanelMotion(offset) {
  const abs = Math.abs(offset);
  const travel = offset * HD_BIZ_PANEL_SPACING;

  if (abs >= 1.12) {
    return {
      travel,
      scale: HD_BIZ_SCALE_MIN,
      rotateY: -offset * HD_BIZ_ROTATE_DEG * 0.9,
      translateZ: HD_BIZ_DEPTH_PX,
      originX: offset > 0 ? 88 : 12,
      opacity: 0,
    };
  }

  const focus = smoothstep(Math.max(0, 1 - abs * 0.92));
  const focusDeep = focus * focus;
  const leaveBias = offset < 0 ? (1 - focus) * (HD_BIZ_SCALE_ACTIVE - HD_BIZ_SCALE_LEAVE) : 0;

  const scale =
    HD_BIZ_SCALE_MIN +
    focusDeep * (HD_BIZ_SCALE_ACTIVE - HD_BIZ_SCALE_MIN) -
    leaveBias;

  const rotateBlend = smoothstep(Math.max(0, 1 - abs * 0.86));
  const rotateY = -offset * HD_BIZ_ROTATE_DEG * rotateBlend;

  const depthBlend = smoothstep(Math.min(1, abs * 1.02));
  const lift = (1 - focus) * 20;
  const translateZ = HD_BIZ_DEPTH_PX * depthBlend + lift;

  const originX = 50 + Math.max(-36, Math.min(36, -offset * 38));

  const fadeStart = 0.9;
  const opacity =
    abs <= fadeStart
      ? 1
      : Math.max(0, 1 - smoothstep((abs - fadeStart) / (1.12 - fadeStart)));

  return { travel, scale, rotateY, translateZ, originX, opacity };
}

export function useHgBusinessScroll(scrollRef, panelCount) {
  const { isMobile } = useHgViewport();
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentRevealIndex, setContentRevealIndex] = useState(-1);

  useEffect(() => {
    if (!HG_SCROLL_JACK_ENABLED) {
      setContentRevealIndex(Math.max(panelCount - 1, 0));
      return undefined;
    }
    const zone = scrollRef.current;
    if (!zone || panelCount < 1) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia(`(max-width: ${HG_MOBILE_BREAKPOINT}px)`);
    const { raws: snapRaws, expandPortion } = getBusinessSnapRaws(panelCount);

    const resetMobilePanels = () => {
      zone.style.height = "";
      zone.style.removeProperty("--hg-biz-expand");
      zone.style.removeProperty("--hg-biz-slide");
      zone.style.removeProperty("--hg-biz-slide-index");
      zone.querySelectorAll("[data-hg-panel-index]").forEach((panel) => {
        panel.style.setProperty("--hg-panel-offset", "0");
        panel.style.setProperty("--hg-panel-travel", "0");
        panel.style.setProperty("--hg-panel-scale", "1");
        panel.style.setProperty("--hg-panel-rotate", "0");
        panel.style.setProperty("--hg-panel-z", "0");
        panel.style.setProperty("--hg-panel-origin-x", "50%");
        panel.style.setProperty("--hg-panel-opacity", "1");
        panel.style.zIndex = "";
      });
      zone.classList.remove("is-scrolled-through", "is-snapping");
      setActiveIndex(0);
      setContentRevealIndex(0);
    };

    if (isMobile || mobileQuery.matches || motionQuery.matches) {
      resetMobilePanels();
      return () => {
        zone.style.removeProperty("height");
        zone.style.removeProperty("--hg-biz-expand");
        zone.style.removeProperty("--hg-biz-slide");
        zone.style.removeProperty("--hg-biz-slide-index");
      };
    }

    zone.style.height = getBusinessZoneHeight(panelCount);

    let frame = 0;
    let displayRaw = 0;
    let snapIndex = 0;
    let isSnapping = false;
    let snapStart = 0;
    let snapFromRaw = 0;
    let snapToRaw = 0;
    let snapFromSlideIndex = 0;
    let snapToSlideIndex = 0;
    let wheelLocked = false;
    let wheelLockTimer = 0;
    let displaySlideIndex = 0;
    let revealIndex = -1;
    let snapDuration = HD_BIZ_SNAP_DURATION;
    let snapEase = easeInOutCubic;

    const notifyReveal = (index) => {
      if (revealIndex === index) return;
      revealIndex = index;
      setContentRevealIndex(index);
    };

    const isZonePinned = () => {
      const rect = zone.getBoundingClientRect();
      return rect.top <= 2 && rect.bottom >= window.innerHeight - 2;
    };

    const getScrollRange = () => zone.offsetHeight - window.innerHeight;

    const getScrollRaw = () => {
      const range = getScrollRange();
      if (range <= 0) return 0;
      const scrolled = Math.min(Math.max(-zone.getBoundingClientRect().top, 0), range);
      return scrolled / range;
    };

    const canExitBizZoneDown = () =>
      snapIndex >= snapRaws.length - 1 &&
      displayRaw >= snapRaws[snapRaws.length - 1] - 0.02 &&
      !isSnapping;

    /** 첫 카드(회사소개)에서는 위로 히어로로 나갈 수 있어야 함 */
    const canExitBizZoneUp = () =>
      snapIndex <= 0 && !isSnapping && displayRaw <= snapRaws[0] + 0.04;

    const getSnapAnchorY = (raw = snapRaws[snapIndex]) => {
      const range = getScrollRange();
      if (range <= 0) return zone.offsetTop;
      return zone.offsetTop + Math.min(Math.max(raw, 0), 1) * range;
    };

    /** Force page scroll to stay on the current snap until exit is allowed. */
    const lockScrollToCurrentSnap = () => {
      if (isProgrammaticScrollActive()) return;
      if (motionQuery.matches || mobileQuery.matches) return;
      if (!isZonePinned()) return;
      if (canExitBizZoneDown()) return;

      // 스냅 애니 중에는 목적지(anchor)만 고정 — displayRaw로 끌어당기면 팅김 발생
      if (isSnapping) {
        const anchorY = getSnapAnchorY(snapToRaw);
        if (Math.abs(window.scrollY - anchorY) > HD_BIZ_SCROLL_LOCK_TOLERANCE) {
          window.scrollTo({ top: anchorY, behavior: "auto" });
        }
        return;
      }

      const anchorY = getSnapAnchorY(snapRaws[snapIndex]);

      // 첫 카드: 위쪽(히어로 방향) 스크롤은 잠그지 않음
      if (canExitBizZoneUp()) {
        if (window.scrollY > anchorY + HD_BIZ_SCROLL_LOCK_TOLERANCE) {
          window.scrollTo({ top: anchorY, behavior: "auto" });
        }
        return;
      }

      if (Math.abs(window.scrollY - anchorY) > HD_BIZ_SCROLL_LOCK_TOLERANCE) {
        window.scrollTo({ top: anchorY, behavior: "auto" });
      }
    };

    const applyRaw = (raw) => {
      const { expand, slide } = (() => {
        if (raw <= expandPortion) {
          /* smoothstep으로 확장의 시작/끝을 완만하게 */
          return { expand: smoothstep(raw / expandPortion), slide: 0 };
        }
        return {
          expand: 1,
          slide: (raw - expandPortion) / (1 - expandPortion),
        };
      })();

      const maxIndex = Math.max(panelCount - 1, 0);
      const targetSlideIndex = maxIndex === 0 ? 0 : slide * maxIndex;

      if (isProgrammaticScrollActive()) {
        /* TOP 스크롤 중에는 지연 없이 위치 그대로 반영 */
        displaySlideIndex = targetSlideIndex;
      } else if (!isSnapping) {
        displaySlideIndex += (targetSlideIndex - displaySlideIndex) * 0.24;
        if (Math.abs(targetSlideIndex - displaySlideIndex) < 0.002) {
          displaySlideIndex = targetSlideIndex;
        }
      }

      zone.style.setProperty("--hg-biz-expand", expand.toFixed(4));
      zone.style.setProperty("--hg-biz-slide", slide.toFixed(4));
      zone.style.setProperty("--hg-biz-slide-index", displaySlideIndex.toFixed(4));

      zone.querySelectorAll("[data-hg-panel-index]").forEach((panel) => {
        const panelIndex = Number(panel.dataset.hgPanelIndex);
        const offset = panelIndex - displaySlideIndex;
        const motion = getPanelMotion(offset);

        panel.style.setProperty("--hg-panel-offset", offset.toFixed(4));
        panel.style.setProperty("--hg-panel-travel", motion.travel.toFixed(4));
        panel.style.setProperty("--hg-panel-scale", motion.scale.toFixed(4));
        panel.style.setProperty("--hg-panel-rotate", motion.rotateY.toFixed(2));
        panel.style.setProperty("--hg-panel-z", motion.translateZ.toFixed(1));
        panel.style.setProperty("--hg-panel-origin-x", `${motion.originX}%`);
        panel.style.setProperty("--hg-panel-opacity", motion.opacity.toFixed(4));
        panel.style.zIndex = String(
          Math.max(
            1,
            Math.round(30 - Math.abs(offset) * 8 + (offset > 0 && offset < 1 ? 6 : 0))
          )
        );
      });

      const nextIndex =
        maxIndex === 0 ? 0 : Math.min(Math.round(displaySlideIndex), maxIndex);
      setActiveIndex(nextIndex);
      zone.classList.toggle("is-scrolled-through", raw >= 0.98);
      zone.classList.toggle("is-snapping", isSnapping);

      if (
        !motionQuery.matches &&
        !mobileQuery.matches &&
        !isSnapping &&
        !isProgrammaticScrollActive() &&
        isZonePinned() &&
        raw >= expandPortion * 0.9 &&
        Math.abs(displaySlideIndex - snapIndex) < 0.06
      ) {
        notifyReveal(snapIndex);
      } else if (mobileQuery.matches || motionQuery.matches) {
        notifyReveal(Math.min(Math.round(displaySlideIndex), maxIndex));
      }
    };

    const startSnapAnimation = (toRaw, nextSnapIndex, options = {}) => {
      if (isProgrammaticScrollActive()) return;

      const maxIndex = Math.max(panelCount - 1, 0);

      snapIndex = nextSnapIndex;
      snapFromRaw = displayRaw;
      snapToRaw = toRaw;
      snapFromSlideIndex = displaySlideIndex;
      snapToSlideIndex = maxIndex === 0 ? 0 : nextSnapIndex;
      snapStart = performance.now();
      snapDuration = options.duration ?? HD_BIZ_SNAP_DURATION;
      snapEase = options.ease ?? easeInOutCubic;
      isSnapping = true;
      notifyReveal(-1);

      const range = getScrollRange();
      if (range > 0) {
        window.scrollTo({ top: getSnapAnchorY(toRaw), behavior: "auto" });
      }

      kick();
    };

    const getTargetRaw = () => {
      if (motionQuery.matches || mobileQuery.matches) return 0;

      const range = getScrollRange();
      if (range <= 0) return snapRaws[0];

      const scrollRaw = getScrollRaw();

      /* While pinned and before last card, stick visual progress to snap points only. */
      if (isZonePinned() && !canExitBizZoneDown() && !isSnapping) {
        if (scrollRaw < expandPortion * 0.75 && snapIndex === 0 && displayRaw < snapRaws[0] - 0.02) {
          return Math.min(scrollRaw, snapRaws[0]);
        }
        return snapRaws[snapIndex];
      }

      return scrollRaw;
    };

    const tick = (now = performance.now()) => {
      if (isProgrammaticScrollActive()) {
        /* TOP 중에는 패널 효과 갱신/스냅을 멈춰 끊김 방지 */
        isSnapping = false;
        return;
      }

      if (isSnapping) {
        const progress = Math.min((now - snapStart) / snapDuration, 1);
        const eased = snapEase(progress);

        displayRaw = snapFromRaw + (snapToRaw - snapFromRaw) * eased;
        displaySlideIndex =
          snapFromSlideIndex + (snapToSlideIndex - snapFromSlideIndex) * eased;
        applyRaw(displayRaw);
        // 스냅 중에는 매 프레임 scrollTo 하지 않음 (목적지 점프와 충돌하며 팅김)

        if (progress >= 0.5) {
          notifyReveal(snapToSlideIndex);
        }

        if (progress < 1) {
          frame = requestAnimationFrame(tick);
          return;
        }

        isSnapping = false;
        displayRaw = snapToRaw;
        displaySlideIndex = snapIndex;
        applyRaw(displayRaw);
        notifyReveal(snapIndex);
        lockScrollToCurrentSnap();
        return;
      }

      /* 히어로에서 내려와 섹션이 핀 되는 순간, 첫 카드 확장을
         관성이 이어지는 easeOut 스냅으로 처리해 끊김 없이 도착 */
      if (
        !motionQuery.matches &&
        !mobileQuery.matches &&
        isZonePinned() &&
        snapIndex === 0 &&
        displayRaw < snapRaws[0] - 0.02
      ) {
        startSnapAnimation(snapRaws[0], 0, {
          duration: HD_BIZ_ENTRY_SNAP_DURATION,
          ease: easeOutCubic,
        });
        return;
      }

      const target = getTargetRaw();
      const diff = target - displayRaw;

      if (Math.abs(diff) > HG_STICKY_SCROLL_SETTLE) {
        displayRaw += diff * HD_BIZ_SCROLL_LERP;
        applyRaw(displayRaw);
        lockScrollToCurrentSnap();
        frame = requestAnimationFrame(tick);
        return;
      }

      displayRaw = target;
      applyRaw(displayRaw);
      lockScrollToCurrentSnap();
    };

    const kick = () => {
      if (isProgrammaticScrollActive()) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };

    const armWheelLock = () => {
      wheelLocked = true;
      window.clearTimeout(wheelLockTimer);
      wheelLockTimer = window.setTimeout(() => {
        wheelLocked = false;
      }, HD_BIZ_WHEEL_COOLDOWN);
    };

    const onWheel = (event) => {
      if (isProgrammaticScrollActive()) return;
      if (motionQuery.matches || mobileQuery.matches) return;
      if (!isZonePinned()) return;

      const goingDown = event.deltaY > 0;

      /* Allow leaving downward only after the last card is fully shown. */
      if (goingDown && canExitBizZoneDown()) return;

      /* Allow scrolling back up to the hero from the first card. */
      if (!goingDown && canExitBizZoneUp()) return;

      /* Block free page scroll for every other wheel while in this section. */
      event.preventDefault();

      if (wheelLocked || isSnapping) return;

      let nextSnapIndex = snapIndex;
      let isEntry = false;

      if (goingDown) {
        if (displayRaw < snapRaws[0] - 0.015) {
          nextSnapIndex = 0;
          isEntry = true;
        } else {
          nextSnapIndex = Math.min(snapIndex + 1, snapRaws.length - 1);
        }
      } else {
        nextSnapIndex = Math.max(snapIndex - 1, 0);
      }

      if (
        nextSnapIndex === snapIndex &&
        !isEntry &&
        Math.abs(displayRaw - snapRaws[snapIndex]) < 0.02
      ) {
        return;
      }

      armWheelLock();
      startSnapAnimation(
        snapRaws[nextSnapIndex],
        nextSnapIndex,
        isEntry ? { duration: HD_BIZ_ENTRY_SNAP_DURATION, ease: easeOutCubic } : {}
      );
    };

    const onScroll = () => {
      if (isProgrammaticScrollActive()) {
        /* TOP 스크롤 중: 스냅·잠금은 멈추되 패널 위치는 즉시 반영해 멈춤 없이 지나가게 */
        isSnapping = false;
        cancelAnimationFrame(frame);
        displayRaw = getScrollRaw();
        applyRaw(displayRaw);
        return;
      }
      // 스냅 애니 중 scroll 이벤트가 잠금을 재실행하며 끊기는 느낌 생김
      if (!isSnapping) {
        lockScrollToCurrentSnap();
      }
      kick();
    };

    const onTopEnd = () => {
      isSnapping = false;
      displayRaw = getScrollRaw();
      snapIndex = getNearestSnapIndex(displayRaw, snapRaws);
      displaySlideIndex = Math.max(panelCount - 1, 0) === 0 ? 0 : snapIndex;
      applyRaw(displayRaw);
      kick();
    };

    const onMotionChange = () => {
      displayRaw = getTargetRaw();
      kick();
    };

    motionQuery.addEventListener("change", onMotionChange);
    mobileQuery.addEventListener("change", onMotionChange);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", kick);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("hg:scroll-top-end", onTopEnd);
    kick();

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(wheelLockTimer);
      motionQuery.removeEventListener("change", onMotionChange);
      mobileQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", kick);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("hg:scroll-top-end", onTopEnd);
      zone.style.removeProperty("--hg-biz-expand");
      zone.style.removeProperty("--hg-biz-slide");
      zone.style.removeProperty("--hg-biz-slide-index");
      zone.style.removeProperty("height");
      zone.classList.remove("is-scrolled-through");
      zone.classList.remove("is-snapping");
    };
  }, [scrollRef, panelCount, isMobile]);

  const goToPanel = (index) => {
    const maxIndex = Math.max(panelCount - 1, 0);
    const clamped = Math.min(Math.max(index, 0), maxIndex);
    setActiveIndex(clamped);

    if (!HG_SCROLL_JACK_ENABLED) return;

    const zone = scrollRef.current;
    if (!zone || panelCount <= 1) return;

    const mobileQuery = window.matchMedia(`(max-width: ${HG_MOBILE_BREAKPOINT}px)`);
    if (mobileQuery.matches) return;

    const range = zone.offsetHeight - window.innerHeight;
    if (range <= 8) return;

    const expandPortion = getBusinessExpandPortion(panelCount);
    const slide = maxIndex === 0 ? 0 : clamped / maxIndex;
    const raw = expandPortion + slide * (1 - expandPortion);
    window.scrollTo({ top: zone.offsetTop + raw * range, behavior: "smooth" });
  };

  return { activeIndex, contentRevealIndex, goToPanel };
}

export function useHgSnapShowcase(scrollRef, panelCount, progressVar = "--hg-showcase-progress") {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!HG_SCROLL_JACK_ENABLED) return undefined;
    const zone = scrollRef.current;
    if (!zone || panelCount < 1) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia(`(max-width: ${HG_MOBILE_BREAKPOINT}px)`);

    let frame = 0;
    let displayProgress = 0;

    const getTargetProgress = () => {
      if (motionQuery.matches || mobileQuery.matches) return 0;

      const range = zone.offsetHeight - window.innerHeight;
      if (range <= 0) return 0;

      const scrolled = Math.min(Math.max(-zone.getBoundingClientRect().top, 0), range);
      return scrolled / range;
    };

    const applyProgress = (progress) => {
      zone.style.setProperty(progressVar, progress.toFixed(4));
      const maxIndex = Math.max(panelCount - 1, 0);
      const nextIndex =
        maxIndex === 0 ? 0 : Math.min(Math.round(progress * maxIndex), maxIndex);
      setActiveIndex(nextIndex);
      zone.classList.toggle("is-scrolled-through", progress >= 0.98);
    };

    const tick = () => {
      const target = getTargetProgress();
      const diff = target - displayProgress;

      if (Math.abs(diff) > HG_STICKY_SCROLL_SETTLE) {
        displayProgress += diff * HG_STICKY_SCROLL_LERP;
        applyProgress(displayProgress);
        frame = requestAnimationFrame(tick);
        return;
      }

      displayProgress = target;
      applyProgress(displayProgress);
    };

    const kick = () => {
      if (isProgrammaticScrollActive()) {
        /* TOP 스크롤 중: lerp 없이 즉시 반영 */
        cancelAnimationFrame(frame);
        displayProgress = getTargetProgress();
        applyProgress(displayProgress);
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };

    const onMotionChange = () => {
      displayProgress = getTargetProgress();
      kick();
    };

    motionQuery.addEventListener("change", onMotionChange);
    mobileQuery.addEventListener("change", onMotionChange);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    window.addEventListener("hg:scroll-top-end", kick);
    kick();

    return () => {
      cancelAnimationFrame(frame);
      motionQuery.removeEventListener("change", onMotionChange);
      mobileQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      window.removeEventListener("hg:scroll-top-end", kick);
      zone.style.removeProperty(progressVar);
      zone.classList.remove("is-scrolled-through");
    };
  }, [scrollRef, panelCount, progressVar]);

  const goToPanel = (index) => {
    const maxIndex = Math.max(panelCount - 1, 0);
    const clamped = Math.min(Math.max(index, 0), maxIndex);
    setActiveIndex(clamped);

    const zone = scrollRef.current;
    if (!zone || panelCount <= 1) return;

    const range = zone.offsetHeight - window.innerHeight;
    if (range <= 8) return;

    const targetY = zone.offsetTop + (clamped / maxIndex) * range;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return { activeIndex, goToPanel };
}

export function useHgHorizontalScroll(scrollRef, panelCount, progressVar = "--hg-hscroll-progress") {
  useEffect(() => {
    if (!HG_SCROLL_JACK_ENABLED) return undefined;
    const zone = scrollRef.current;
    if (!zone || panelCount < 2) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia(`(max-width: ${HG_MOBILE_BREAKPOINT}px)`);

    let frame = 0;
    let displayProgress = 0;

    const getTargetProgress = () => {
      if (motionQuery.matches || mobileQuery.matches) return 0;

      const range = zone.offsetHeight - window.innerHeight;
      if (range <= 0) return 0;

      const scrolled = Math.min(Math.max(-zone.getBoundingClientRect().top, 0), range);
      return scrolled / range;
    };

    const applyProgress = (progress) => {
      zone.style.setProperty(progressVar, progress.toFixed(4));
      zone.classList.toggle("is-scrolled-through", progress >= 0.98);
    };

    const tick = () => {
      const target = getTargetProgress();
      const diff = target - displayProgress;

      if (Math.abs(diff) > HG_STICKY_SCROLL_SETTLE) {
        displayProgress += diff * HG_STICKY_SCROLL_LERP;
        applyProgress(displayProgress);
        frame = requestAnimationFrame(tick);
        return;
      }

      displayProgress = target;
      applyProgress(displayProgress);
    };

    const kick = () => {
      if (isProgrammaticScrollActive()) {
        /* TOP 스크롤 중: lerp 없이 즉시 반영 */
        cancelAnimationFrame(frame);
        displayProgress = getTargetProgress();
        applyProgress(displayProgress);
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };

    const onMotionChange = () => {
      displayProgress = getTargetProgress();
      kick();
    };

    motionQuery.addEventListener("change", onMotionChange);
    mobileQuery.addEventListener("change", onMotionChange);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    window.addEventListener("hg:scroll-top-end", kick);
    kick();

    return () => {
      cancelAnimationFrame(frame);
      motionQuery.removeEventListener("change", onMotionChange);
      mobileQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      window.removeEventListener("hg:scroll-top-end", kick);
      zone.style.removeProperty(progressVar);
      zone.classList.remove("is-scrolled-through");
    };
  }, [scrollRef, panelCount, progressVar]);
}

export function useHgCountUp(target, { duration = 1800, enabled = true } = {}) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return undefined;
    }

    const el = ref.current;
    if (!el) return undefined;

    let frame = 0;
    let playing = false;
    const numeric = typeof target === "number" ? target : parseInt(String(target), 10) || 0;

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      playing = false;
    };

    const run = () => {
      stop();
      playing = true;
      setValue(0);
      const start = performance.now();

      const tick = (now) => {
        if (!playing) return;
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        setValue(Math.round(numeric * eased));
        if (progress < 1) {
          frame = requestAnimationFrame(tick);
          return;
        }
        playing = false;
      };

      frame = requestAnimationFrame(tick);
    };

    const reset = () => {
      stop();
      setValue(0);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run();
            return;
          }
          /* 화면에서 벗어나면 리셋 → 다시 들어오거나 새로고침 후 재진입 시 효과 재생 */
          reset();
        });
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);

    const onPageShow = (event) => {
      if (!event.persisted) return;
      reset();
      const rect = el.getBoundingClientRect();
      const visible =
        rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.08;
      if (visible) run();
    };

    window.addEventListener("pageshow", onPageShow);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [target, duration, enabled]);

  return { ref, value };
}

export function useHgReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll(".hg-reveal:not(.is-visible)");
    if (!els.length) return undefined;

    const reveal = (el) => {
      el.classList.add("is-visible");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      /* 뷰포트에 충분히 들어온 뒤에만 등장 (미리 재생 방지) */
      { threshold: 0.18, rootMargin: "0px 0px -12% 0px" }
    );

    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const inView =
        rect.top < window.innerHeight * 0.7 &&
        rect.bottom > window.innerHeight * 0.15;
      if (inView) {
        reveal(el);
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
