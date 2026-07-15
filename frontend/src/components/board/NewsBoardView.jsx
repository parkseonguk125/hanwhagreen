import { useState } from "react";
import { Link } from "react-router-dom";
import { boardViewRouteTarget } from "../../utils/navRoutes";
import { boardLinkUrl } from "../../utils/youtube";

const NO_PROFILE = "https://hanwhagreen.com/img/no_profile.gif";

export default function NewsBoardView({ post }) {
  const [commentsOpen, setCommentsOpen] = useState(true);
  const listTarget = "/bbs/board.php?bo_table=news";

  const handleCommentToggle = (event) => {
    event.preventDefault();
    setCommentsOpen((open) => !open);
  };

  return (
    <article id="bo_v" style={{ width: "100%" }}>
      <header>
        <h2 id="bo_v_title">
          <span className="bo_v_tit">{post.subject}</span>
        </h2>
      </header>

      <section id="bo_v_info">
        <h2>페이지 정보</h2>
        <div className="profile_info">
          <div className="pf_img">
            <img src={NO_PROFILE} alt="profile_image" />
          </div>
          <div className="profile_info_ct">
            <span className="sound_only">작성자</span>{" "}
            <strong>
              <span className="sv_member">{post.author || "관리자"}</span>
            </strong>
            <br />
            <span className="sound_only">댓글</span>
            <strong>
              <a href="#bo_vc">
                <i className="fa fa-commenting-o" aria-hidden="true" /> 0건
              </a>
            </strong>{" "}
            <span className="sound_only">조회</span>
            <strong>
              <i className="fa fa-eye" aria-hidden="true" /> {post.hits.toLocaleString()}회
            </strong>{" "}
            <strong className="if_date">
              <span className="sound_only">작성일</span>
              <i className="fa fa-clock-o" aria-hidden="true" /> {post.date}
            </strong>
          </div>
        </div>

        <div id="bo_v_top">
          <ul className="btn_bo_user bo_v_com">
            <li>
              <Link to={listTarget} className="btn_b01 btn" title="목록">
                <i className="fa fa-list" aria-hidden="true" />
                <span className="sound_only">목록</span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section id="bo_v_atc">
        <h2 id="bo_v_atc_title">본문</h2>
        <div id="bo_v_share" />

        {post.image && (
          <div id="bo_v_img">
            <a
              href={post.imageLink || post.image}
              target="_blank"
              rel="noreferrer"
              className="view_image"
            >
              <img src={post.image} alt="" />
            </a>
          </div>
        )}

        <div id="bo_v_con">{post.content}</div>
      </section>

      {post.relatedLink && (
        <section id="bo_v_link">
          <h2>관련링크</h2>
          <ul>
            <li>
              <i className="fa fa-link" aria-hidden="true" />
              <a href={boardLinkUrl("news", post.id)} target="_blank" rel="noreferrer">
                <strong>{post.relatedLink}</strong>
              </a>
              <br />
              <span className="bo_v_link_cnt">{post.linkCount.toLocaleString()}회 연결</span>
            </li>
          </ul>
        </section>
      )}

      {(post.prev || post.next) && (
        <ul className="bo_v_nb">
          {post.prev && (
            <li className="btn_prv">
              <span className="nb_tit">
                <i className="fa fa-chevron-up" aria-hidden="true" /> 이전글
              </span>
              <Link to={boardViewRouteTarget("news", post.prev.id)}>{post.prev.subject}</Link>
              <span className="nb_date">{post.prev.date}</span>
            </li>
          )}
          {post.next && (
            <li className="btn_next">
              <span className="nb_tit">
                <i className="fa fa-chevron-down" aria-hidden="true" /> 다음글
              </span>
              <Link to={boardViewRouteTarget("news", post.next.id)}>{post.next.subject}</Link>
              <span className="nb_date">{post.next.date}</span>
            </li>
          )}
        </ul>
      )}

      <button
        type="button"
        className={`cmt_btn${commentsOpen ? " cmt_btn_op" : ""}`}
        onClick={handleCommentToggle}
      >
        <span className="total">
          <b>댓글</b> 0
        </span>
        <span className="cmt_more" />
      </button>

      <section id="bo_vc" style={{ display: commentsOpen ? "block" : "none" }}>
        <h2>댓글목록</h2>
        <p id="bo_vc_empty">등록된 댓글이 없습니다.</p>
      </section>
    </article>
  );
}
