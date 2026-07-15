import NaverMapEmbed from "../NaverMapEmbed.jsx";
import { HANWHA_GREEN_LOCATION, getNaverDirectionsUrl } from "../../config/mapLinks.js";

export default function HgMapPanel() {
  return (
    <article className="hg-live__panel hg-live__panel--wide">
      <header className="hg-live__panel-head">
        <h3 className="hg-live__panel-title">한화그린 위치</h3>
        <a
          href={getNaverDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="hg-link-arrow"
        >
          네이버 길찾기 →
        </a>
      </header>
      <p className="hg-body-sm" style={{ marginBottom: "1rem" }}>
        {HANWHA_GREEN_LOCATION.address}
      </p>
      <div className="hg-map__embed">
        <NaverMapEmbed />
      </div>
    </article>
  );
}
