import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import HgHeader from "../components/v2/HgHeader";
import HgFooter from "../components/v2/HgFooter";
import HgSubLayout from "../components/v2/HgSubLayout";
import Icon from "../components/Icons";
import MockRecaptcha from "../components/board/MockRecaptcha";
import {
  createNoticePost,
  createQaPost,
  fetchNoticePost,
  fetchQaPost,
  updateNoticePost,
  updateQaPost,
} from "../services/boardApi";
import { getQaPassword, getUnlockedQaPost, storeQaPassword, storeUnlockedQaPost } from "../services/boardAccess";
import { getStoredMember, isAdmin } from "../services/authAccess";
import { boardBanners } from "../config/boardBanners";
import { parseLegacyQaContent } from "../utils/qaPostDisplay";
import { boardRouteTarget, boardViewRouteTarget } from "../utils/navRoutes";

const boardConfig = {
  notice: {
    title: "공지사항",
    navTitle: "공지사항",
    banner: boardBanners.notice,
  },
  qa: {
    title: "온라인문의",
    navTitle: "온라인문의",
    banner: boardBanners.qa,
  },
};

function WriteField({ id, label, required = false, hint, children }) {
  return (
    <div className="hg-write__field">
      <label htmlFor={id} className="hg-write__label">
        {label}
        {required && (
          <em className="hg-write__required" aria-label="필수">
            *
          </em>
        )}
        {hint && <span className="hg-write__hint">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const emptyForm = {
  wr_name: "",
  wr_password: "",
  wr_new_password: "",
  wr_email: "",
  wr_homepage: "",
  wr_subject: "",
  wr_content: "",
  wr_link1: "",
  wr_link2: "",
  mail: true,
  captcha: false,
};

export default function BoardWritePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const table = searchParams.get("bo_table") || "qa";
  const wrId = searchParams.get("wr_id");
  const isEdit = searchParams.get("w") === "u" && wrId;
  const config = boardConfig[table] || boardConfig.qa;

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(Boolean(isEdit));
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({ ...emptyForm });
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (table !== "notice") return undefined;

    if (!isAdmin()) {
      const returnPath = `${window.location.pathname}${window.location.search}`;
      alert("공지사항은 관리자 로그인 후 작성·수정할 수 있습니다.");
      navigate(`/bbs/login.php?url=${encodeURIComponent(returnPath)}`, { replace: true });
      return undefined;
    }

    if (!isEdit) {
      const member = getStoredMember();
      setForm((prev) => ({
        ...prev,
        wr_name: member?.name || member?.id || "관리자",
      }));
    }

    return undefined;
  }, [table, isEdit, navigate]);

  useEffect(() => {
    if (!isEdit) return undefined;

    let cancelled = false;
    setLoading(true);
    setLoadError("");

    const load = async () => {
      try {
        if (table === "notice") {
          const post = await fetchNoticePost(wrId, { skipHit: true });
          if (cancelled) return;
          setForm({
            ...emptyForm,
            wr_name: post.author || "관리자",
            wr_subject: post.subject || "",
            wr_content: post.content || "",
            captcha: true,
          });
          return;
        }

        if (table === "qa") {
          let data = getUnlockedQaPost(wrId);
          if (!data) {
            const peek = await fetchQaPost(wrId);
            if (peek?.isSecret) {
              throw new Error("비밀번호 확인 후 수정할 수 있습니다.");
            }
            data = peek;
          }
          if (cancelled) return;
          const legacy = parseLegacyQaContent(data.content || "");
          setForm({
            ...emptyForm,
            wr_name: data.author || "",
            wr_email: data.email || "",
            wr_homepage: data.homepage || "",
            wr_subject: data.subject || "",
            wr_content: legacy.content,
            wr_link1: data.link1 || legacy.link1,
            wr_link2: data.link2 || legacy.link2,
            mail: data.receiveMail !== false,
            wr_password: getQaPassword(wrId),
            captcha: true,
          });
        }
      } catch (error) {
        if (!cancelled) setLoadError(error.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isEdit, table, wrId]);

  const updateField = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setAttachment(file);
  };

  const clearAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.wr_name.trim() || !form.wr_subject.trim() || !form.wr_content.trim()) {
      alert("필수 항목을 입력해 주세요.");
      return;
    }

    if (table === "qa" && !isEdit && !form.wr_password.trim()) {
      alert("비밀번호를 입력해 주세요.");
      return;
    }

    if (table === "qa" && isEdit && !form.wr_password.trim()) {
      alert("현재 비밀번호를 입력해 주세요.");
      return;
    }

    if (table === "notice" && !isAdmin()) {
      alert("관리자 로그인이 필요합니다.");
      return;
    }

    if (!isEdit && !form.captcha) {
      alert("로봇이 아닙니다를 확인해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const content = form.wr_content.trim();

      if (table === "notice") {
        const payload = {
          author: form.wr_name.trim(),
          subject: form.wr_subject.trim(),
          content,
        };

        const post = isEdit
          ? await updateNoticePost(wrId, payload)
          : await createNoticePost(payload);

        alert(isEdit ? "수정되었습니다." : "등록되었습니다.");
        navigate(boardViewRouteTarget("notice", post.id));
        return;
      }

      if (table === "qa") {
        if (isEdit) {
          const post = await updateQaPost(
            wrId,
            {
              password: form.wr_password,
              author: form.wr_name.trim(),
              email: form.wr_email.trim(),
              homepage: form.wr_homepage.trim(),
              link1: form.wr_link1.trim(),
              link2: form.wr_link2.trim(),
              subject: form.wr_subject.trim(),
              content,
              receiveMail: form.mail,
              newPassword: form.wr_new_password.trim() || undefined,
            },
            attachment
          );
          storeUnlockedQaPost(post);
          storeQaPassword(wrId, form.wr_new_password.trim() || form.wr_password);
          alert("수정되었습니다.");
          navigate(boardViewRouteTarget("qa", post.id));
          return;
        }

        const post = await createQaPost(
          {
            author: form.wr_name.trim(),
            password: form.wr_password,
            email: form.wr_email.trim(),
            homepage: form.wr_homepage.trim(),
            link1: form.wr_link1.trim(),
            link2: form.wr_link2.trim(),
            subject: form.wr_subject.trim(),
            content,
            receiveMail: form.mail,
          },
          attachment
        );

        storeUnlockedQaPost(post);
        storeQaPassword(post.id, form.wr_password);
        alert("문의가 접수되었습니다.");
        navigate(boardViewRouteTarget("qa", post.id));
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const layoutProps = {
    title: config.title,
    bannerUrl: config.banner,
    currentNavTitle: config.navTitle,
    navGroupIndex: 4,
  };

  if (!boardConfig[table]) {
    return (
      <>
        <HgHeader />
        <main className="hg-main" style={{ padding: "120px 20px", textAlign: "center" }}>
          <p>지원하지 않는 게시판입니다.</p>
          <Link to={boardRouteTarget("notice")}>공지사항으로 이동</Link>
        </main>
        <HgFooter />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <HgHeader />
        <HgSubLayout {...layoutProps}>
          <div className="hg-board-loading">불러오는 중...</div>
        </HgSubLayout>
        <HgFooter />
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <HgHeader />
        <HgSubLayout {...layoutProps}>
          <div className="hg-board-loading">
            <p>{loadError}</p>
            <Link to={boardRouteTarget(table)}>목록으로</Link>
          </div>
        </HgSubLayout>
        <HgFooter />
      </>
    );
  }

  const pageTitle = isEdit ? `${config.title} 수정` : table === "qa" ? "문의하기" : "글쓰기";

  return (
    <>
      <HgHeader />
      <HgSubLayout {...layoutProps}>
        <div className="hg-proj hg-write">
          <header className="hg-write__head">
            <p className="hg-proj__eyebrow">{table === "qa" ? "Contact Us" : "Notice"}</p>
            <h2 className="hg-write__title">{pageTitle}</h2>
            <p className="hg-write__desc">
              {table === "qa"
                ? "아래 양식을 작성해 주시면 담당자가 확인 후 빠르게 답변드립니다."
                : "공지사항 내용을 입력해 주세요."}
            </p>
          </header>

          <form id="fwrite" onSubmit={handleSubmit} className="hg-write__form">
            <section className="hg-write__card">
              <h3 className="hg-write__card-title">
                <span className="hg-write__card-num">01</span> 작성자 정보
              </h3>
              <div className="hg-write__grid">
                <WriteField id="wr_name" label="이름" required>
                  <input
                    type="text"
                    name="wr_name"
                    id="wr_name"
                    required
                    className="hg-write__input"
                    placeholder="이름을 입력해 주세요"
                    value={form.wr_name}
                    onChange={updateField("wr_name")}
                  />
                </WriteField>

                {table === "qa" && (
                  <>
                    <WriteField
                      id="wr_password"
                      label={isEdit ? "현재 비밀번호" : "비밀번호"}
                      required
                      hint="글 수정·삭제 시 필요합니다"
                    >
                      <input
                        type="password"
                        name="wr_password"
                        id="wr_password"
                        required
                        className="hg-write__input"
                        placeholder={isEdit ? "현재 비밀번호" : "비밀번호"}
                        value={form.wr_password}
                        onChange={updateField("wr_password")}
                      />
                    </WriteField>
                    {isEdit && (
                      <WriteField id="wr_new_password" label="새 비밀번호" hint="변경할 때만 입력">
                        <input
                          type="password"
                          name="wr_new_password"
                          id="wr_new_password"
                          className="hg-write__input"
                          placeholder="새 비밀번호"
                          value={form.wr_new_password}
                          onChange={updateField("wr_new_password")}
                        />
                      </WriteField>
                    )}
                    <WriteField id="wr_email" label="이메일">
                      <input
                        type="text"
                        name="wr_email"
                        id="wr_email"
                        className="hg-write__input"
                        placeholder="example@email.com"
                        value={form.wr_email}
                        onChange={updateField("wr_email")}
                      />
                    </WriteField>
                    <WriteField id="wr_homepage" label="홈페이지">
                      <input
                        type="text"
                        name="wr_homepage"
                        id="wr_homepage"
                        className="hg-write__input"
                        placeholder="https://"
                        value={form.wr_homepage}
                        onChange={updateField("wr_homepage")}
                      />
                    </WriteField>
                  </>
                )}
              </div>

              {table === "qa" && (
                <label className="hg-write__toggle" htmlFor="mail">
                  <input
                    type="checkbox"
                    id="mail"
                    name="mail"
                    checked={form.mail}
                    onChange={updateField("mail")}
                  />
                  <span className="hg-write__toggle-track" aria-hidden="true">
                    <span className="hg-write__toggle-thumb" />
                  </span>
                  <span className="hg-write__toggle-label">답변 메일 받기</span>
                </label>
              )}
            </section>

            <section className="hg-write__card">
              <h3 className="hg-write__card-title">
                <span className="hg-write__card-num">02</span>{" "}
                {table === "qa" ? "문의 내용" : "게시글 내용"}
              </h3>
              <WriteField id="wr_subject" label="제목" required>
                <input
                  type="text"
                  name="wr_subject"
                  id="wr_subject"
                  required
                  className="hg-write__input"
                  placeholder="제목을 입력해 주세요"
                  value={form.wr_subject}
                  onChange={updateField("wr_subject")}
                />
              </WriteField>
              <WriteField id="wr_content" label="내용" required>
                <textarea
                  id="wr_content"
                  name="wr_content"
                  required
                  maxLength={65536}
                  className="hg-write__textarea"
                  placeholder={
                    table === "qa"
                      ? "문의하실 내용을 자세히 적어주시면 더 정확한 답변을 드릴 수 있습니다."
                      : "내용을 입력해 주세요"
                  }
                  value={form.wr_content}
                  onChange={updateField("wr_content")}
                />
              </WriteField>
            </section>

            {table === "qa" && !isEdit && (
              <section className="hg-write__card">
                <h3 className="hg-write__card-title">
                  <span className="hg-write__card-num">03</span> 추가 정보
                  <span className="hg-write__card-optional">선택</span>
                </h3>
                <div className="hg-write__grid">
                  <WriteField id="wr_link1" label="관련 링크 1">
                    <input
                      type="text"
                      name="wr_link1"
                      id="wr_link1"
                      className="hg-write__input"
                      placeholder="https://"
                      value={form.wr_link1}
                      onChange={updateField("wr_link1")}
                    />
                  </WriteField>
                  <WriteField id="wr_link2" label="관련 링크 2">
                    <input
                      type="text"
                      name="wr_link2"
                      id="wr_link2"
                      className="hg-write__input"
                      placeholder="https://"
                      value={form.wr_link2}
                      onChange={updateField("wr_link2")}
                    />
                  </WriteField>
                </div>
                <WriteField id="bf_file_0" label="파일 첨부">
                  <div className="hg-write__file">
                    <label className="hg-write__file-btn" htmlFor="bf_file_0">
                      <Icon name="folder-open" size="sm" />
                      파일 선택
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="bf_file[]"
                      id="bf_file_0"
                      className="hg-write__file-input"
                      onChange={handleAttachmentChange}
                    />
                    {attachment ? (
                      <span className="hg-write__file-name">
                        {attachment.name}
                        <button
                          type="button"
                          className="hg-write__file-del"
                          onClick={clearAttachment}
                          aria-label="첨부 파일 삭제"
                        >
                          ×
                        </button>
                      </span>
                    ) : (
                      <span className="hg-write__file-empty">선택된 파일이 없습니다</span>
                    )}
                  </div>
                </WriteField>
              </section>
            )}

            {!isEdit && (
              <div className="hg-write__captcha">
                <MockRecaptcha
                  checked={form.captcha}
                  onChange={(value) => setForm((prev) => ({ ...prev, captcha: value }))}
                />
              </div>
            )}

            <div className="hg-proj-view__actions hg-write__actions">
              <Link to={boardRouteTarget(table)} className="hg-proj-view__nav">
                취소
              </Link>
              <button type="submit" className="hg-write__submit" disabled={submitting}>
                {submitting ? "처리 중..." : isEdit ? "수정완료" : "작성완료"}
              </button>
            </div>
          </form>
        </div>
      </HgSubLayout>
      <HgFooter />
    </>
  );
}
