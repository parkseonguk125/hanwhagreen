import { Router } from "express";
import {
  createNoticePost,
  deleteNoticePost,
  getNoticePost,
  listNoticePosts,
  updateNoticePost,
} from "../db.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

function validateNoticeBody(body) {
  const { subject, content, author } = body || {};
  if (!subject?.trim() || !content?.trim()) {
    return "제목과 내용을 입력해 주세요.";
  }
  return null;
}

router.get("/", async (_req, res, next) => {
  try {
    res.json(await listNoticePosts());
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const message = validateNoticeBody(req.body);
    if (message) {
      res.status(400).json({ message });
      return;
    }

    const post = await createNoticePost({
      subject: req.body.subject.trim(),
      author: (req.body.author || req.member?.mb_name || "관리자").trim(),
      content: req.body.content.trim(),
    });
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const incrementHits = req.query.hit !== "0";
    const post = await getNoticePost(req.params.id, { incrementHits });
    if (!post) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
      return;
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    const message = validateNoticeBody(req.body);
    if (message) {
      res.status(400).json({ message });
      return;
    }

    const post = await updateNoticePost(req.params.id, {
      subject: req.body.subject.trim(),
      author: (req.body.author || req.member?.mb_name || "관리자").trim(),
      content: req.body.content.trim(),
    });

    if (!post) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
      return;
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const deleted = await deleteNoticePost(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
      return;
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
