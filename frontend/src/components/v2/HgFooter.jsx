import { useEffect, useState } from "react";
import Icon from "../Icons";
import { footerInfo } from "../../data/mock";
import { scrollToPageTop } from "../../utils/scrollControl";

export default function HgFooter() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <footer className="hg-footer">
        <div className="hg-footer__accent" aria-hidden="true" />
        <div className="hg-footer__inner">
          <div className="hg-footer__bottom">
            <div className="hg-footer__info">
              <p className="hg-footer__name">(주)한화그린</p>
              <p>축산 환경·폐수처리·플랜트 전문기업</p>
              <p>
                <strong>본사</strong>{" "}
                <a href={footerInfo.mapUrl} target="_blank" rel="noopener noreferrer">
                  {footerInfo.hq?.address || footerInfo.address}
                </a>
              </p>
              {footerInfo.branch && (
                <p>
                  <strong>전라지사</strong> {footerInfo.branch.address}
                </p>
              )}
              <p>
                <a href={`mailto:${footerInfo.email}`}>{footerInfo.email}</a>
              </p>
              <p className="hg-footer__copy">Copyright © (주)한화그린 All Rights Reserved.</p>
            </div>
            <div className="hg-footer__contact">
              <a
                className="hg-footer__phone"
                href={`tel:${footerInfo.phone.replace(/-/g, "")}`}
              >
                본사 {footerInfo.phone}
              </a>
              {footerInfo.branch?.phone && (
                <a
                  className="hg-footer__phone hg-footer__phone--branch"
                  href={`tel:${footerInfo.branch.phone.replace(/-/g, "")}`}
                >
                  전라지사 {footerInfo.branch.phone}
                </a>
              )}
              <p className="hg-footer__hours">{footerInfo.hours}</p>
              <div className="hg-footer__sns">
                <a href={footerInfo.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="유튜브">
                  <Icon name="youtube" size="lg" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <button
        type="button"
        className={`hg-top-btn${showTop ? " is-visible" : ""}`}
        aria-label="페이지 맨 위로"
        tabIndex={showTop ? 0 : -1}
        onClick={() => scrollToPageTop()}
      >
        <span className="hg-top-btn__arrow" aria-hidden="true" />
        <span className="hg-top-btn__label">TOP</span>
      </button>
    </>
  );
}
