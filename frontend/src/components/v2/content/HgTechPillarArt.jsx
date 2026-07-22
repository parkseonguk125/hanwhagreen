/** 미리캔버스 제공 일러스트 4컷 (악취→슬러지→약품→순환) */
const ASSET_VERSION = "11";

const ART = {
  악취: {
    src: `/img/pillars/odor.png?v=${ASSET_VERSION}`,
    label: "악취 저감",
  },
  퇴비: {
    src: `/img/pillars/sludge.png?v=${ASSET_VERSION}`,
    label: "슬러지 저감",
  },
  약품: {
    src: `/img/pillars/chem.png?v=${ASSET_VERSION}`,
    label: "약품 사용 최소화",
  },
  순환: {
    src: `/img/pillars/cycle.png?v=${ASSET_VERSION}`,
    label: "자원 순환",
  },
};

export default function HgTechPillarArt({ type }) {
  const art = ART[type] || ART.악취;

  return (
    <div className="hg-tech__why-art" aria-hidden="true">
      <img
        className="hg-tech__why-art-img"
        src={art.src}
        alt=""
        width={504}
        height={504}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
