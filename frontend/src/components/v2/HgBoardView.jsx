import { Link } from "react-router-dom";
import { boardRouteTarget } from "../../utils/navRoutes";

export default function HgBoardView({ post, table, children }) {
  return (
    <article className="hg-board-view">
      <header className="hg-board-view__head">
        <h1 className="hg-board-view__title">{post.subject}</h1>
        <div className="hg-board-view__meta">
          {post.author && <span>작성자 {post.author}</span>}
          {post.date && <span>{post.date}</span>}
          {post.hits != null && <span>조회 {post.hits}</span>}
        </div>
      </header>
      <div className="hg-board-view__body">
        {children || (
          <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />
        )}
      </div>
      <div className="hg-board-view__actions">
        <Link to={boardRouteTarget(table)} className="hg-btn hg-btn--primary">
          목록
        </Link>
      </div>
    </article>
  );
}
