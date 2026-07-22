import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "../public/img/pillars");
const candDir = path.join(dir, "_candidates");

/**
 * Storyset Amico — Freepik License (상업 사용 가능, 출처 표기 권장)
 * https://storyset.com
 *
 * 1 악취 저감     Air pollution — 공장·연기(악취·배출) 장면
 * 2 슬러지 저감   Compost cycle — 폐기물 분해·퇴비화
 * 3 약품 최소화   Hazardous waste — 화학약품·위험물 드럼(약품 의존 축소)
 * 4 자원 순환     Water cycle — 물·자연 순환
 */
const SOURCES = {
  odor: {
    file: "odor-airpollution.svg",
    url: "https://stories.freepiklabs.com/storage/47029/Air-Pollution_Mesa-de-trabajo-1.svg",
    stripPeople: true,
    note: "storyset/air-pollution (amico)",
  },
  sludge: {
    file: "sludge-compost.svg",
    url: "https://stories.freepiklabs.com/storage/58103/Compost-Cycle_Mesa-de-trabajo-1.svg",
    stripPeople: true,
    note: "storyset/compost-cycle (amico)",
  },
  chem: {
    file: "chem-hazard.svg",
    url: "https://stories.freepiklabs.com/storage/31805/Hazardous-Waste-(1)_Mesa-de-trabajo-1.svg",
    stripPeople: true,
    note: "storyset/hazardous-waste (amico)",
  },
  cycle: {
    file: "cycle-water.svg",
    url: "https://stories.freepiklabs.com/storage/54701/Water-Cycle_Mesa-de-trabajo-1.svg",
    stripPeople: true,
    note: "storyset/water-cycle (amico)",
  },
};

/* Storyset 기본 보라 → 한화그린 톤 */
const replacements = [
  [/#BA68C8/gi, "#7CB88A"],
  [/#9C27B0/gi, "#6AAF78"],
  [/#AB47BC/gi, "#7CB88A"],
  [/#CE93D8/gi, "#A8D4B2"],
  [/#E1BEE7/gi, "#C8E6CF"],
  [/#8E24AA/gi, "#5FA06E"],
  [/#7B1FA2/gi, "#549665"],
  [/#6A1B9A/gi, "#4A8A5C"],
  [/#F3E5F5/gi, "#E8F5EC"],
  [/rgb\(\s*186\s*,\s*104\s*,\s*200\s*\)/gi, "rgb(124, 184, 138)"],
];

const PEOPLE_ID =
  /^(character|chartacter|characters|boy|girl|person|people|human|man|woman|arm|arms|leg|legs|head|hair|chest|face|body|hand|hands|driver|tie|briefcase)([-_]|$)/i;

function stripPeopleGroups(svg) {
  let out = svg;
  let guard = 0;
  while (guard++ < 100) {
    const re = /<g\b[^>]*\bid="([^"]+)"[^>]*>/gi;
    let found = null;
    let m;
    while ((m = re.exec(out))) {
      if (PEOPLE_ID.test(m[1])) {
        found = { index: m.index, open: m[0] };
        break;
      }
    }
    if (!found) break;

    const start = found.index;
    let i = start + found.open.length;
    let depth = 1;
    while (i < out.length && depth > 0) {
      const nextOpen = out.indexOf("<g", i);
      const nextClose = out.indexOf("</g>", i);
      if (nextClose < 0) break;
      if (nextOpen >= 0 && nextOpen < nextClose) {
        depth += 1;
        i = nextOpen + 2;
      } else {
        depth -= 1;
        i = nextClose + 4;
      }
    }
    out = out.slice(0, start) + out.slice(i);
  }
  return out;
}

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
};

fs.mkdirSync(dir, { recursive: true });
fs.mkdirSync(candDir, { recursive: true });

for (const [name, meta] of Object.entries(SOURCES)) {
  const candPath = path.join(candDir, meta.file);
  let text;
  if (fs.existsSync(candPath) && fs.statSync(candPath).size > 1000) {
    text = fs.readFileSync(candPath, "utf8");
    console.log(`${name}: reuse candidate ${meta.file}`);
  } else {
    const res = await fetch(meta.url, { headers });
    if (!res.ok) throw new Error(`download failed ${name}: ${res.status}`);
    text = await res.text();
    fs.writeFileSync(candPath, text);
    console.log(`${name}: downloaded`);
  }

  if (meta.stripPeople) text = stripPeopleGroups(text);
  for (const [from, to] of replacements) text = text.replace(from, to);

  const out = path.join(dir, `${name}.svg`);
  fs.writeFileSync(out, text);

  const peopleLeft = (
    text.match(/\bid="[^"]*(?:[Cc]haracter|[Bb]oy|[Gg]irl)[^"]*"/g) || []
  ).length;
  console.log(
    `${name}: ${meta.note} | peopleIdsLeft=${peopleLeft} bytes=${text.length}`
  );
}
