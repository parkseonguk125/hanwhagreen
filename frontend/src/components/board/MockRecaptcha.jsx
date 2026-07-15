export default function MockRecaptcha({ checked, onChange, id = "recaptcha-check" }) {
  return (
    <fieldset id="captcha" className="captcha recaptcha mock-recaptcha">
      <div className="mock-recaptcha-box">
        <label className="mock-recaptcha-label" htmlFor={id}>
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span className="mock-recaptcha-text">로봇이 아닙니다</span>
        </label>
        <div className="mock-recaptcha-brand">
          <span className="mock-recaptcha-logo" aria-hidden="true" />
          <span>reCAPTCHA</span>
          <small>개인정보 보호 - 약관</small>
        </div>
      </div>
    </fieldset>
  );
}
