import { useRef } from "react";
import { useHgVisionScroll } from "./hooks";

export default function HgVisionBand() {
  const scrollRef = useRef(null);
  const lines = [
    "환경 기술력으로 여는",
    "성공적인 미래",
    "글로벌 친환경 솔루션의 선두주자",
  ];

  useHgVisionScroll(scrollRef);

  return (
    <div className="hg-vision-scroll" ref={scrollRef}>
      <div className="hg-vision-sticky">
        <section className="hg-vision" aria-label="비전">
          <div className="hg-vision__bg" aria-hidden="true">
            <div className="hg-vision__orb hg-vision__orb--1" />
            <div className="hg-vision__orb hg-vision__orb--2" />
            <div className="hg-vision__grid" />
          </div>
          <div className="hg-vision__inner">
            <p className="hg-vision__eyebrow">Hanwha Green</p>
            <div className="hg-vision__lines" aria-hidden="true">
              {lines.map((line, lineIdx) => (
                <span key={line} className="hg-vision__line">
                  {line.split("").map((char, i) => (
                    <span
                      key={`${line}-${i}`}
                      className="hg-vision__char"
                      style={{ animationDelay: `${lineIdx * 0.35 + i * 0.03}s` }}
                    >
                      {char === " " ? "\u00a0" : char}
                    </span>
                  ))}
                </span>
              ))}
            </div>
            <div className="hg-vision__divider" aria-hidden="true" />
            <p className="hg-vision__tagline">
              Beyond Waste <span>Forward to Green</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
