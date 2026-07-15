import crypto from "crypto";
import fs from "fs";
import path from "path";

export const UPLOAD_DIR =
  process.env.QA_UPLOAD_DIR || path.join(process.cwd(), "uploads", "qa");

export function ensureQaUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function attachmentFromUpload(file) {
  if (!file) return { attachmentName: "", attachmentPath: "" };
  return {
    attachmentName: file.originalname || file.filename,
    attachmentPath: file.filename,
  };
}

export function getQaAttachmentAbsolute(storedName) {
  if (!storedName) return null;
  const safe = path.basename(storedName);
  const full = path.join(UPLOAD_DIR, safe);
  if (!fs.existsSync(full)) return null;
  return full;
}

export function deleteQaAttachmentFile(storedName) {
  const full = getQaAttachmentAbsolute(storedName);
  if (full) {
    try {
      fs.unlinkSync(full);
    } catch {
      /* ignore */
    }
  }
}
