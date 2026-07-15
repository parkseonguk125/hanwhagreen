import crypto from "crypto";
import fs from "fs";
import path from "path";

export const UPLOAD_DIR =
  process.env.ATTENDANCE_UPLOAD_DIR ||
  path.join(process.cwd(), "uploads", "attendance");

export function ensureAttendanceUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function photoFromUpload(file) {
  if (!file) return { photoName: "", photoPath: "" };
  return {
    photoName: file.originalname || file.filename,
    photoPath: file.filename,
  };
}

export function photosFromUploads(files = []) {
  if (!Array.isArray(files)) return [];
  return files
    .filter(Boolean)
    .map((file) => photoFromUpload(file))
    .filter((photo) => photo.photoPath);
}

export function deleteAttendancePhotoFiles(storedNames = []) {
  for (const storedName of storedNames) {
    deleteAttendancePhotoFile(storedName);
  }
}

export function getAttendancePhotoAbsolute(storedName) {
  if (!storedName) return null;
  const safe = path.basename(storedName);
  const full = path.join(UPLOAD_DIR, safe);
  if (!fs.existsSync(full)) return null;
  return full;
}

export function deleteAttendancePhotoFile(storedName) {
  const full = getAttendancePhotoAbsolute(storedName);
  if (full) {
    try {
      fs.unlinkSync(full);
    } catch {
      /* ignore */
    }
  }
}
