import { useEffect, useRef, useState } from "react";
import DetailButton from "./DetailButton";
import Icon from "./Icons";
import { areaTabs, assets } from "../data/mock";

const cloneCreditLines = [
  "이 사이트는 클론 코딩으로 모방한",
  "홈페이지 작업물 입니다.",
  "작업자 : 박성욱",
];

const areaLinks = [
  "/bbs/content.php?co_id=company",
  "/bbs/content.php?co_id=construction",
  "/bbs/content.php?co_id=technology",
];

export default function AreaSection() {
  const [activeTab, setActiveTab] = useState(0);
  const titleRef = useRef(null);

  useEffect(() => {
    const playTitleAnimation = (root) => {
      root?.querySelectorAll(".area_tit_ani").forEach((el, i) => {
        setTimeout(() => el.classList.add("on"), i * 180);
      });
    };

    if (titleRef.current) {
      playTitleAnimation(titleRef.current);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          playTitleAnimation(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="section area">
      <div className="inner">
        <div className="area_tit_wrap" ref={titleRef}>
          <div className="area_tit">
            {cloneCreditLines.map((line) => (
              <div className="area_tit_ani clone-credit-line" key={line}>
                <p className="title">{line}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="area_contents">
          <div className="area_con_wrap">
            <div className="area_tab">
              <ul>
                {areaTabs.map((tab) => (
                  <li
                    key={tab.id}
                    className={activeTab === tab.id ? "on" : ""}
                    style={{ width: "33.3%" }}
                    onMouseEnter={() => setActiveTab(tab.id)}
                    onFocus={() => setActiveTab(tab.id)}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </li>
                ))}
              </ul>
            </div>

            {areaTabs.map((tab) => (
              <div
                key={tab.id}
                className={`area_con background ${activeTab === tab.id ? "on" : ""}`}
                style={{
                  backgroundImage: `url('${assets.areaPanels[tab.id]}')`,
                }}
              >
                <div className="area_con_tit">
                  <Icon name="eco-energy" size="xl" className="area-eco-icon" />
                  <p dangerouslySetInnerHTML={{ __html: tab.text }} />
                  <DetailButton href={areaLinks[tab.id]} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
