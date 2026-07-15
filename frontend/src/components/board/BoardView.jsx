import { Link } from "react-router-dom";
import { boardRouteTarget } from "../../utils/navRoutes";
export default function BoardView({ post, table }) {
  return (
    <section className="viewSkin">
      <div className="inner">
        <div id="bo_v">
          <div id="bo_v_title">
            <span className="bo_v_tit">{post.subject}</span>
          </div>
          <div id="bo_v_info">
            <strong>{post.author}</strong>
            <span>{post.date}</span>
            <span>조회 {post.hits}</span>
            {post.status && <span>{post.status}</span>}
          </div>
          <div id="bo_v_atc">
            <div
              id="bo_v_con"
              style={{ whiteSpace: "pre-wrap", padding: "30px 0", lineHeight: 1.8, color: "#333" }}
            >
              {post.content}
            </div>
          </div>
          <div className="bo_v_btn" style={{ marginTop: 30, textAlign: "right" }}>
            <Link to={boardRouteTarget(table)} className="btn btn_submit">              목록
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
