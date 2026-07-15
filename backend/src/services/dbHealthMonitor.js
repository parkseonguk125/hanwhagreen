import { checkDbHealth } from "../db.js";
import { notifyDbFailure, notifyDbRecovered } from "./notify.js";

const INTERVAL_MS = Number(process.env.DB_HEALTH_CHECK_MS ?? 15_000);
let timer = null;
let lastOk = true;

async function tick() {
  try {
    await checkDbHealth();
    if (!lastOk) {
      lastOk = true;
      await notifyDbRecovered().catch((error) => {
        console.error("[dbHealthMonitor] recover notify failed:", error.message);
      });
    }
  } catch (error) {
    if (lastOk) {
      lastOk = false;
      console.error("[dbHealthMonitor] DB check failed:", error.message);
      await notifyDbFailure("dbHealthMonitor", error.message).catch((notifyError) => {
        console.error("[dbHealthMonitor] alert failed:", notifyError.message);
      });
    }
  }
}

export function startDbHealthMonitor() {
  if (process.env.ADMIN_NOTIFY_ENABLED !== "1") return;
  if (timer) return;

  timer = setInterval(() => {
    tick().catch((error) => console.error("[dbHealthMonitor]", error));
  }, INTERVAL_MS);

  console.log(`[dbHealthMonitor] started (every ${INTERVAL_MS / 1000}s)`);
}

export function stopDbHealthMonitor() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
