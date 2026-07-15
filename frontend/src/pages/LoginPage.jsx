import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HgHeader from "../components/v2/HgHeader";
import HgFooter from "../components/v2/HgFooter";
import { isLoginRateLimitError, loginMember } from "../services/authApi";
import { isLoggedIn, storeAuth } from "../services/authAccess";
import {
  formatLockoutRemaining,
  getLoginLockoutAlertMessage,
  getLoginLockoutRemainingSeconds,
  setLoginLockout,
} from "../services/loginLockout";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("url") || "/";

  const [form, setForm] = useState({
    mb_id: "",
    mb_password: "",
    auto_login: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(() =>
    getLoginLockoutRemainingSeconds()
  );

  const isLockedOut = lockoutSeconds > 0;

  useEffect(() => {
    document.title = "로그인 | 한화그린";

    if (isLoggedIn()) {
      navigate(returnUrl, { replace: true });
    }

    return () => {
      document.title = "한화그린";
    };
  }, [navigate, returnUrl]);

  useEffect(() => {
    const syncLockout = () => {
      setLockoutSeconds(getLoginLockoutRemainingSeconds());
    };

    syncLockout();
    const timer = window.setInterval(syncLockout, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleAutoLoginChange = (event) => {
    if (isLockedOut) return;

    const checked = event.target.checked;
    if (checked) {
      const confirmed = window.confirm(
        "자동로그인을 사용하시면 다음부터 회원아이디와 비밀번호를 입력하실 필요가 없습니다.\n\n공공장소에서는 개인정보가 유출될 수 있으니 사용을 자제하여 주십시오.\n\n자동로그인을 사용하시겠습니까?"
      );
      setForm((prev) => ({ ...prev, auto_login: confirmed }));
      return;
    }

    setForm((prev) => ({ ...prev, auto_login: false }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLockedOut) {
      window.alert(getLoginLockoutAlertMessage(lockoutSeconds));
      return;
    }

    if (!form.mb_id.trim()) {
      alert("회원아이디를 입력해 주세요.");
      return;
    }

    if (!form.mb_password.trim()) {
      alert("비밀번호를 입력해 주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await loginMember({
        mb_id: form.mb_id.trim(),
        mb_password: form.mb_password,
        auto_login: form.auto_login,
      });

      storeAuth(
        { token: data.token, member: data.member },
        { persistent: form.auto_login }
      );

      navigate(returnUrl, { replace: true });
    } catch (error) {
      if (isLoginRateLimitError(error)) {
        const retryAfterSeconds = error.retryAfterSeconds || 300;
        const seconds = setLoginLockout(retryAfterSeconds);
        const remaining = Math.max(1, Math.ceil((seconds - Date.now()) / 1000));
        setLockoutSeconds(remaining);
        window.alert(getLoginLockoutAlertMessage(remaining));
        setForm((prev) => ({ ...prev, mb_password: "" }));
        return;
      }

      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <HgHeader />
      <main className="hg-main hg-login-page">
        <div className="hg-login">
          <header className="hg-login__head">
            <p className="hg-login__eyebrow">Member Login</p>
            <h1 className="hg-login__title">로그인</h1>
            <p className="hg-login__desc">한화그린 서비스 이용을 위해 로그인해 주세요.</p>
          </header>

          <div className="hg-login__body">
            {isLockedOut ? (
              <div className="hg-login__error" role="alert">
                <strong>로그인 일시 제한</strong>
                <p>로그인 가능 횟수를 초과했습니다.</p>
                <p>
                  <span className="hg-login__error-time">
                    {formatLockoutRemaining(lockoutSeconds)}
                  </span>{" "}
                  후에 다시 로그인해 주세요.
                </p>
              </div>
            ) : null}

            <form name="flogin" id="flogin" onSubmit={handleSubmit}>
              <input type="hidden" name="url" value={returnUrl} readOnly />

              <fieldset id="login_fs" disabled={isLockedOut} className="hg-login__fieldset">
                <legend className="hg-sr-only">회원로그인</legend>

                <div className="hg-login__field">
                  <label htmlFor="login_id">
                    아이디<strong className="hg-sr-only"> 필수</strong>
                  </label>
                  <div className="hg-login__input-wrap">
                    <span className="hg-login__input-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="17" height="17">
                        <circle
                          cx="12"
                          cy="8"
                          r="3.6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M5 20c1.2-3.2 3.9-4.8 7-4.8s5.8 1.6 7 4.8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      name="mb_id"
                      id="login_id"
                      required
                      placeholder="아이디를 입력해 주세요"
                      value={form.mb_id}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, mb_id: event.target.value }))
                      }
                      disabled={submitting || isLockedOut}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="hg-login__field">
                  <label htmlFor="login_pw">
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
                      name="mb_password"
                      id="login_pw"
                      required
                      placeholder="비밀번호를 입력해 주세요"
                      value={form.mb_password}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, mb_password: event.target.value }))
                      }
                      disabled={submitting || isLockedOut}
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <label className="hg-write__toggle hg-login__auto" htmlFor="login_auto_login">
                  <input
                    type="checkbox"
                    name="auto_login"
                    id="login_auto_login"
                    checked={form.auto_login}
                    onChange={handleAutoLoginChange}
                    disabled={submitting || isLockedOut}
                  />
                  <span className="hg-write__toggle-track" aria-hidden="true">
                    <span className="hg-write__toggle-thumb" />
                  </span>
                  <span className="hg-write__toggle-label">자동 로그인</span>
                </label>

                <button
                  type="submit"
                  className="hg-login__submit"
                  disabled={submitting || isLockedOut}
                >
                  {isLockedOut
                    ? `로그인 제한 (${formatLockoutRemaining(lockoutSeconds)})`
                    : submitting
                      ? "로그인 중..."
                      : "로그인"}
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </main>
      <HgFooter />
    </>
  );
}
