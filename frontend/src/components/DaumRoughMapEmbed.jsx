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
  return Boolean(container.querySelector(".wrap_map, iframe"));
}

function renderRoughMap(container, location, mapHeight, removeCont) {
  if (!container || !window.daum?.roughmap?.Lander) return;

  if (hasRoughMapContent(container)) return;

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
}

export default function DaumRoughMapEmbed({
  location,
  mapHeight = 300,
  className = "",
  removeCont = false,
}) {
  const containerRef = useRef(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    renderedRef.current = false;

    const run = () => {
      if (cancelled || !containerRef.current || renderedRef.current) return;
      if (hasRoughMapContent(containerRef.current)) {
        renderedRef.current = true;
        return;
      }
      renderRoughMap(containerRef.current, location, mapHeight, removeCont);
      renderedRef.current = true;
    };

    loadRoughMapScript()
      .then(run)
      .catch(() => {
        /* script blocked */
      });

    return () => {
      cancelled = true;
    };
  }, [location.containerId, location.timestamp, location.key, mapHeight, removeCont]);

  return (
    <div
      ref={containerRef}
      id={location.containerId}
      className={`root_daum_roughmap root_daum_roughmap_landing live-roughmap-embed ${className}`.trim()}
      style={{ minHeight: mapHeight, height: mapHeight }}
      role="img"
      aria-label={`${location.info?.name || "한화그린"} 위치 지도`}
    />
  );
}
