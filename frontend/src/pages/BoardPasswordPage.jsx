import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { deleteQaPost, fetchQaPost, verifyQaPost } from "../services/boardApi";
import {
  clearUnlockedQaPost,
  storeQaPassword,
  storeUnlockedQaPost,
} from "../services/boardAccess";
import { boardRouteTarget, boardViewRouteTarget, boardWriteRouteTarget } from "../utils/navRoutes";

const MODE_LABEL = {
  s: "열람",
  u: "수정",
  d: "삭제",
};

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

  if (table !== "qa" || !wrId) {
    return (
      <main className="hg-main">
        <div className="hg-login">
          <h1 className="hg-login__title">비밀번호 확인</h1>
          <p className="hg-board-loading">잘못된 접근입니다.</p>
        </div>
      </main>
    );
  }

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

  if (loading) {
    return (
      <main className="hg-main">
        <div className="hg-login">
          <p className="hg-board-loading">불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (error && !postMeta) {
    return (
      <main className="hg-main">
        <div className="hg-login">
          <h1 className="hg-login__title">비밀번호 확인</h1>
          <p className="hg-login__error">{error}</p>
          <button
            type="button"
            className="hg-btn hg-btn--primary hg-login__submit"
            onClick={() => navigate(boardRouteTarget("qa"))}
          >
            목록으로
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="hg-main">
      <div className="hg-login">
        <h1 className="hg-login__title">{postMeta?.subject}</h1>
        <p>
          <strong>비밀글 기능으로 보호된 글입니다.</strong>
          {mode === "u" && " 수정하려면 비밀번호를 입력하세요."}
          {mode === "d" && " 삭제하려면 비밀번호를 입력하세요."}
          {mode === "s" && (
            <>
              <br />
              작성자와 관리자만 열람하실 수 있습니다. 본인이라면 비밀번호를 입력하세요.
            </>
          )}
        </p>

        <form id="fboardpassword" name="fboardpassword" onSubmit={handleSubmit}>
          <div className="hg-login__field">
            <label htmlFor="password_wr_password">
              비밀번호<strong className="hg-sr-only"> 필수</strong>
            </label>
            <input
              type="password"
              name="wr_password"
              id="password_wr_password"
              required
              maxLength={20}
              placeholder="비밀번호"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="hg-btn hg-btn--primary hg-login__submit"
            disabled={submitting}
          >
            {mode === "d" ? "삭제" : "확인"}
          </button>
        </form>
      </div>
    </main>
  );
}
