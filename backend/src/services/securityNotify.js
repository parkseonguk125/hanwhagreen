import { notifyAdmin } from "./notify.js";

const MIN_SEVERITY = Number(process.env.SECURITY_NOTIFY_MIN_SEVERITY ?? 2);

const SEVERITY_LABEL = {
  1: "S1 관찰",
  2: "S2 주의",
  3: "S3 경고",
  4: "S4 치명",
};

/**
 * @param {{ severity: number, key: string, title: string, detail?: string, hint?: string }} payload
 */
export async function notifySecurityEvent(payload) {
  const severity = Number(payload.severity) || 1;
  if (severity < MIN_SEVERITY) {
    return { ok: false, skipped: true, reason: "below_min_severity" };
  }

  const label = SEVERITY_LABEL[severity] || `S${severity}`;
  return notifyAdmin({
    key: `security:${payload.key}`,
    title: `${label}: ${payload.title}`,
    detail: payload.detail,
    hint: payload.hint,
  });
}
