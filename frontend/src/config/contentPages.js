import { boardBanners } from "../config/boardBanners";
import { HANWHA_GREEN_NAVER_DIRECTIONS_URL } from "./mapLinks.js";

export const contentPageConfigs = {
  company: {
    coId: "company",
    pageId: "company",
    title: "회사소개",
    navTitle: "회사소개",
    navGroupIndex: 0,
    banner: boardBanners.company,
    bannerAsBackground: true,
    visualSubtitle: "다년간의 노하우와 경험으로 가장최적화된 기술력을 선보입니다.",
    introHtml:
      "한화그린은 녹색환경의 선두주자로<br />환경 효율화 사업을 추진하며<br />기술협력을 통한 지속적으로 성장하는 벤처기업입니다.",
    videos: [
      "https://www.youtube.com/embed/2miCfR4OQJU",
      "https://www.youtube.com/embed/wnj6C5LBa80",
      "https://www.youtube.com/embed/dU2SQylDQqw",
    ],
    downloads: [
      {
        label: "회사소개서",
        href: "https://hanwhagreen.com/data/(주)한화그린 기술소개서_2024.03.20.pptx",
      },
      {
        label: "공사지명원",
        href: "https://hanwhagreen.com/data/25.05 한화그린 공사지명원.pptx",
      },
    ],
    divisions: [
      {
        title: "건설, 플랜트사업부",
        image: "https://hanwhagreen.com/img/signboard1.jpg",
      },
      {
        title: "환경, 에너지사업부",
        image: "https://hanwhagreen.com/img/signboard2.jpg",
      },
      {
        title: "기계, 전기사업부",
        image: "https://hanwhagreen.com/img/signboard3.jpg",
      },
    ],
    defaultDivisionImage: "https://hanwhagreen.com/theme/FT_WEB50/img/sub_com01.jpg",
  },
  ceo: {
    coId: "ceo",
    pageId: "ceo",
    title: "인사말",
    navTitle: "인사말",
    navGroupIndex: 0,
    banner: boardBanners.ceo,
    bannerAsBackground: true,
    photoUrl: "https://hanwhagreen.com/theme/FT_WEB50/img/ceo_img01.jpg",
    headingHtml: "창의적인 아이디어를 통해<br />새로운 가치를 만들어 갑니다",
    welcome: "한화그린에 오신걸 환영합니다",
    bodyHtml: `한화그린은 양돈·도축 현장의 깨끗한 축사환경 건설, 생산원가 절감시설, 효율적 ICT 생산관리,<span class="mo_br"></span>
에너지 자가생산과 탄소저감까지 현장에 필요한 환경·플랜트 기술을 설계하고 시공합니다.<span class="mo_br"></span>
대표의 양돈 현장 경험과 회사의 시공 역량을 바탕으로 스마트팜축사, 액비순환, 정화방류, 재활용수, 바이오커튼, 바이오가스, 태양광에너지, 방역·탄소저감 기술을 조합해<span class="mo_br"></span>
농장주분들에게 실질적인 시설 방안을 제시하겠습니다.<span class="mo_br"></span>
한화그린은 선진양돈으로 이끌어 준 대한민국 양돈인 여러분들을 존경합니다.<span class="mo_br"></span>
저희들이 여러분의 동반자가 되겠습니다.<span class="mo_br"></span>
감사합니다.<span class="mo_br"></span>`,
    signature: "(주)한화그린 대표이사 김용우 및 임직원 일동",
  },
  map: {
    coId: "map",
    pageId: "map",
    title: "오시는 길",
    navTitle: "오시는길",
    navGroupIndex: 0,
    banner: boardBanners.map,
    bannerAsBackground: true,
    navLink: HANWHA_GREEN_NAVER_DIRECTIONS_URL,
    locations: [
      {
        containerId: "daumRoughmapContainer1713010532775",
        timestamp: "1713010532775",
        key: "2ixbo",
        info: {
          name: "한화그린",
          fields: [
            { label: "ADDRESS", value: "경북 칠곡군 가산면 송학5길 57-1" },
            { label: "Tel", value: "054-977-4700" },
            { label: "Fax", value: "054-977-4701" },
          ],
        },
      },
      {
        containerId: "daumRoughmapContainer1756457907165",
        timestamp: "1756457907165",
        key: "886jjm5y48g",
        removeCont: true,
        info: {
          name: "한화그린 전라지사",
          fields: [
            { label: "ADDRESS", value: "전북 전주시 덕진구 진버들1길 52" },
            { label: "상담문의", value: "010-2372-9059" },
          ],
        },
      },
    ],
    directions: [
      "서울방향에서 오실때 : 한남대교남단에서 올림픽대로 방면으로 오른쪽 도시고속도로 진입 -> 강일IC에서 수도권제1순환선, 대전, 판교 방면으로 오른쪽 고속도로 진입 -> 도개IC에서 상주, 선산 방면으로 오른쪽 고속도로 출구 -> 도계톨게이트 (통행료 10,100원) -> 도개IC교차로에서 대구방면으로 좌회전 -> 송학리, 심곡리 방면으로 오른쪽 방향 -> 송학5길 방면으로 좌회전 -> 한화그린 도착",
      "전남광주 방향에서 오실때 : 중외공원입구에서 서울,대전,부산 방면으로 오른쪽 고속도로 진입 -> 금호분기점에서 안동 방면으로 왼쪽 방향 -> 가산IC에서 구미,가산 방면으로 오른쪽 고속도로 출구 -> 가산톨게이트 (통행료 10,700원) -> 가산IC에서 상주,선산,구미 방면으로 오른쪽 방향 -> 심곡교차로에서 가산, 송학리 방면으로 우회전 -> 한화그린 도착",
      "통영방향에서 오실때 : 통영IC에서 통영IC 방면으로 오른쪽 고속도로 진입 -> 고성IC에서 창원,고성 방면으로 오른쪽 고속도로 출구 -> 고성IC에서 창원,배둔 방면으로 오른쪽 방향 -> 호산교차로에서 부산,창원 방면으로 왼쪽 도로 주행 -> 현동교차로에서 창녕,내서IC,부산 방면으로 오른쪽 방향 -> 함안,내서IC 방면으로 고가차도 오른쪽 옆길 -> 내서IC에서 대구,진주 방면으로 왼쪽 고속도로 진입 -> 금호분기점에서 안동 방면으로 왼쪽 방향 -> 가산IC에서 구미,가산 방면으로 오른쪽 고속도로 출구 -> 가산톨게이트(통행료 5,900원) -> 가산IC에서 상주,선산,구미 방면으로 오른쪽 방향 -> 심곡교차로에서 가산,송학리 방면으로 우회전 -> 송학5길 방면으로 좌회전 -> 한화그린 도착",
    ],
  },
  technology: {
    coId: "technology",
    pageId: "technology",
    title: "보유기술",
    navTitle: "보유기술",
    navGroupIndex: 1,
    banner: boardBanners.technology,
    bannerAsBackground: true,
    items: [
      {
        title: "액비순환시스템",
        desc: "처음부터 미생물 투입이 없는 돈사순환 공정으로 악취제거 및 다단계 액비생산",
        image: "/img/recycle.png",
      },
      {
        title: "돈사내 미생물",
        desc: "처음부터 미생물 투입이 없는 돈사순환 공정으로 악취제거 및 다단계 액비생산",
        video: "https://www.youtube.com/embed/4MjzihYhk54",
      },
      {
        title: "무퇴비 시스템",
        descHtml:
          "- 슬러지 발생향 1% 미만 유지<br>\n- 협잡물만 제거된 고형물을 생물반응조에 유입시켜 분해함으로써, 전처리에 응집제를 사용하여 고형물을 걷어 내고 처리하는 화학적처리 보다 슬러지발생량(고형물 발생량)이 크게 감소<br>\n- 친환경 퇴비를 활용하여 지렁이 사육연계로 지역주민의 소득 증대",
        image: "/img/NoCompostSystem.png",
      },
      {
        title: "정화방류 시스템",
        descHtml:
          "1. 1차 부상조<br/>\n2. 2차 오존처리(소독수, 세척수)<br/>\n3. 3차 RO 처리<br/>\n4. 농업용수",
        image: "/img/systemMap.png",
      },
      {
        title: "폐열 회수 시스템",
        desc: "대기로 버려지거나 방출될 수 있는 열 에너지를 회수하여 재사용하므로 농가는 에너지 비용 및 CO2 배출량 절감과 동시에 에너지 효율을 높일 수 있으며 기숙사, 농장 등 온수를 필요로 하는 장소에서 언제든 사용",
        image: "/img/energyRecovery.png",
      },
      {
        title: "바이오가스 플랜트 및 태양광",
        descHtml:
          "탄소중립 이행을 위해 축산분야의 온실가스 감축 책임이 무거워지고, 돼지의 경우 일정 사육규모(1만마리) 이상 농가를 의무생산자를 지정하여<br/>\n2026년 1월 1일부터 바이오가스 생산 목표 미달성시 부담금을 징수한다.<br/>\n이러한 환경변화에 따라서 한화그린에서도 바이오가스 플랜트를 도입했다",
        image: "/img/bioGas.png",
      },
      {
        title: "쿨링 미스트(안개문무기), 바이오커튼",
        descHtml:
          "1. 1차 실내 쿨링(29°C)<br/>\n2. 돈방내 돼지에 쿨링미스트가 바로 닿지 않도록 배관상부로 배출<br/>\n3. 2차 실내 쿨링(25°C)<br/>\n4. 외부 쿨링(약5°C 차이)및 악취저감",
        image: "/img/coolingMist.png",
      },
      {
        title: "축사스마트팜",
        image: "/img/smartfarm.png",
      },
    ],
    goals: [
      "액비 순환을 통한 악취 저감과 생산성 향상",
      "고품질 다단계 액비 생산으로 살포 비수기 대응",
      "정화방류·재활용수를 통한 친환경 폐수처리",
      "작물별 액비 살포로 생산비 절감",
      "악취 저감으로 민원 예방",
      "친환경 퇴비를 활용한 지렁이 사육 연계",
      "효율적인 분뇨처리시설로 현장 운영 부담 완화",
      "악취 저감을 통한 양돈산업의 주민 친화성 향상",
    ],
    overview: [
      "기존 농장에 고속산화조·폭기조를 추가하거나 기존 시설을 개선해 액비순환과 악취 저감 공정을 구성합니다.",
      "다단계 액비를 돈사 내로 순환해 악취를 줄이고 농장 환경을 개선합니다.",
      "고도처리 설비를 통해 정화방류와 재활용수를 활용합니다.",
      "방류를 준비하는 농가에 안정적인 수질 관리가 가능하도록 지원합니다.",
    ],
  },
  construction: {
    coId: "construction",
    pageId: "board_list01",
    pageClassName: "construction-page",
    title: "공사실적",
    navTitle: "공사실적",
    navGroupIndex: 2,
    banner: boardBanners.construction,
    bannerAsBackground: true,
  },
};

export function getContentPageConfig(coId) {
  return contentPageConfigs[coId] ?? null;
}
