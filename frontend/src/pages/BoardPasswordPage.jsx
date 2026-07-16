import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HgHeader from "../components/v2/HgHeader";
import HgFooter from "../components/v2/HgFooter";
import { deleteQaPost, fetchQaPost, verifyQaPost } from "../services/boardApi";
import {
  clearUnlockedQaPost,
  storeQaPassword,
  storeUnlockedQaPost,
} from "../services/boardAccess";
import { isAdmin } from "../services/authAccess";
import { boardRouteTarget, boardViewRouteTarget, boardWriteRouteTarget } from "../utils/navRoutes";

const MODE_LABEL = {
  s: "열람",
  u: "수정",
  d: "삭제",
};

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <rect
        x="5"
        y="11"
        width="14"
        height="9"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 11V7a4 4 0 018 0v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function modeDescription(mode) {
  if (mode === "u") return "글을 수정하려면 작성 시 설정한 비밀번호를 입력해 주세요.";
  if (mode === "d") return "글을 삭제하려면 작성 시 설정한 비밀번호를 입력해 주세요.";
  return "작성자와 관리자만 열람할 수 있습니다. 본인이라면 비밀번호를 입력해 주세요.";
}

export default function BoardPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const table = searchParams.get("bo_table") || "qa";
  const wrId = searchParams.get("wr_id");
  const mode = searchParams.get("w") || "s";

  const [password, setPassword] = useState("");
  const [postMeta, setPostMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = `비밀번호 입력 (${MODE_LABEL[mode] || "확인"}) | 한화그린`;

    return () => {
      document.title = "한화그린";
    };
  }, [mode]);

  useEffect(() => {
    /* 관리자는 비밀번호 없이 열람/수정/삭제 가능 */
    if (table === "qa" && wrId && isAdmin() && mode === "s") {
      navigate(boardViewRouteTarget("qa", wrId), { replace: true });
    }
  }, [table, wrId, mode, navigate]);

  useEffect(() => {
    if (table !== "qa" || !wrId) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    fetchQaPost(wrId)
      .then((post) => {
        if (!cancelled) setPostMeta(post);
      })
      .catch((fetchError) => {
        if (!cancelled) setError(fetchError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [table, wrId]);

  const goList = () => navigate(boardRouteTarget("qa"));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!password.trim()) {
      alert("비밀번호를 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const post = await verifyQaPost(wrId, password.trim());
      storeUnlockedQaPost(post);
      storeQaPassword(wrId, password.trim());

      if (mode === "u") {
        navigate(boardWriteRouteTarget("qa", { wrId: post.id, mode: "u" }));
        return;
      }

      if (mode === "d") {
        if (!window.confirm("정말 삭제하시겠습니까?")) {
          return;
        }
        await deleteQaPost(wrId, password.trim());
        clearUnlockedQaPost(wrId);
        alert("삭제되었습니다.");
        navigate(boardRouteTarget("qa"));
        return;
      }

      navigate(boardViewRouteTarget("qa", post.id));
    } catch (submitError) {
      setError(submitError.message);
      alert(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const shell = (children) => (
    <>
      <HgHeader />
      <main className="hg-main hg-login-page">
        <div className="hg-login hg-pw">{children}</div>
      </main>
      <HgFooter />
    </>
  );

  if (table !== "qa" || !wrId) {
    return shell(
      <>
        <header className="hg-login__head">
          <p className="hg-login__eyebrow">Protected Post</p>
          <h1 className="hg-login__title">비밀번호 확인</h1>
          <p className="hg-login__desc">잘못된 접근입니다.</p>
        </header>
        <div className="hg-login__body">
          <button type="button" className="hg-login__submit" onClick={goList}>
            목록으로
          </button>
        </div>
      </>
    );
  }

  if (loading) {
    return shell(
      <div className="hg-login__body">
        <p className="hg-board-loading">불러오는 중...</p>
      </div>
    );
  }

  if (error && !postMeta) {
    return shell(
      <>
        <header className="hg-login__head">
          <p className="hg-login__eyebrow">Protected Post</p>
          <h1 className="hg-login__title">비밀번호 확인</h1>
          <p className="hg-login__desc">글을 불러오지 못했습니다.</p>
        </header>
        <div className="hg-login__body">
          <div className="hg-login__error" role="alert">
            <strong>오류</strong>
            <p>{error}</p>
          </div>
          <button type="button" className="hg-login__submit" onClick={goList}>
            목록으로
          </button>
        </div>
      </>
    );
  }

  return shell(
    <>
      <header className="hg-login__head">
        <p className="hg-login__eyebrow">Protected Post</p>
        <div className="hg-pw__lock" aria-hidden="true">
          <LockIcon />
        </div>
        <h1 className="hg-login__title">보호된 글입니다</h1>
        <p className="hg-login__desc">{modeDescription(mode)}</p>
      </header>

      <div className="hg-login__body">
        {postMeta?.subject && (
          <div className="hg-pw__subject">
            <span className="hg-pw__subject-label">문의 제목</span>
            <p className="hg-pw__subject-text">{postMeta.subject}</p>
          </div>
        )}

        <form id="fboardpassword" name="fboardpassword" onSubmit={handleSubmit}>
          <fieldset className="hg-login__fieldset">
            <legend className="hg-sr-only">비밀번호 입력</legend>

            <div className="hg-login__field">
              <label htmlFor="password_wr_password">
                비밀번호<strong className="hg-sr-only"> 필수</strong>
              </label>
              <div className="hg-login__input-wrap">
                <span className="hg-login__input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="17" height="17">
                    <rect
                      x="5"
                      y="11"
                      width="14"
                      height="9"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 11V7a4 4 0 018 0v4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  type="password"
                  name="wr_password"
                  id="password_wr_password"
                  required
                  maxLength={20}
                  placeholder="작성 시 입력한 비밀번호"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={submitting}
                  autoComplete="current-password"
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" className="hg-login__submit" disabled={submitting}>
              {submitting
                ? "확인 중..."
                : mode === "d"
                  ? "삭제하기"
                  : mode === "u"
                    ? "수정하기"
                    : "열람하기"}
            </button>

            <button
              type="button"
              className="hg-pw__back"
              onClick={goList}
              disabled={submitting}
            >
              목록으로 돌아가기
            </button>
          </fieldset>
        </form>
      </div>
    </>
  );
}
