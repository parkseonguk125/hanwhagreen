import { assets } from "../../data/mock";

export default function HgLogo({ variant = "dark" }) {
  const isLight = variant === "light";

  return (
    <span className={`hg-logo${isLight ? " hg-logo--light" : ""}`}>
      <span className="hg-logo__mark">
        <img
          src={isLight ? assets.logoWhite : assets.logoBlack}
          alt=""
          decoding="async"
          draggable={false}
        />
      </span>
      <span className="hg-logo__text">
        <span className="hg-logo__corp">(주)</span>
        <span className="hg-logo__name">한화그린</span>
      </span>
    </span>
  );
}
