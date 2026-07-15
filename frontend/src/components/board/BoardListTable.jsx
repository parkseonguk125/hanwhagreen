import { Link } from "react-router-dom";
import Icon from "../Icons";
import { isAdmin } from "../../services/authAccess";
import { boardPasswordRouteTarget, boardRouteTarget, boardViewRouteTarget, parseAppHref } from "../../utils/navRoutes";

export default function NoticeBoardList({ posts }) {
  const listUrl = boardRouteTarget("notice");

  return (
    <div className="tbl_head01 tbl_wrap">
      <table>
        <caption>공지사항 목록</caption>
        <thead>
          <tr>
            <th scope="col" className="th_num">
              번<span className="th_sp" />호
            </th>
            <th scope="col" className="th_subject">
              제<span className="th_sp" />목
            </th>
            <th scope="col" className="col4">
              글쓴이
            </th>
            <th scope="col" className="col5">
              <Link to={{ ...listUrl, search: "?bo_table=notice&sst=wr_hit&sod=desc" }}>조회 </Link>
            </th>
            <th scope="col" className="col6 th_date">
              <Link to={{ ...listUrl, search: "?bo_table=notice&sst=wr_datetime&sod=desc" }}>날짜 </Link>
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan="5">게시물이 없습니다.</td>
            </tr>
          ) : (
            posts.map((post, index) => (
              <tr
                key={post.id}
                className={`${post.isNotice ? "bo_notice" : ""} ${index % 2 ? "even" : ""}`.trim()}
              >
                <td className="td_num2">
                  {post.isNotice ? (
                    <strong className="notice_icon">공지</strong>
                  ) : (
                    post.id
                  )}
                </td>
                <td className="td_subject" style={{ paddingLeft: 0 }}>
                  <div className="bo_tit">
                    <Link to={boardViewRouteTarget("notice", post.id)}>{post.subject}</Link>
                    <i className="fa fa-heart" aria-hidden="true" />
                  </div>
                </td>
                <td className="td_name sv_use">
                  <span className="sv_member">{post.author}</span>
                </td>
                <td className="td_num">{post.hits}</td>
                <td className="td_datetime">
                  <span className="notice_date_txt">{post.date}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function NewsBoardList({ posts }) {
  const listUrl = boardRouteTarget("news");

  return (
    <div className="tbl_head01 tbl_wrap">
      <table>
        <caption>홍보영 목록</caption>
        <thead>
          <tr>
            <th scope="col" className="th_num">
              번<span className="th_sp" />호
            </th>
            <th scope="col" className="th_subject">
              제<span className="th_sp" />목
            </th>
            <th scope="col" className="th_name">글쓴이</th>
            <th scope="col" className="th_hit">
              <Link to={{ ...listUrl, search: "?bo_table=news&sst=wr_hit&sod=desc" }}>조회 </Link>
            </th>
            <th scope="col" className="th_date">
              <Link to={{ ...listUrl, search: "?bo_table=news&sst=wr_datetime&sod=desc" }}>날짜 </Link>
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan="5">게시물이 없습니다.</td>
            </tr>
          ) : (
            posts.map((post, index) => (
              <tr key={post.id} className={index % 2 ? "even" : ""}>
                <td className="td_num2">
                  <span className="bo_cell_txt">{post.id}</span>
                </td>
                <td className="td_subject">
                  <div className="bo_tit">
                    <Link to={boardViewRouteTarget("news", post.id)}>
                      {post.listSubject || post.subject}
                    </Link>
                    <i className="fa fa-heart" aria-hidden="true" />
                    {(post.imageLink || post.relatedLink) && (
                      <span className="bo_tit_icons">
                        {post.imageLink && <i className="fa fa-download" aria-hidden="true" />}
                        {post.relatedLink && <i className="fa fa-link" aria-hidden="true" />}
                      </span>
                    )}
                  </div>
                </td>
                <td className="td_name">
                  <span className="bo_cell_txt bo_cell_author">{post.author || "관리자"}</span>
                </td>
                <td className="td_num">
                  <span className="bo_cell_txt bo_cell_hit">{post.hits ?? 0}</span>
                </td>
                <td className="td_datetime">
                  <span className="bo_cell_txt bo_cell_date">{post.listDate || post.date}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function QaBoardList({ posts }) {
  const listUrl = boardRouteTarget("qa");
  const adminLoggedIn = isAdmin();

  return (
    <div className="tbl_head01 tbl_wrap">
      <table>
        <caption>고객지원 목록</caption>
        <thead>
          <tr>
            <th scope="col" className="th_status">
              진행상황
            </th>
            <th scope="col" className="th_subject">
              제목
            </th>
            <th scope="col" className="col4">
              글쓴이
            </th>
            <th scope="col" className="col5">
              <Link to={{ ...listUrl, search: "?bo_table=qa&sst=wr_hit&sod=desc" }}>조회 </Link>
            </th>
            <th scope="col" className="col6 th_date">
              <Link to={{ ...listUrl, search: "?bo_table=qa&sst=wr_datetime&sod=desc" }}>날짜 </Link>
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan="5">게시물이 없습니다.</td>
            </tr>
          ) : (
            posts.map((post, index) => (
              <tr key={post.id} className={index % 2 ? "even" : ""}>
                <td className="td_num2">
                  <p>
                    <span className="icon">
                      <Icon name="message" size="sm" />
                    </span>
                    <span className="text">{post.status}</span>
                  </p>
                </td>
                <td className="td_subject" style={{ paddingLeft: 0 }}>
                  <div className="bo_tit">
                    <Link
                      to={
                        post.isSecret && !adminLoggedIn
                          ? boardPasswordRouteTarget("qa", post.id)
                          : boardViewRouteTarget("qa", post.id)
                      }
                    >
                      {post.isSecret && (
                        <span className="bo-lock-icon" aria-hidden="true">
                          <Icon name="lock" size="sm" />
                        </span>
                      )}
                      {post.subject}
                    </Link>
                    {post.hasAttachment && (
                      <i className="fa fa-download" aria-hidden="true" />
                    )}
                  </div>
                </td>
                <td className="td_name sv_use">
                  <span className="sv_guest">{post.author}</span>
                </td>
                <td className="td_num">{post.hits}</td>
                <td className="td_datetime">
                  <span className="qa_date_txt">{post.listDate || post.date}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function attendanceLoginTarget(postId) {
  const returnPath = `/bbs/board.php?bo_table=attendance&wr_id=${postId}`;
  return {
    pathname: "/bbs/login.php",
    search: `?url=${encodeURIComponent(returnPath)}`,
  };
}

export function AttendanceBoardList({ posts }) {
  const listUrl = boardRouteTarget("attendance");
  const adminLoggedIn = isAdmin();

  return (
    <div className="tbl_head01 tbl_wrap attendance-board-list">
      <table>
        <caption>출결서비스 목록</caption>
        <thead>
          <tr>
            <th scope="col" className="th_num">
              번<span className="th_sp" />호
            </th>
            <th scope="col" className="th_subject">
              제<span className="th_sp" />목
            </th>
            <th scope="col" className="col6 th_date">
              <Link to={{ ...listUrl, search: "?bo_table=attendance&sst=wr_datetime&sod=desc" }}>
                등록일{" "}
              </Link>
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan="3">등록된 출결 기록이 없습니다.</td>
            </tr>
          ) : (
            posts.map((post, index) => (
              <tr key={post.id} className={index % 2 ? "even" : ""}>
                <td className="td_num2">{posts.length - index}</td>
                <td className="td_subject" style={{ paddingLeft: 0 }}>
                  <div className="bo_tit">
                    <Link
                      to={
                        adminLoggedIn
                          ? boardViewRouteTarget("attendance", post.id)
                          : attendanceLoginTarget(post.id)
                      }
                    >
                      {post.listSubject || post.subject}
                    </Link>
                    {!adminLoggedIn && (
                      <span className="attendance-lock-hint"> (관리자 열람)</span>
                    )}
                  </div>
                </td>
                <td className="td_datetime">
                  <span className="attendance_date_txt">{post.viewDate || post.date || "-"}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
