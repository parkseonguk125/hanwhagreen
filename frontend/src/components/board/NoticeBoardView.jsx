import { Link, useNavigate } from "react-router-dom";
import { deleteNoticePost, deleteQaPost } from "../../services/boardApi";
import { clearUnlockedQaPost, getQaPassword, isQaPostUnlocked } from "../../services/boardAccess";
import { isAdmin } from "../../services/authAccess";
import QaPostExtras from "./QaPostExtras";
import { getQaDisplayFields } from "../../utils/qaPostDisplay";
import {
  boardPasswordRouteTarget,
  boardRouteTarget,
  boardWriteRouteTarget,
} from "../../utils/navRoutes";

export default function NoticeBoardView({ post, table = "notice" }) {
  const navigate = useNavigate();
  const viewDate = post.viewDate || post.date;
  const isQa = table === "qa";
  const qaFields = isQa ? getQaDisplayFields(post) : null;
  const rawContent = isQa ? qaFields.content : (post.content || "").trim();
  const paragraphs = rawContent
    ? rawContent.split(/\n\n+/).map((part) => part.trim()).filter(Boolean)
    : [];
  const qaUnlocked = isQa && isQaPostUnlocked(post.id);
  const canManageNotice = !isQa && isAdmin();

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      if (isQa) {
        const password = getQaPassword(post.id);
        if (!password) {
          navigate(boardPasswordRouteTarget("qa", post.id, "d"));
          return;
        }
        await deleteQaPost(post.id, password);
        clearUnlockedQaPost(post.id);
      } else {
        await deleteNoticePost(post.id);
      }
      alert("삭제되었습니다.");
      navigate(boardRouteTarget(table));
    } catch (error) {
      alert(error.message);
    }
  };

  const editTarget = () => {
    if (isQa) {
      if (post.isSecret && !qaUnlocked) {
        return boardPasswordRouteTarget("qa", post.id, "u");
      }
      return boardWriteRouteTarget("qa", { wrId: post.id, mode: "u" });
    }
    return boardWriteRouteTarget("notice", { wrId: post.id, mode: "u" });
  };

  return (
    <section className="sec1">
      <section className="viewSkin">
        <article className="inner">
          <div className="textBox">
            <p className="title">{post.subject}</p>
            <dl>
              <dt>등록일</dt>
              <dd>
                <span>{viewDate}</span>
              </dd>
              <dd>
                <span>
                  <span className="sv_member">{post.author}</span>
                </span>
              </dd>
            </dl>
          </div>

          <div className="img_box">
            <div id="bo_v_img" />
          </div>

          <div className="cont_box">
            {paragraphs.length > 0 ? (
              <p>
                {paragraphs[0]}
                {paragraphs.length > 1 && (
                  <>
                    <br />
                    <br />
                    {paragraphs.slice(1).join("\n\n")}
                  </>
                )}
              </p>
            ) : (
              <p>내용이 없습니다.</p>
            )}
          </div>

          {isQa && qaFields && <QaPostExtras postId={post.id} fields={qaFields} />}

          <div className="info_box" aria-hidden="true" />

          <div className="list_move board-view-actions">
            <Link to={boardRouteTarget(table)} className="btn_list">
              목록
            </Link>
            {(isQa || canManageNotice) && (
              <>
                <Link to={editTarget()} className="btn_modify">
                  수정
                </Link>
                <button type="button" className="btn_delete" onClick={handleDelete}>
                  삭제
                </button>
              </>
            )}
          </div>
        </article>
      </section>
    </section>
  );
}
