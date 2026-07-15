import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Icon from "./Icons";
import SlideToggle from "./common/SlideToggle";
import { assets, footerInfo } from "../data/mock";
import { preloadBannerForHref } from "../utils/preloadImage";

export default function Footer() {
  const [familyOpen, setFamilyOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <footer id="footer">
        <div className="foo-inner">
          <div className="logo">
            <img src={assets.logoBlack} alt="logo" />
          </div>
          <div className="foo-info">
            <div className="foo-tp">
              <ul>
                <li>
                  <Link
                    to="/bbs/content.php?co_id=company"
                    onMouseEnter={() =>
                      preloadBannerForHref("/bbs/content.php?co_id=company")
                    }
                    onFocus={() =>
                      preloadBannerForHref("/bbs/content.php?co_id=company")
                    }
                  >
                    회사소개
                  </Link>
                </li>
                <li>
                  <Link
                    to="/bbs/content.php?co_id=technology"
                    onMouseEnter={() =>
                      preloadBannerForHref("/bbs/content.php?co_id=technology")
                    }
                    onFocus={() =>
                      preloadBannerForHref("/bbs/content.php?co_id=technology")
                    }
                  >
                    보유기술
                  </Link>
                </li>
                <li>
                  <a
                    href={footerInfo.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    오시는길
                  </a>
                </li>
              </ul>
              <div
                className="family-tab"
                onClick={() => setFamilyOpen((v) => !v)}
              >
                <p>FAMILY SITE</p>
                <Icon name="chevron-right" size="md" className="family-icon" />
                <SlideToggle open={familyOpen} as="ul" className="f-tab">
                  <li>
                    <a href="https://www.naver.com/" target="_blank" rel="noopener noreferrer">
                      NAVER
                    </a>
                  </li>
                  <li>
                    <a href="https://www.google.com/" target="_blank" rel="noopener noreferrer">
                      GOOGLE
                    </a>
                  </li>
                  <li>
                    <a href="https://www.daum.net/" target="_blank" rel="noopener noreferrer">
                      DAUM
                    </a>
                  </li>
                </SlideToggle>
              </div>
            </div>
            <div className="foo-btm">
              <ul className="foo-lt">
                <li>{footerInfo.address}</li>
                <li>{footerInfo.email}</li>
                <li>Copyright © (주)한화그린 All Rights Reserved.</li>
              </ul>
              <div className="foo-rt">
                <ul className="phone">
                  <li>대표전화 {footerInfo.phone}</li>
                  <li>{footerInfo.hours}</li>
                </ul>
                <ul className="sns">
                  <li>
                    <span className="sns-icon" aria-label="Instagram">
                      <Icon name="instagram" size="xl" />
                    </span>
                  </li>
                  <li>
                    <a
                      href={footerInfo.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="유튜브"
                    >
                      <Icon name="youtube" size="xl" />
                    </a>
                  </li>
                  <li>
                    <span className="sns-icon" aria-label="Facebook">
                      <Icon name="facebook" size="xl" />
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showTop && (
        <button
          type="button"
          className="top-scroll-btn"
          aria-label="상단으로"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Icon name="arrow-up" size="lg" />
          <span>상단으로</span>
        </button>
      )}
    </>
  );
}
