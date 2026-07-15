import NaverMapEmbed from "../NaverMapEmbed.jsx";
import { HANWHA_GREEN_LOCATION, getNaverDirectionsUrl } from "../../config/mapLinks.js";

export default function CompanyMapPanel() {
  return (
    <article className="live-panel live-panel-map">
      <header className="live-panel-header">
        <h3>한화그린 위치</h3>
        <a
          className="live-map-link"
          href={getNaverDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
        >
          네이버 길찾기
        </a>
      </header>
      <div className="live-panel-body">
        <p className="live-map-address">{HANWHA_GREEN_LOCATION.address}</p>
        <NaverMapEmbed className="live-map-embed-panel" />
      </div>
    </article>
  );
}
