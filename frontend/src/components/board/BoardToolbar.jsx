import { Link } from "react-router-dom";
import Icon from "../Icons";
import { boardWriteUrl } from "../../services/boardStorage";
import { parseAppHref } from "../../utils/navRoutes";

export default function BoardToolbar({
  table,
  showWrite = false,
  onSearchOpen,
  totalCount,
  page = 1,
}) {
  return (
    <div id="bo_btn_top">
      {totalCount != null && (
        <div id="bo_list_total">
          <span>Total {totalCount}건</span>
          {page} 페이지
        </div>
      )}
      <ul className="btn_bo_user">
        <li>
          <button
            type="button"
            className="btn_bo_sch btn_b01 btn board-icon-btn"
            title="게시판 검색"
            onClick={onSearchOpen}
          >
            <Icon name="search" size="sm" />
            <span className="sound_only">게시판 검색</span>
          </button>
        </li>
        {showWrite && (
          <li>
            <Link
              to={parseAppHref(boardWriteUrl(table))}
              className="btn_b01 btn board-icon-btn"
              title="글쓰기"
            >
              <Icon name="pencil" size="sm" />
              <span className="sound_only">글쓰기</span>
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

export function BoardWriteBottom({ table }) {
  return (
    <div className="bo_fx">
      <ul className="btn_bo_user">
        <li>
          <Link
            to={parseAppHref(boardWriteUrl(table))}
            className="btn_b01 btn board-icon-btn"
            title="글쓰기"
          >
            <Icon name="pencil" size="sm" />
            <span className="sound_only">글쓰기</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
