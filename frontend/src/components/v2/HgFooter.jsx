import { useEffect, useState } from "react";
import Icon from "../Icons";
import { footerInfo } from "../../data/mock";
import { scrollToPageTop } from "../../utils/scrollControl";

export default function HgFooter() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
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
              <p>{footerInfo.address}</p>
              <p>{footerInfo.email}</p>
              <p className="hg-footer__copy">Copyright © (주)한화그린 All Rights Reserved.</p>
            </div>
            <div className="hg-footer__contact">
              <p className="hg-footer__phone">대표전화 {footerInfo.phone}</p>
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
      {showTop && (
        <button
          type="button"
          className="hg-top-btn"
          aria-label="상단으로"
          onClick={scrollToPageTop}
        >
          <Icon name="arrow-up" size="md" />
          TOP
        </button>
      )}
    </>
  );
}
