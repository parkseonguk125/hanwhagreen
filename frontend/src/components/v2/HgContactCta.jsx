import { Link } from "react-router-dom";
import { boardRouteTarget } from "../../utils/navRoutes";

export default function HgContactCta() {
  return (
    <section className="hg-cta" aria-labelledby="hg-cta-title">
      <div className="hg-cta__bg" aria-hidden="true">
        <div className="hg-cta__mesh" />
      </div>
      <div className="hg-container hg-cta__inner hg-reveal">
        <div className="hg-cta__copy">
          <span className="hg-label hg-cta__label">Contact</span>
          <h2 id="hg-cta-title" className="hg-cta__title">
            함께하는<br />친환경 파트너
          </h2>
          <p className="hg-cta__desc">
            수처리·에너지·건설 현장의 고민, 한화그린이 함께 해결합니다.
          </p>
        </div>
        <div className="hg-cta__actions">
          <Link to={boardRouteTarget("qa")} className="hg-btn hg-btn--primary hg-cta__btn">
            온라인 문의
          </Link>
          <Link to="/bbs/content.php?co_id=map" className="hg-btn hg-btn--outline hg-cta__btn">
            오시는 길
          </Link>
        </div>
      </div>
    </section>
  );
}
