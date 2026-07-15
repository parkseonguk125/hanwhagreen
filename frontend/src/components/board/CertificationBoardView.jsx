import { Link } from "react-router-dom";
import { boardViewRouteTarget } from "../../utils/navRoutes";

export default function CertificationBoardView({ post, table }) {
  const listTarget = `/bbs/board.php?bo_table=${table}`;

  return (
    <section className="viewSkin">
      <article className="inner">
        <h1 className="blind">갤러리 카테고리</h1>
        <div className="textBox">
          <h2 className="cate" />
          <p className="title2">{post.subject}</p>
          <dl>
            <dt>등록일</dt>
            <dd>
              <span>{post.date}</span>
            </dd>
            <dd>
              <span>
                <span className="sv_member">{post.author || "관리자"}</span>
              </span>
            </dd>
          </dl>
        </div>
        <div className="img_box2">
          <div id="bo_v_img">
            <a
              href={post.imageLink || post.image}
              target="_blank"
              rel="noreferrer"
              className="view_image"
            >
              <img src={post.imageLink || post.image} alt={post.subject} />
            </a>
          </div>
        </div>
        <div className="cont_box">
          <p>{post.content || post.subject}</p>
        </div>
        {(post.prev || post.next) && (
          <div className="info_box">
            <ul>
              {post.prev && (
                <li>
                  <Link to={boardViewRouteTarget(table, post.prev.id)}>
                    <div>
                      <span className="tit">이전글</span>
                      <span className="icon">
                        <i className="fa fa-caret-up" aria-hidden="true" />
                      </span>
                    </div>
                    <div>
                      <p className="txt">{post.prev.subject}</p>
                    </div>
                  </Link>
                </li>
              )}
              {post.next && (
                <li>
                  <Link to={boardViewRouteTarget(table, post.next.id)}>
                    <div>
                      <span className="tit">다음글</span>
                      <span className="icon">
                        <i className="fa fa-caret-down" aria-hidden="true" />
                      </span>
                    </div>
                    <div>
                      <p className="txt">{post.next.subject}</p>
                    </div>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
        <div className="list_move">
          <Link to={listTarget}>목록</Link>
        </div>
      </article>
    </section>
  );
}
