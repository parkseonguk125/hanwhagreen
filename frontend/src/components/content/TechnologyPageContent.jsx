import { useState, useEffect } from "react";
import AOS from "aos";

const PLAY_BTN =
  "https://hanwhagreen.com/html/typhoon_html/images/play-btn.png";
const FAQ_ARROW =
  "https://hanwhagreen.com/theme/FT_WEB50/skin/board/faq/img/faq_arrow.png";

function TechnologyAnswer({ item }) {
  return (
    <div className="lf_box">
      {item.desc && <p className="tit">{item.desc}</p>}
      {item.descHtml && (
        <p
          className="tit"
          dangerouslySetInnerHTML={{ __html: item.descHtml }}
        />
      )}
      {item.video && (
        <div className="embed-responsive embed-responsive-16by9">
          <iframe
            className="embed-responsive-item"
            src={item.video}
            title={item.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      {item.image && (
        <div className="img_box2">
          <img src={item.image} style={{ width: "100%" }} alt="" />
        </div>
      )}
    </div>
  );
}

export default function TechnologyPageContent({ config }) {
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    AOS.refresh();
  }, []);

  const toggleItem = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <>
      <section className="listSkin">
        <div className="inner">
          <div id="bo_list">
            <div className="listForm">
              <ul>
                {config.items.map((item, index) => {
                  const isOpen = openIndex === index;

                  return (
                    <li key={item.title} className="qa_li">
                      <div
                        className={`question${isOpen ? " on" : ""}`}
                        onClick={() => toggleItem(index)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleItem(index);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-expanded={isOpen}
                      >
                        <div className="lf_box">
                          <p className="faq_icon" style={{ background: "none" }}>
                            <img
                              src={PLAY_BTN}
                              alt="btn-img"
                              style={{ width: 40, height: 40 }}
                            />
                          </p>
                          <p className="tit">{item.title}</p>
                        </div>
                        <div className="rt_box">
                          <span>
                            <img src={FAQ_ARROW} alt="" />
                          </span>
                        </div>
                      </div>
                      <div className={`answer${isOpen ? " on" : ""}`}>
                        <TechnologyAnswer item={item} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="sub sub02" id="business2">
        <div className="sec1">
          <div className="sec3-inner">
            <ul>
              <li data-aos="fade-up">
                <h4>기술목표</h4>
                <dl style={{ height: "auto" }}>
                  {config.goals.map((goal) => (
                    <dd key={goal}>
                      <span>•</span> {goal}
                    </dd>
                  ))}
                </dl>
              </li>
              <li data-aos="fade-up" data-aos-delay="200">
                <h4>기술개요</h4>
                <dl style={{ height: "auto" }}>
                  {config.overview.map((item) => (
                    <dd key={item}>
                      <span>•</span> {item}
                    </dd>
                  ))}
                </dl>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
