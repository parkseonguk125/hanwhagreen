import { useEffect, useMemo, useRef } from "react";
import { HANWHA_GREEN_LOCATION, getNaverDirectionsUrl } from "../config/mapLinks.js";

const NAVER_MAP_SCRIPT_ID = "naver-map-sdk";
const CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID?.trim();

function loadNaverMapScript() {
  if (!CLIENT_ID) {
    return Promise.reject(new Error("VITE_NAVER_MAP_CLIENT_ID 미설정"));
  }
  if (window.naver?.maps) {
    return Promise.resolve();
  }

  if (loadNaverMapScript.promise) {
    return loadNaverMapScript.promise;
  }

  loadNaverMapScript.promise = new Promise((resolve, reject) => {
    const src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(CLIENT_ID)}&submodules=geocoder`;

    const existing = document.getElementById(NAVER_MAP_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("naver map load failed")));
      return;
    }

    const script = document.createElement("script");
    script.id = NAVER_MAP_SCRIPT_ID;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("naver map load failed"));
    document.head.appendChild(script);
  });

  return loadNaverMapScript.promise;
}

function reverseGeocodeKorean(latLng) {
  return new Promise((resolve) => {
    const service = window.naver?.maps?.Service;
    if (!service?.reverseGeocode) {
      resolve("");
      return;
    }

    service.reverseGeocode(
      {
        coords: latLng,
        orders: [
          service.OrderType.ROAD_ADDR,
          service.OrderType.ADDR,
        ].join(","),
      },
      (status, response) => {
        if (status !== service.Status.OK) {
          resolve("");
          return;
        }

        const results = response.v2?.results;
        if (!results?.length) {
          resolve("");
          return;
        }

        const road = results.find((item) => item.name === "roadaddr");
        const jibun = results.find((item) => item.name === "addr");
        const item = road || jibun || results[0];
        const region = item?.region;
        if (!region) {
          resolve("");
          return;
        }

        const land = item.land || {};
        const number =
          land.number1 != null
            ? `${land.number1}${land.number2 ? `-${land.number2}` : ""}`
            : "";

        const parts = [
          region.area1?.name,
          region.area2?.name,
          region.area3?.name,
          region.area4?.name,
          land.name,
          number,
        ].filter(Boolean);

        resolve(parts.join(" ").replace(/\s+/g, " ").trim());
      },
    );
  });
}

export default function NaverMapEmbed({
  className = "",
  height = 300,
  lat,
  lng,
  title,
  address,
  markerLabel,
  resolveAddress = false,
  onAddressResolved,
  openInfoOnLoad = true,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const location = useMemo(() => {
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
      return {
        lat: parsedLat,
        lng: parsedLng,
        name: markerLabel?.trim() || title?.trim() || "출결 위치",
        address: address?.trim() || "",
      };
    }
    return HANWHA_GREEN_LOCATION;
  }, [lat, lng, title, address, markerLabel]);

  useEffect(() => {
    if (!CLIENT_ID || !mapRef.current) return undefined;

    let cancelled = false;

    loadNaverMapScript()
      .then(() => {
        if (cancelled || !mapRef.current || !window.naver?.maps) return;

        const center = new window.naver.maps.LatLng(location.lat, location.lng);
        const mapElement = mapRef.current;

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new window.naver.maps.Map(mapElement, {
            center,
            zoom: 16,
            minZoom: 10,
            maxZoom: 19,
            mapTypeId: window.naver.maps.MapTypeId.NORMAL,
            zoomControl: true,
            zoomControlOptions: {
              position: window.naver.maps.Position.RIGHT_CENTER,
            },
            scaleControl: true,
            mapDataControl: false,
            draggable: true,
            pinchZoom: true,
            scrollWheel: true,
            keyboardShortcuts: true,
          });

          markerRef.current = new window.naver.maps.Marker({
            position: center,
            map: mapInstanceRef.current,
            title: location.name,
          });

          infoWindowRef.current = new window.naver.maps.InfoWindow({
            maxWidth: 280,
            backgroundColor: "#fff",
            borderColor: "#ccc",
            borderWidth: 1,
            anchorSize: new window.naver.maps.Size(10, 10),
            pixelOffset: new window.naver.maps.Point(0, -8),
          });

          window.naver.maps.Event.addListener(markerRef.current, "click", () => {
            if (!infoWindowRef.current) return;
            infoWindowRef.current.setContent(buildInfoContent(location.name, location.address));
            infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
          });

          resizeObserverRef.current = new ResizeObserver(() => {
            if (mapInstanceRef.current) {
              window.naver.maps.Event.trigger(mapInstanceRef.current, "resize");
            }
          });
          resizeObserverRef.current.observe(mapElement);

          window.requestAnimationFrame(() => {
            if (mapInstanceRef.current) {
              window.naver.maps.Event.trigger(mapInstanceRef.current, "resize");
            }
          });
        } else {
          mapInstanceRef.current.setCenter(center);
          markerRef.current?.setPosition(center);
        }

        if (openInfoOnLoad && infoWindowRef.current && markerRef.current) {
          infoWindowRef.current.setContent(
            buildInfoContent(location.name, location.address),
          );
          infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
        }

        if (resolveAddress) {
          reverseGeocodeKorean(center).then((resolved) => {
            if (cancelled) return;
            onAddressResolved?.(resolved || "");
            if (
              resolved &&
              infoWindowRef.current &&
              markerRef.current &&
              mapInstanceRef.current
            ) {
              infoWindowRef.current.setContent(buildInfoContent(location.name, resolved));
            }
          });
        }
      })
      .catch(() => {
        /* offline / key missing — fallback UI below */
      });

    return () => {
      cancelled = true;
    };
  }, [location.lat, location.lng, resolveAddress, openInfoOnLoad]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    markerRef.current.setTitle(location.name);
    if (infoWindowRef.current?.getMap()) {
      infoWindowRef.current.setContent(
        buildInfoContent(location.name, location.address),
      );
    }
  }, [location.name, location.address]);

  useEffect(
    () => () => {
      resizeObserverRef.current?.disconnect();
      infoWindowRef.current?.close();
      mapInstanceRef.current = null;
      markerRef.current = null;
      infoWindowRef.current = null;
    },
    [],
  );

  if (!CLIENT_ID) {
    return (
      <div className={`live-map-fallback ${className}`} style={{ minHeight: height }}>
        <p>네이버 지도 API 키가 설정되지 않았습니다.</p>
        <a href={getNaverDirectionsUrl()} target="_blank" rel="noopener noreferrer">
          네이버 지도에서 위치 보기
        </a>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`live-map-embed ${className}`}
      style={{
        width: "100%",
        minHeight: height,
        height,
      }}
      role="img"
      aria-label={`${location.name} 위치 지도`}
    />
  );
}

function buildInfoContent(name, address) {
  const safeName = escapeHtml(name);
  const safeAddress = address ? `<p>${escapeHtml(address)}</p>` : "";
  return `<div class="live-map-infowin"><strong>${safeName}</strong>${safeAddress}</div>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
