import { useEffect } from "react";

const FAVICON = "https://hanwhagreen.com/theme/FT_WEB50/img/favicon.ico";
const ROUGHMAP_SCRIPT =
  "https://ssl.daumcdn.net/dmaps/map_js_init/roughmapLoader.js";

let roughMapScriptPromise;

function waitForRoughMapReady(timeoutMs = 10000) {
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

function renderRoughMap(location) {
  const container = document.getElementById(location.containerId);
  if (!container || !window.daum?.roughmap?.Lander) return;

  container.innerHTML = "";

  new window.daum.roughmap.Lander({
    timestamp: location.timestamp,
    key: location.key,
    mapWidth: "100%",
    mapHeight: "360",
  }).render();

  if (location.removeCont) {
    window.setTimeout(() => {
      container.querySelector(".cont")?.remove();
    }, 500);
  }
}

function MapInfoBlock({ info }) {
  return (
    <div className="map_info elm">
      <div className="lf_box">
        <span className="map-info-icon">
          <img src={FAVICON} alt="" />
        </span>
      </div>
      <div className="rt_box">
        <strong>{info.name}</strong>
        {info.fields.map((field) => (
          <p key={field.label}>
            <span>{field.label}</span>
            <span>{field.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export default function MapPageContent({ config }) {
  useEffect(() => {
    let cancelled = false;

    loadRoughMapScript()
      .then(() => {
        if (cancelled) return;
        config.locations.forEach((location) => renderRoughMap(location));
      })
      .catch(() => {
        /* ignore external map load failures in test/offline environments */
      });

    return () => {
      cancelled = true;
    };
  }, [config]);

  return (
    <section className="sec sec1">
      <h1 className="blind">오시는 길</h1>
      <article className="inner">
        <h1 className="title">오시는 길</h1>

        <div
          id={config.locations[0].containerId}
          className="root_daum_roughmap root_daum_roughmap_landing"
        />
        <MapInfoBlock info={config.locations[0].info} />

        <div className="topBox">
          <div className="infoBox infoBox2 map-directions-box" style={{ width: "auto" }}>
            <div className="titBox">
              <p className="icon">
                <i className="xi-car" aria-hidden="true" />
              </p>
              <p className="text">자차로 오시는 방법</p>
            </div>
            <ul className="map-directions-list" style={{ height: "auto" }}>
              <li>
                <dl>
                  <dt>
                    <div className="btnBox">
                      <a href={config.navLink} target="_blank" rel="noopener noreferrer">
                        <span>네비게이션 +</span>
                      </a>
                    </div>
                  </dt>
                  {config.directions.map((direction) => (
                    <dt key={direction} className="map-direction-text">
                      {direction}
                    </dt>
                  ))}
                </dl>
              </li>
            </ul>
          </div>
        </div>

        <br />

        <div
          id={config.locations[1].containerId}
          className="root_daum_roughmap root_daum_roughmap_landing"
        />
        <MapInfoBlock info={config.locations[1].info} />
      </article>
    </section>
  );
}
