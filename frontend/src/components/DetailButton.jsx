import { Link } from "react-router-dom";
import Icon from "./Icons";

export default function DetailButton({ onClick, href = "#" }) {
  const content = (
    <div className="ani_btn">
      <p>자세히 보기</p>
      <Icon name="chevron-right" size="md" className="ani-btn-icon" />
    </div>
  );

  if (href && href !== "#") {
    return (
      <Link to={href} className="detail-link" onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className="detail-link"
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
    >
      {content}
    </a>
  );
}
