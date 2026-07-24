import crypto from "crypto";
import path from "path";
import multer from "multer";
import { UPLOAD_DIR, ensureQaUploadDir } from "./qaFiles.js";

/** 문의 첨부 1개당 최대 용량 (nginx client_max_body_size 220m 미만) */
export const QA_MAX_FILE_SIZE_BYTES =
  Math.max(1, Number(process.env.QA_MAX_FILE_SIZE_MB) || 200) * 1024 * 1024;

export const QA_MAX_FILES = Math.max(1, Number(process.env.QA_MAX_FILES) || 10);

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    ensureQaUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || "") || "";
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
  },
});

export const qaUpload = multer({
  storage,
  limits: {
    fileSize: QA_MAX_FILE_SIZE_BYTES,
    files: QA_MAX_FILES,
  },
});
