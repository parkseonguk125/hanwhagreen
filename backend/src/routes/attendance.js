import { Router } from "express";

import path from "path";

import {

  createAttendanceReport,

  deleteAttendanceReport,

  getAttendancePhotoMeta,

  getAttendanceReportFull,

  listAttendanceReports,

} from "../db.js";

import {

  deleteAttendancePhotoFiles,

  getAttendancePhotoAbsolute,

  photosFromUploads,

} from "../attendanceFiles.js";

import { attendanceUpload } from "../attendanceUpload.js";

import { requireAppKey } from "../middleware/requireAppKey.js";

import { requireAdmin } from "../middleware/requireAdmin.js";



const router = Router();



function parsePersonnelCount(value) {

  const count = Number.parseInt(String(value ?? "1"), 10);

  if (!Number.isFinite(count) || count < 1) return 1;

  return Math.min(count, 999);

}



function parseCoordinate(value) {

  if (value === undefined || value === null || value === "") return null;

  const num = Number(value);

  return Number.isFinite(num) ? num : null;

}



function validateWorkDate(value) {

  if (!value?.trim()) return null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;

  return value.trim();

}



function validateCreateBody(body) {

  const workDate = validateWorkDate(body?.work_date ?? body?.workDate);

  const workContent = body?.work_content?.trim() || body?.workContent?.trim() || "";



  if (!workDate) {

    return { error: "작업일(work_date)은 YYYY-MM-DD 형식이어야 합니다." };

  }

  if (!workContent) {

    return { error: "작업 내용(work_content)을 입력해 주세요." };

  }



  return {

    payload: {

      workDate,

      workContent,

      reporterName: body?.reporter_name?.trim() || body?.reporterName?.trim() || "",

      personnelCount: parsePersonnelCount(

        body?.personnel_count ?? body?.personnelCount

      ),

      latitude: parseCoordinate(body?.latitude),

      longitude: parseCoordinate(body?.longitude),

      address: body?.address?.trim() || "",

      subject: body?.subject?.trim() || "",

    },

  };

}



async function sendAttendancePhoto(res, meta) {

  if (!meta?.photo_path) {

    res.status(404).json({ message: "사진이 없습니다." });

    return;

  }



  const filePath = getAttendancePhotoAbsolute(meta.photo_path);

  if (!filePath) {

    res.status(404).json({ message: "사진 파일을 찾을 수 없습니다." });

    return;

  }



  res.download(filePath, meta.photo_name || path.basename(filePath));

}



router.get("/", async (req, res, next) => {

  try {

    res.json(
      await listAttendanceReports({
        workDate: req.query.work_date || req.query.workDate || "",
        month: req.query.month || "",
        fromDate: req.query.from || "",
        toDate: req.query.to || "",
      })
    );

  } catch (error) {

    next(error);

  }

});



router.post("/", requireAppKey, attendanceUpload.array("photo", 20), async (req, res, next) => {

  try {

    const validated = validateCreateBody(req.body);

    if (validated.error) {

      res.status(400).json({ message: validated.error });

      return;

    }



    const photos = photosFromUploads(req.files);

    const post = await createAttendanceReport(validated.payload, photos);



    res.status(201).json(post);

  } catch (error) {

    next(error);

  }

});



router.get("/:id/photos/:photoId", requireAdmin, async (req, res, next) => {

  try {

    const meta = await getAttendancePhotoMeta(req.params.id, req.params.photoId);

    await sendAttendancePhoto(res, meta);

  } catch (error) {

    next(error);

  }

});



router.get("/:id/photo", requireAdmin, async (req, res, next) => {

  try {

    const meta = await getAttendancePhotoMeta(req.params.id);

    await sendAttendancePhoto(res, meta);

  } catch (error) {

    next(error);

  }

});



router.get("/:id", requireAdmin, async (req, res, next) => {

  try {

    const post = await getAttendanceReportFull(req.params.id);

    if (!post) {

      res.status(404).json({ message: "출결 기록을 찾을 수 없습니다." });

      return;

    }

    res.json(post);

  } catch (error) {

    next(error);

  }

});



router.delete("/:id", requireAdmin, async (req, res, next) => {

  try {

    const { deleted, photoPaths } = await deleteAttendanceReport(req.params.id);

    if (!deleted) {

      res.status(404).json({ message: "출결 기록을 찾을 수 없습니다." });

      return;

    }

    if (photoPaths?.length) {

      deleteAttendancePhotoFiles(photoPaths);

    }

    res.json({ ok: true });

  } catch (error) {

    next(error);

  }

});



export default router;

