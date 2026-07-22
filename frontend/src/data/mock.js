import { HANWHA_GREEN_NAVER_DIRECTIONS_URL } from "../config/mapLinks.js";

const ASSET = "https://hanwhagreen.com";

export const assets = {
  logoBlack: `${ASSET}/html/typhoon_html/images/hd_logo_black.png`,
  logoWhite: `${ASSET}/html/typhoon_html/images/hd_logo.png`,
  heroSlides: [
    `${ASSET}/theme/FT_WEB50/img/main_pig_with_green.jpg`,
    `${ASSET}/theme/FT_WEB50/img/main_slide_02.jpg`,
    `${ASSET}/theme/FT_WEB50/img/main_slide_03.jpg`,
  ],
  areaPanels: [
    `${ASSET}/theme/FT_WEB50/img/area_con01.jpg`,
    `${ASSET}/theme/FT_WEB50/img/area_con02.jpg`,
    `${ASSET}/theme/FT_WEB50/img/area_con04.jpg`,
  ],
  galleryBg: `${ASSET}/theme/FT_WEB50/img/gall_Back.jpg`,
  /* 홈 히어로·영역과 겹치지 않는 문의 밴드용 대체 이미지 */
  inquiryBg:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2000&q=80",
};

export const topLinks = [
  { label: "회사소개", href: "/bbs/content.php?co_id=company", icon: "at" },
  { label: "공지사항", href: "/bbs/board.php?bo_table=notice", icon: "mega-phone" },
  { label: "고객센터", href: "/bbs/board.php?bo_table=qa", icon: "headphone" },
  { label: "보유기술", href: "/bbs/content.php?co_id=technology", icon: "badge" },
];

export const navGroups = [
  {
    title: "회사소개",
    items: [
      { label: "회사소개", href: "/bbs/content.php?co_id=company" },
      { label: "인사말", href: "/bbs/content.php?co_id=ceo" },
      { label: "오시는길", href: "/bbs/content.php?co_id=map" },
    ],
  },
  { title: "보유기술", items: [{ label: "보유기술", href: "/bbs/content.php?co_id=technology" }] },
  {
    title: "회사실적",
    items: [
      { label: "공사실적", href: "/bbs/content.php?co_id=construction" },
      { label: "주요실적", href: "/bbs/board.php?bo_table=project" },
    ],
  },
  { title: "인증·특허", items: [{ label: "인증서", href: "/bbs/board.php?bo_table=certification" }] },
  {
    title: "고객센터",
    items: [
      { label: "공지사항", href: "/bbs/board.php?bo_table=notice" },
      { label: "온라인문의", href: "/bbs/board.php?bo_table=qa" },
      { label: "출결서비스", href: "/bbs/board.php?bo_table=attendance" },
    ],
  },
];

export const introLines = [
  "이 사이트는 클론 코딩으로 모방한",
  "홈페이지 작업물 입니다.",
  "작업자 : 박성욱",
];

export const areaTabs = [
  {
    id: 0,
    label: "회사소개",
    text: "한화그린은 환경을 우선으로<br> 최적화된 새로운 정화기술을 제시합니다.",
  },
  {
    id: 1,
    label: "공사실적",
    text: "한화그린은 다양한 수처리, 에너지화 현장에<br> 최적화된 혁신적인 기술과 솔루션을 제시합니다.",
  },
  {
    id: 2,
    label: "보유기술",
    text: "한화그린은 많은 현장경험으로<br> 자체 기술력을 보유하고 있습니다.",
  },
];

import { projects as allProjects } from "./projects.js";
import { certifications as allCertifications } from "./certifications.js";

export const projects = allProjects.slice(0, 8);

export const certificates = allCertifications.slice(0, 8).map((item) => ({
  id: item.id,
  title: item.title,
  desc: item.content || item.subject,
  image: item.image,
}));

export const promoVideos = [
  {
    id: 3,
    title: "한화그린 농장폐수 농업기술 폐수처리 하수처리 액비화",
    desc: "한화그린 농장폐수 농업기술 폐수처리 하수처리 액비화",
    image: `${ASSET}/data/file/news/thumb-9cdfc0fc5d82328c0a1e999cc9468361_NYyQHwS5_3243b4b9e834dae13fe6c731943561660c8e3ffc_331x290.jpg`,
  },
  {
    id: 2,
    title: "[채영국의 한돈사랑TV - 현장검증기] 한돈농가 최대숙원! 악취문제 전격해결!",
    desc: "[채영국의 한돈사랑TV - 현장검증기] 한돈농가 최대숙원! 악취문제 전격해결!",
    image: `${ASSET}/data/file/news/thumb-9cdfc0fc5d82328c0a1e999cc9468361_R26MGEHV_9616802bc0a0eff2f62f7a0e987bda6c65651aaf_331x290.jpg`,
  },
];

export const notices = [
  { title: "한화그린 홈페이지 리뉴얼", date: "04-11" },
];

export const noticeItem = notices[0];

export const footerInfo = {
  address: "경북 칠곡군 가산면 송학5길 57-1",
  email: "hanwhagreen@hanmail.net",
  phone: "054-977-4700",
  hours: "월~금 07:30 ~ 16:30",
  mapUrl: HANWHA_GREEN_NAVER_DIRECTIONS_URL,
  youtubeUrl:
    "https://www.youtube.com/@%ED%95%9C%ED%99%94%EA%B7%B8%EB%A6%B0%EC%A3%BC%EC%8B%9D%ED%9A%8C%EC%82%AC",
  hq: {
    label: "본사",
    region: "경북 칠곡",
    address: "경북 칠곡군 가산면 송학5길 57-1",
    phone: "054-977-4700",
    hours: "월~금 07:30 ~ 16:30",
  },
  branch: {
    label: "전라지사",
    region: "전북 전주",
    address: "전북 전주시 덕진구 진버들1길 52",
    phone: "010-2372-9059",
    hours: "상담 시 사전 연락",
  },
};
