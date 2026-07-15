import crypto from "crypto";
import path from "path";
import multer from "multer";
import { UPLOAD_DIR, ensureAttendanceUploadDir } from "./attendanceFiles.js";

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    ensureAttendanceUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || "") || "";
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
  },
});

export const attendanceUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 20 },
});
