import { useEffect, useState } from "react";
import Icon from "../Icons";

const ATTENDANCE_DATE_FIELDS = new Set(["wr_work_date", "wr_month"]);

export default function BoardSearch({
  open,
  onClose,
  onSearch,
  initialField = "wr_subject",
  initialKeyword = "",
  mode = "default",
}) {
  const [field, setField] = useState(initialField);
  const [keyword, setKeyword] = useState(initialKeyword);
  const isAttendance = mode === "attendance";
  const isDateField = ATTENDANCE_DATE_FIELDS.has(field);

  useEffect(() => {
    if (open) {
      setField(initialField);
      setKeyword(initialKeyword);
    }
  }, [open, initialField, initialKeyword]);

  const handleFieldChange = (event) => {
    setField(event.target.value);
    setKeyword("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch({ field, keyword: keyword.trim() });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="bo_sch_wrap is-open">
      <fieldset className="bo_sch">
        <h3>검색</h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="sfl" className="sound_only">
            검색대상
          </label>
          <select name="sfl" id="sfl" value={field} onChange={handleFieldChange}>
            {isAttendance ? (
              <>
                <option value="wr_subject">제목</option>
                <option value="wr_work_date">작업일</option>
                <option value="wr_month">월별</option>
              </>
            ) : (
              <>
                <option value="wr_subject">제목</option>
                <option value="wr_content">내용</option>
                <option value="wr_subject||wr_content">제목+내용</option>
              </>
            )}
          </select>
          <label htmlFor="stx" className="sound_only">
            검색어
          </label>
          <div className={`sch_bar${isDateField ? " sch_bar--date" : ""}`}>
            {field === "wr_work_date" ? (
              <input
                type="date"
                name="stx"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                id="stx"
                className="sch_input sch_input--date"
              />
            ) : field === "wr_month" ? (
              <input
                type="month"
                name="stx"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                id="stx"
                className="sch_input sch_input--date"
              />
            ) : (
              <input
                type="text"
                name="stx"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                required={!isAttendance}
                id="stx"
                className="sch_input"
                size="25"
                maxLength="20"
                placeholder=" 검색어를 입력해주세요"
              />
            )}
            <button type="submit" value="검색" className="sch_btn board-icon-btn">
              <Icon name="search" size="sm" />
              <span className="sound_only">검색</span>
            </button>
          </div>
          {isAttendance && (
            <p className="bo_sch_hint">날짜 검색 후 비우고 검색하면 전체 목록이 표시됩니다.</p>
          )}
          <button type="button" className="bo_sch_cls board-icon-btn" title="닫기" onClick={onClose}>
            <Icon name="times" size="sm" />
            <span className="sound_only">닫기</span>
          </button>
        </form>
      </fieldset>
      <div className="bo_sch_bg" onClick={onClose} role="presentation" />
    </div>
  );
}
