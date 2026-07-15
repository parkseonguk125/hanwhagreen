import { useMemo, useState } from "react";
import DaumRoughMapEmbed from "../../DaumRoughMapEmbed";
import { getNaverDirectionsUrl } from "../../../config/mapLinks";

const ROUTE_META = [
  { match: /서울/, label: "서울", short: "수도권·중부" },
  { match: /전남|광주/, label: "광주", short: "호남" },
  { match: /통영/, label: "통영", short: "경남·남해" },
];

function parseDirection(raw) {
  const [titlePart = "", ...rest] = String(raw).split(/\s*:\s*/);
  const body = rest.join(" : ").trim();
  const steps = body
    .split(/\s*->\s*/)
    .map((step) => step.trim())
    .filter(Boolean);

  const meta = ROUTE_META.find((item) => item.match.test(titlePart)) || {
    label: titlePart.replace(/\s*오실때\s*$/, "").trim() || "경로",
    short: "자차",
  };

  const tollStep = steps.find((step) => /톨게이트|통행료/.test(step));
  const tollNote = tollStep?.match(/통행료\s*[\d,]+원/)?.[0] || null;

  return {
    id: meta.label,
    label: meta.label,
    short: meta.short,
    title: titlePart.replace(/\s*오실때\s*$/, "").trim() || meta.label,
    tollNote,
    steps,
  };
}

function telHref(value) {
  const digits = String(value || "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : undefined;
}

function LocationSwitcher({ locations, activeIndex, onChange }) {
  return (
    <div className="hg-map__switcher" role="tablist" aria-label="지점 선택">
      {locations.map((location, index) => {
        const active = index === activeIndex;
        return (
          <button
            key={location.containerId}
            type="button"
            role="tab"
            aria-selected={active}
            className={`hg-map__switch${active ? " is-active" : ""}`}
            onClick={() => onChange(index)}
          >
            <span className="hg-map__switch-label">{location.info.name}</span>
            <span className="hg-map__switch-hint">
              {location.info.fields.find((f) => /ADDRESS|주소/i.test(f.label))?.value || ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ContactPanel({ info, navLink }) {
  const address = info.fields.find((f) => /ADDRESS|주소/i.test(f.label));
  const phone = info.fields.find((f) => /Tel|전화|상담/i.test(f.label));
  const fax = info.fields.find((f) => /Fax|팩스/i.test(f.label));

  return (
    <aside className="hg-map__panel">
      <p className="hg-map__panel-eyebrow">Visit Us</p>
      <h3 className="hg-map__panel-title">{info.name}</h3>

      <dl className="hg-map__meta">
        {address && (
          <div className="hg-map__meta-row">
            <dt>주소</dt>
            <dd>{address.value}</dd>
          </div>
        )}
        {phone && (
          <div className="hg-map__meta-row">
            <dt>{phone.label}</dt>
            <dd>
              {telHref(phone.value) ? (
                <a href={telHref(phone.value)}>{phone.value}</a>
              ) : (
                phone.value
              )}
            </dd>
          </div>
        )}
        {fax && (
          <div className="hg-map__meta-row">
            <dt>{fax.label}</dt>
            <dd>{fax.value}</dd>
          </div>
        )}
      </dl>

      <div className="hg-map__actions">
        {navLink && (
          <a
            className="hg-map__btn hg-map__btn--primary"
            href={navLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            네이버 길찾기
            <span aria-hidden="true">↗</span>
          </a>
        )}
        {phone && telHref(phone.value) && (
          <a className="hg-map__btn hg-map__btn--ghost" href={telHref(phone.value)}>
            전화 문의
          </a>
        )}
      </div>
    </aside>
  );
}

function DrivingGuide({ routes, navLink }) {
  const [open, setOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState(0);
  const current = routes[activeRoute];

  if (!routes.length) return null;

  return (
    <section className="hg-map__drive">
      <button
        type="button"
        className={`hg-map__drive-toggle${open ? " is-open" : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="hg-map__drive-toggle-copy">
          <span className="hg-map__drive-kicker">By Car</span>
          <span className="hg-map__drive-title">자차로 오시는 방법</span>
          <span className="hg-map__drive-desc">
            출발지별 상세 경로를 확인할 수 있습니다
          </span>
        </span>
        <span className="hg-map__drive-toggle-icon" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>

      <div
        className={`hg-map__drive-panel${open ? " is-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="hg-map__drive-toolbar">
          <div className="hg-map__route-tabs" role="tablist" aria-label="출발 방향">
            {routes.map((route, index) => (
              <button
                key={route.id}
                type="button"
                role="tab"
                aria-selected={index === activeRoute}
                className={`hg-map__route-tab${index === activeRoute ? " is-active" : ""}`}
                onClick={() => setActiveRoute(index)}
              >
                <strong>{route.label}</strong>
                <span>{route.short}</span>
              </button>
            ))}
          </div>

          {navLink && (
            <a
              className="hg-map__drive-nav"
              href={navLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              네비게이션 열기
            </a>
          )}
        </div>

        {current && (
          <article className="hg-map__route">
            <header className="hg-map__route-head">
              <h4>{current.title}에서 오실 때</h4>
              {current.tollNote && <p className="hg-map__route-toll">{current.tollNote}</p>}
            </header>
            <ol className="hg-map__steps">
              {current.steps.map((step, index) => (
                <li key={`${current.id}-${index}`}>
                  <span className="hg-map__step-num">{String(index + 1).padStart(2, "0")}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </article>
        )}
      </div>
    </section>
  );
}

export default function HgMapContent({ config }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const location = config.locations[activeIndex] || config.locations[0];
  const isHq = activeIndex === 0;

  const routes = useMemo(
    () => (config.directions || []).map(parseDirection),
    [config.directions]
  );

  const navLink = useMemo(() => {
    if (!isHq) return null;
    return config.navLink || getNaverDirectionsUrl();
  }, [config.navLink, isHq]);

  return (
    <div className="hg-map">
      <section className="hg-map__lead">
        <p className="hg-map__eyebrow">Location</p>
        <div className="hg-map__accent" aria-hidden="true" />
        <h2 className="hg-map__headline">
          한화그린으로
          <br />
          오시는 길
        </h2>
        <p className="hg-map__sub">
          본사와 지사 위치를 확인하고, 원하시는 출발 경로로 방문해 주세요.
        </p>
      </section>

      <LocationSwitcher
        locations={config.locations}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
      />

      <section className="hg-map__stage">
        <div className="hg-map__canvas">
          <DaumRoughMapEmbed
            key={location.containerId}
            location={location}
            mapHeight={460}
            removeCont={Boolean(location.removeCont)}
            className="hg-map__embed"
          />
        </div>
        <ContactPanel info={location.info} navLink={navLink} />
      </section>

      {isHq && <DrivingGuide routes={routes} navLink={navLink} />}
    </div>
  );
}
