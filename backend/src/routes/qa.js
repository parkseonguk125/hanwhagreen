import { Router } from "express";
import path from "path";
import {
  createQaPost,
  deleteQaPost,
  getQaAttachmentById,
  getQaPost,
  getQaPostAttachmentMeta,
  getQaPostFull,
  incrementQaHits,
  listQaPosts,
  replaceQaAttachments,
  updateQaPost,
  verifyQaPassword,
} from "../db.js";
import { attachAdminIfPresent } from "../middleware/requireAdmin.js";
import {
  attachmentsFromUploads,
  deleteQaAttachmentFile,
  deleteQaAttachmentFiles,
  getQaAttachmentAbsolute,
} from "../qaFiles.js";
import { QA_MAX_FILES, qaUpload } from "../qaUpload.js";

const router = Router();
const MAX_QA_ATTACHMENTS = QA_MAX_FILES;

function parseReceiveMail(value) {
  return value === true || value === "true" || value === "1";
}

function uploadedQaFiles(req) {
  if (Array.isArray(req.files) && req.files.length) return req.files;
  if (req.file) return [req.file];
  return [];
}

async function canAccessQaAttachment(req, id) {
  if (await attachAdminIfPresent(req)) return true;
  const qaPassword = req.headers["x-qa-password"];
  if (qaPassword?.trim() && (await verifyQaPassword(id, qaPassword.trim()))) {
    return true;
  }
  return false;
}

router.get("/", async (_req, res, next) => {
  try {
    res.json(await listQaPosts());
  } catch (error) {
    next(error);
  }
});

router.get("/:id/attachments/:attachmentId", async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!(await canAccessQaAttachment(req, id))) {
      res.status(403).json({ message: "첨부파일을 받을 권한이 없습니다." });
      return;
    }

    const meta = await getQaAttachmentById(id, req.params.attachmentId);
    if (!meta?.attachment_path) {
      res.status(404).json({ message: "첨부파일이 없습니다." });
      return;
    }

    const filePath = getQaAttachmentAbsolute(meta.attachment_path);
    if (!filePath) {
      res.status(404).json({ message: "첨부파일을 찾을 수 없습니다." });
      return;
    }

    res.download(filePath, meta.attachment_name || path.basename(filePath));
  } catch (error) {
    next(error);
  }
});

router.get("/:id/attachment", async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!(await canAccessQaAttachment(req, id))) {
      res.status(403).json({ message: "첨부파일을 받을 권한이 없습니다." });
      return;
    }

    const meta = await getQaPostAttachmentMeta(id);
    if (!meta?.attachment_path) {
      res.status(404).json({ message: "첨부파일이 없습니다." });
      return;
    }

    const filePath = getQaAttachmentAbsolute(meta.attachment_path);
    if (!filePath) {
      res.status(404).json({ message: "첨부파일을 찾을 수 없습니다." });
      return;
    }

    res.download(filePath, meta.attachment_name || path.basename(filePath));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const isAdmin = await attachAdminIfPresent(req);

    if (isAdmin) {
      const post = await getQaPostFull(id);
      if (!post) {
        res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
        return;
      }
      await incrementQaHits(id);
      res.json(await getQaPostFull(id));
      return;
    }

    const post = await getQaPost(id, { includeContent: true });
    if (!post) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
      return;
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/verify", async (req, res, next) => {
  try {
    const { password } = req.body || {};
    const id = req.params.id;

    if (!password?.trim()) {
      res.status(400).json({ message: "비밀번호를 입력해 주세요." });
      return;
    }

    const post = await getQaPostFull(id);
    if (!post) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
      return;
    }

    if (!(await verifyQaPassword(id, password))) {
      res.status(401).json({ message: "비밀번호가 올바르지 않습니다." });
      return;
    }

    await incrementQaHits(id);
    res.json(await getQaPostFull(id));
  } catch (error) {
    next(error);
  }
});

router.post("/", qaUpload.array("attachments", MAX_QA_ATTACHMENTS), async (req, res, next) => {
  try {
    const body = req.body || {};
    const { author, password, email, homepage, subject, content, link1, link2 } = body;

    if (!author?.trim() || !password?.trim() || !subject?.trim() || !content?.trim()) {
      res.status(400).json({ message: "필수 항목을 입력해 주세요." });
      return;
    }

    const files = uploadedQaFiles(req);
    if (files.length > MAX_QA_ATTACHMENTS) {
      res.status(400).json({ message: `첨부파일은 최대 ${MAX_QA_ATTACHMENTS}개까지 가능합니다.` });
      return;
    }

    const attachments = attachmentsFromUploads(files);
    const first = attachments[0] || { attachmentName: "", attachmentPath: "" };

    const post = await createQaPost({
      author: author.trim(),
      password,
      email: (email || "").trim(),
      homepage: (homepage || "").trim(),
      link1: (link1 || "").trim(),
      link2: (link2 || "").trim(),
      subject: subject.trim(),
      content: content.trim(),
      receiveMail: parseReceiveMail(body.receiveMail),
      attachmentName: first.attachmentName,
      attachmentPath: first.attachmentPath,
      attachments,
    });

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", qaUpload.array("attachments", MAX_QA_ATTACHMENTS), async (req, res, next) => {
  try {
    const body = req.body || {};
    const id = req.params.id;
    const { password, author, email, homepage, subject, content, link1, link2 } = body;

    if (!password?.trim()) {
      res.status(400).json({ message: "비밀번호를 입력해 주세요." });
      return;
    }

    if (!author?.trim() || !subject?.trim() || !content?.trim()) {
      res.status(400).json({ message: "필수 항목을 입력해 주세요." });
      return;
    }

    if (!(await verifyQaPassword(id, password))) {
      res.status(401).json({ message: "비밀번호가 올바르지 않습니다." });
      return;
    }

    const updatePayload = {
      author: author.trim(),
      email: (email || "").trim(),
      homepage: (homepage || "").trim(),
      link1: (link1 || "").trim(),
      link2: (link2 || "").trim(),
      subject: subject.trim(),
      content: content.trim(),
      receiveMail: parseReceiveMail(body.receiveMail),
      newPassword: body.newPassword,
    };

    const post = await updateQaPost(id, updatePayload);

    if (!post) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
      return;
    }

    const files = uploadedQaFiles(req);
    if (files.length) {
      if (files.length > MAX_QA_ATTACHMENTS) {
        res.status(400).json({ message: `첨부파일은 최대 ${MAX_QA_ATTACHMENTS}개까지 가능합니다.` });
        return;
      }
      const attachments = attachmentsFromUploads(files);
      const removedPaths = await replaceQaAttachments(id, attachments);
      deleteQaAttachmentFiles(removedPaths);
      res.json(await getQaPostFull(id));
      return;
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { password } = req.body || {};
    const id = req.params.id;
    const isAdmin = await attachAdminIfPresent(req);

    if (!isAdmin) {
      if (!password?.trim()) {
        res.status(400).json({ message: "비밀번호를 입력해 주세요." });
        return;
      }

      if (!(await verifyQaPassword(id, password))) {
        res.status(401).json({ message: "비밀번호가 올바르지 않습니다." });
        return;
      }
    }

    const meta = await getQaPostAttachmentMeta(id);
    const deleted = await deleteQaPost(id);
    if (!deleted) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
      return;
    }

    const paths = (meta?.attachments || [])
      .map((item) => item.attachment_path)
      .filter(Boolean);
    if (paths.length) {
      deleteQaAttachmentFiles(paths);
    } else if (meta?.attachment_path) {
      deleteQaAttachmentFile(meta.attachment_path);
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/hit", async (req, res, next) => {
  try {
    const post = await getQaPost(req.params.id, { includeContent: true });
    if (!post) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
      return;
    }

    if (post.isSecret) {
      res.status(403).json({ message: "비밀글은 비밀번호 확인 후 열람할 수 있습니다." });
      return;
    }

    res.json(await incrementQaHits(req.params.id));
  } catch (error) {
    next(error);
  }
});

export default router;
