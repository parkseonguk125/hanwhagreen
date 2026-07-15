import { Link } from "react-router-dom";
import { boardViewRouteTarget } from "../../utils/navRoutes";

export default function CertificationGalleryList({ posts, table }) {
  return (
    <div className="listForm">
      <ul className="pro_list">
        {posts.map((post) => (
          <li key={post.id} style={{ position: "relative" }}>
            <div className="top_box">
              <div className="lf_box">
                <img src={post.image} alt={post.subject} />
              </div>
              <div className="rt_box">
                <strong className="tit">{post.subject}</strong>
                <Link to={boardViewRouteTarget(table, post.id)} className="moreBtn">
                  <span>more +</span>
                </Link>
              </div>
            </div>
            <div className="bottom_box">
              <a className="drop_btn" style={{ padding: 0 }} aria-hidden="true" tabIndex={-1} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
