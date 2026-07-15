import { Link } from "react-router-dom";
import { boardViewRouteTarget } from "../../utils/navRoutes";

export default function HgBoardTable({ posts, table, columns = "default" }) {
  if (!posts.length) {
    return <p className="hg-board-loading">게시물이 없습니다.</p>;
  }

  return (
    <table className="hg-board-table">
      <caption className="hg-sr-only">게시판 목록</caption>
      <thead>
        <tr>
          <th className="col-num">번호</th>
          <th>제목</th>
          {columns !== "attendance" && <th>글쓴이</th>}
          {columns === "default" && <th className="col-date">조회</th>}
          <th className="col-date">날짜</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post) => (
          <tr key={post.id}>
            <td className="col-num">
              {post.isNotice ? (
                <strong style={{ color: "var(--hg-accent)" }}>공지</strong>
              ) : (
                post.id
              )}
            </td>
            <td>
              <Link to={boardViewRouteTarget(table, post.id)}>{post.subject}</Link>
            </td>
            {columns !== "attendance" && <td>{post.author}</td>}
            {columns === "default" && <td className="col-date">{post.hits}</td>}
            <td className="col-date">{post.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
