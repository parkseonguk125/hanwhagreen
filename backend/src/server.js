import express from "express";
import { getClientIp, logSecurityEvent } from "./middleware/securityLogger.js";
import authRouter from "./routes/auth.js";
import noticeRouter from "./routes/notice.js";
import qaRouter from "./routes/qa.js";
import attendanceRouter from "./routes/attendance.js";
import liveDataRouter from "./routes/liveData.js";
import { checkDbHealth, initDb } from "./db.js";
import { ensureAttendanceUploadDir } from "./attendanceFiles.js";
import { ensureQaUploadDir } from "./qaFiles.js";
import { startDbHealthMonitor } from "./services/dbHealthMonitor.js";
import { notifyDbFailure, notifyServerError } from "./services/notify.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Qa-Password, X-App-Key"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode !== 401 && res.statusCode !== 403) return;
    const path = req.originalUrl || req.url || "";
    if (!path.startsWith("/api/")) return;
    if (path.startsWith("/api/auth/login")) return;
    logSecurityEvent({
      event: "auth_denied",
      severity: 1,
      ip: getClientIp(req),
      detail: `${req.method} ${path} status=${res.statusCode}`,
    });
  });
  next();
});

app.get("/api/ping", (_req, res) => {
  res.json({ status: "up" });
});

app.get("/api/health", async (_req, res) => {
  try {
    await checkDbHealth();
    res.json({ status: "ok", database: "postgresql" });
  } catch (error) {
    console.error(error);
    notifyDbFailure("GET /api/health", error.message).catch((notifyError) => {
      console.error("[notify] health alert failed:", notifyError.message);
    });
    res.status(503).json({ status: "error", message: "데이터베이스 연결 실패" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/notice", noticeRouter);
app.use("/api/qa", qaRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/live", liveDataRouter);

app.use((err, req, res, _next) => {
  if (err?.name === "MulterError") {
    const messages = {
      LIMIT_FILE_SIZE: "첨부파일 용량이 너무 큽니다. 파일당 최대 200MB까지 업로드할 수 있습니다.",
      LIMIT_FILE_COUNT: "첨부파일 개수가 너무 많습니다. 최대 10개까지 가능합니다.",
      LIMIT_UNEXPECTED_FILE: "허용되지 않은 첨부 필드입니다.",
    };
    const message = messages[err.code] || "첨부파일 업로드에 실패했습니다.";
    res.status(400).json({ message });
    return;
  }

  console.error(err);
  notifyServerError(err, req).catch((notifyError) => {
    console.error("[notify] server error alert failed:", notifyError.message);
  });
  res.status(500).json({ message: "서버 오류가 발생했습니다." });
});

async function start() {
  ensureQaUploadDir();
  ensureAttendanceUploadDir();
  try {
    await initDb();
    console.log("Database initialized");
  } catch (error) {
    console.error("Database init failed — API stays up for monitoring:", error.message);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API server listening on port ${PORT}`);
    startDbHealthMonitor();
  });
}

start().catch((error) => {
  console.error("Failed to start API server:", error);
  process.exit(1);
});
