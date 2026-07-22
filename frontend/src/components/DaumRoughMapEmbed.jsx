import { useEffect, useRef } from "react";

const ROUGHMAP_SCRIPT =
  "https://ssl.daumcdn.net/dmaps/map_js_init/roughmapLoader.js";

let roughMapScriptPromise;

function waitForRoughMapReady(timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if (window.daum?.roughmap?.Lander) {
        resolve();
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        reject(new Error("roughmap not ready"));
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  });
}

function loadRoughMapScript() {
  if (window.daum?.roughmap?.Lander) {
    return Promise.resolve();
  }

  if (roughMapScriptPromise) {
    return roughMapScriptPromise;
  }

  roughMapScriptPromise = new Promise((resolve, reject) => {
    const finish = () => {
      waitForRoughMapReady()
        .then(resolve)
        .catch(reject);
    };

    const existing = document.querySelector("script.daum_roughmap_loader_script");
    if (existing) {
      if (window.daum?.roughmap?.Lander) {
        resolve();
        return;
      }
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", () => reject(new Error("roughmap load failed")), {
        once: true,
      });
      finish();
      return;
    }

    const script = document.createElement("script");
    script.src = ROUGHMAP_SCRIPT;
    script.charset = "UTF-8";
    script.className = "daum_roughmap_loader_script";
    script.onload = finish;
    script.onerror = () => reject(new Error("roughmap load failed"));
    document.body.appendChild(script);
  });

  return roughMapScriptPromise;
}

function hasRoughMapContent(container) {
  return Boolean(container.querySelector(".wrap_map, iframe, .map"));
}

function waitForLayoutWidth(el, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      if (!el) {
        resolve(false);
        return;
      }
      if (el.clientWidth > 40) {
        resolve(true);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        resolve(el.clientWidth > 0);
        return;
      }
      window.requestAnimationFrame(tick);
    };
    tick();
  });
}

function renderRoughMap(container, location, mapHeight, removeCont) {
  if (!container || !window.daum?.roughmap?.Lander) return false;
  if (hasRoughMapContent(container)) return true;

  container.innerHTML = "";

  new window.daum.roughmap.Lander({
    timestamp: location.timestamp,
    key: location.key,
    mapWidth: "100%",
    mapHeight: String(mapHeight),
  }).render();

  if (removeCont || location.removeCont) {
    window.setTimeout(() => {
      container.querySelector(".cont")?.remove();
    }, 500);
  }

  return true;
}

export default function DaumRoughMapEmbed({
  location,
  mapHeight = 300,
  className = "",
  removeCont = false,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let retryTimer = 0;

    const run = async () => {
      const container = containerRef.current;
      if (cancelled || !container) return;

      try {
        await loadRoughMapScript();
      } catch {
        return;
      }

      if (cancelled || !containerRef.current) return;

      await waitForLayoutWidth(containerRef.current);
      if (cancelled || !containerRef.current) return;

      renderRoughMap(containerRef.current, location, mapHeight, removeCont);

      /* Lander가 비어 있으면 한 번 더 시도 */
      retryTimer = window.setTimeout(() => {
        if (cancelled || !containerRef.current) return;
        if (!hasRoughMapContent(containerRef.current)) {
          renderRoughMap(containerRef.current, location, mapHeight, removeCont);
        }
      }, 600);
    };

    run();

    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
    };
  }, [location.containerId, location.timestamp, location.key, mapHeight, removeCont]);

  return (
    <div
      ref={containerRef}
      id={location.containerId}
      className={`root_daum_roughmap root_daum_roughmap_landing live-roughmap-embed ${className}`.trim()}
      style={{ minHeight: mapHeight, height: mapHeight, width: "100%" }}
      aria-label={`${location.info?.name || "한화그린"} 위치 지도`}
    />
  );
}
