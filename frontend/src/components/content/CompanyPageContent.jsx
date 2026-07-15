import { useState } from "react";

const DOWNLOAD_ICON =
  "https://hanwhagreen.com/html/typhoon_html/images/file_download.png";

export default function CompanyPageContent({ config }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [displayImage, setDisplayImage] = useState(config.defaultDivisionImage);

  const handleDivisionClick = (index, image) => {
    setActiveIndex(index);
    setDisplayImage(image);
  };

  return (
    <div className="sec1">
      <div className="sec1-inner">
        <div className="sec1-tit">
          <dl>
            <dt dangerouslySetInnerHTML={{ __html: config.introHtml }} />
          </dl>
        </div>
        <div className="sec1-contents">
          {config.videos.map((src) => (
            <div key={src} className="embed-responsive embed-responsive-16by9">
              <iframe
                className="embed-responsive-item"
                src={src}
                title="YouTube video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      </div>

      <div className="sec1" id="faq">
        <div className="sec1-inner company-faq-inner">
          <div className="listForm">
            <ul>
              {config.downloads.map((item) => (
                <li
                  key={item.label}
                  className="qa_li"
                  onClick={() => {
                    window.location.href = item.href;
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      window.location.href = item.href;
                    }
                  }}
                  role="link"
                  tabIndex={0}
                >
                  <div className="question">
                    <div className="lf_box">
                      <p className="faq_icon company-download-icon">
                        <img src={DOWNLOAD_ICON} alt="btn-img" width={40} height={40} />
                      </p>
                      <p className="tit">{item.label}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="sec3-inner">
        <div className="sec3-lt">
          <h3>한화그린의 사업부</h3>
          <ul>
            {config.divisions.map((division, index) => (
              <li
                key={division.title}
                className={activeIndex === index ? "active" : ""}
                data-img={division.image}
                onClick={() => handleDivisionClick(index, division.image)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleDivisionClick(index, division.image);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <dl>
                  <dt>
                    {division.title}{" "}
                    <span>
                      <i className="xi-angle-down-min" aria-hidden="true" />
                    </span>
                  </dt>
                </dl>
              </li>
            ))}
          </ul>
        </div>
        <div className="sec3-img">
          <img src={displayImage} alt="img" />
        </div>
      </div>
    </div>
  );
}
