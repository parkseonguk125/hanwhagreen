import crypto from "crypto";
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

/** DB 시드용 임시 관리자 (배포 전 변경 권장) */
export const SEED_ADMIN_ID = "admin";
export const SEED_ADMIN_PASSWORD = "green1234";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://hanwha:hanwha_local@localhost:5432/hanwhagreen",
});

pool.on("error", (err) => {
  console.error("[db] pool idle client error:", err.message);
});

function formatBoardDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

function formatViewDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatViewTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatViewDateInSeoul(value) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

function mapNoticeRow(row, { includeContent = true } = {}) {
  if (!row) return null;

  const post = {
    id: row.id,
    isNotice: Boolean(row.is_notice),
    subject: row.subject,
    author: row.author,
    hits: row.hits,
    date: formatBoardDate(row.created_at),
    viewDate: formatViewDate(row.created_at),
  };

  if (includeContent) {
    post.content = row.content;
  }

  return post;
}

function mapQaRow(row, { includeContent = true, attachments = [] } = {}) {
  if (!row) return null;

  const normalizedAttachments = (attachments || [])
    .map((item) => ({
      id: item.id,
      name: item.attachment_name || item.name || "",
    }))
    .filter((item) => item.id && item.name);

  const legacyName = row.attachment_name || "";
  const firstName = normalizedAttachments[0]?.name || legacyName;

  const post = {
    id: row.id,
    status: row.status,
    isSecret: Boolean(row.is_secret),
    subject: row.subject,
    author: row.author,
    hits: row.hits,
    date: formatBoardDate(row.created_at),
    viewDate: formatViewDate(row.created_at),
    email: row.email || "",
    homepage: row.homepage || "",
    link1: row.link1 || "",
    link2: row.link2 || "",
    attachments: normalizedAttachments,
    attachmentName: firstName,
    hasAttachment: normalizedAttachments.length > 0 || Boolean(row.attachment_path) || Boolean(legacyName),
    receiveMail: Boolean(row.receive_mail),
  };

  if (includeContent) {
    post.content = row.content;
  }

  return post;
}

async function listQaAttachmentRows(postId) {
  const { rows } = await pool.query(
    `
      SELECT id, attachment_name, attachment_path, sort_order
      FROM qa_post_attachments
      WHERE post_id = $1
      ORDER BY sort_order ASC, id ASC
    `,
    [Number(postId)]
  );
  return rows;
}

async function mapQaRowWithAttachments(row, options = {}) {
  if (!row) return null;
  const attachments = await listQaAttachmentRows(row.id);
  return mapQaRow(row, { ...options, attachments });
}

export async function replaceQaAttachments(postId, attachments = []) {
  const id = Number(postId);
  const existing = await listQaAttachmentRows(id);

  await pool.query("DELETE FROM qa_post_attachments WHERE post_id = $1", [id]);

  const first = attachments[0] || { attachmentName: "", attachmentPath: "" };
  await pool.query(
    `
      UPDATE qa_posts
      SET attachment_name = $1, attachment_path = $2
      WHERE id = $3
    `,
    [first.attachmentName || "", first.attachmentPath || "", id]
  );

  for (let i = 0; i < attachments.length; i += 1) {
    const item = attachments[i];
    if (!item?.attachmentPath) continue;
    await pool.query(
      `
        INSERT INTO qa_post_attachments (post_id, attachment_name, attachment_path, sort_order)
        VALUES ($1, $2, $3, $4)
      `,
      [id, item.attachmentName || "", item.attachmentPath, i]
    );
  }

  return existing.map((row) => row.attachment_path).filter(Boolean);
}

export async function getQaAttachmentById(postId, attachmentId) {
  const { rows } = await pool.query(
    `
      SELECT id, attachment_name, attachment_path
      FROM qa_post_attachments
      WHERE post_id = $1 AND id = $2
    `,
    [Number(postId), Number(attachmentId)]
  );
  return rows[0] || null;
}

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notice_posts (
      id SERIAL PRIMARY KEY,
      is_notice BOOLEAN NOT NULL DEFAULT TRUE,
      subject TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT '관리자',
      content TEXT NOT NULL,
      hits INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS qa_posts (
      id SERIAL PRIMARY KEY,
      status TEXT NOT NULL DEFAULT '접수완료',
      is_secret BOOLEAN NOT NULL DEFAULT TRUE,
      subject TEXT NOT NULL,
      author TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT DEFAULT '',
      homepage TEXT DEFAULT '',
      content TEXT NOT NULL,
      receive_mail BOOLEAN NOT NULL DEFAULT TRUE,
      hits INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS members (
      mb_id VARCHAR(20) PRIMARY KEY,
      mb_password_hash TEXT NOT NULL,
      mb_name TEXT NOT NULL DEFAULT '',
      mb_level INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS member_sessions (
      token TEXT PRIMARY KEY,
      mb_id VARCHAR(20) NOT NULL REFERENCES members(mb_id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_member_sessions_mb_id ON member_sessions(mb_id);
    CREATE INDEX IF NOT EXISTS idx_member_sessions_expires ON member_sessions(expires_at);
  `);

  await migrateQaPosts();
  await migrateAttendanceReports();
  await seedDb();
}

async function migrateAttendanceReports() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS attendance_reports (
      id SERIAL PRIMARY KEY,
      subject TEXT NOT NULL,
      work_date DATE NOT NULL,
      work_content TEXT NOT NULL,
      personnel_count INTEGER NOT NULL DEFAULT 1,
      reporter_name TEXT NOT NULL DEFAULT '',
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      address TEXT DEFAULT '',
      photo_name TEXT DEFAULT '',
      photo_path TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS attendance_report_photos (
      id SERIAL PRIMARY KEY,
      report_id INTEGER NOT NULL REFERENCES attendance_reports(id) ON DELETE CASCADE,
      photo_name TEXT NOT NULL DEFAULT '',
      photo_path TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_attendance_report_photos_report_id
      ON attendance_report_photos(report_id);
  `);

  await pool.query(`
    INSERT INTO attendance_report_photos (report_id, photo_name, photo_path, sort_order)
    SELECT id, photo_name, photo_path, 0
    FROM attendance_reports
    WHERE photo_path <> ''
      AND NOT EXISTS (
        SELECT 1 FROM attendance_report_photos p WHERE p.report_id = attendance_reports.id
      );
  `);
}

async function migrateQaPosts() {
  await pool.query(`
    ALTER TABLE qa_posts ADD COLUMN IF NOT EXISTS link1 TEXT DEFAULT '';
    ALTER TABLE qa_posts ADD COLUMN IF NOT EXISTS link2 TEXT DEFAULT '';
    ALTER TABLE qa_posts ADD COLUMN IF NOT EXISTS attachment_name TEXT DEFAULT '';
    ALTER TABLE qa_posts ADD COLUMN IF NOT EXISTS attachment_path TEXT DEFAULT '';

    CREATE TABLE IF NOT EXISTS qa_post_attachments (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES qa_posts(id) ON DELETE CASCADE,
      attachment_name TEXT NOT NULL DEFAULT '',
      attachment_path TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_qa_post_attachments_post_id
      ON qa_post_attachments(post_id);
  `);

  await pool.query(`
    INSERT INTO qa_post_attachments (post_id, attachment_name, attachment_path, sort_order)
    SELECT id, attachment_name, attachment_path, 0
    FROM qa_posts
    WHERE attachment_path <> ''
      AND NOT EXISTS (
        SELECT 1 FROM qa_post_attachments a WHERE a.post_id = qa_posts.id
      );
  `);
}

async function seedDb() {
  const noticeCount = await pool.query("SELECT COUNT(*)::int AS count FROM notice_posts");
  if (noticeCount.rows[0].count === 0) {
    await pool.query(
      `
        INSERT INTO notice_posts (id, is_notice, subject, author, content, hits, created_at)
        VALUES ($1, TRUE, $2, $3, $4, $5, $6)
      `,
      [
        1,
        "한화그린 홈페이지 리뉴얼",
        "관리자",
        "한화그린 홈페이지가 리뉴얼 되었습니다.\n\n많은 관심과 사랑 부탁드립니다.",
        3437,
        "2024-04-11T00:00:00+09:00",
      ]
    );
    await pool.query(
      "SELECT setval(pg_get_serial_sequence('notice_posts', 'id'), (SELECT MAX(id) FROM notice_posts))"
    );
  }

  const qaCount = await pool.query("SELECT COUNT(*)::int AS count FROM qa_posts");
  if (qaCount.rows[0].count === 0) {
    await pool.query(
      `
        INSERT INTO qa_posts (
          id, status, is_secret, subject, author, password_hash,
          email, homepage, content, receive_mail, hits, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `,
      [
        18,
        "접수완료",
        true,
        "카지노 솔루션 | 슬롯 솔루션 | 홀덤 솔루션 | 라이브 홀덤 솔루션 | 에보소프트",
        "토지노 솔루션",
        bcrypt.hashSync("seed", 10),
        "",
        "",
        "온라인 문의드립니다.",
        true,
        1,
        "2026-02-09T00:00:00+09:00",
      ]
    );
    await pool.query(
      "SELECT setval(pg_get_serial_sequence('qa_posts', 'id'), (SELECT MAX(id) FROM qa_posts))"
    );
  }

  const memberCount = await pool.query("SELECT COUNT(*)::int AS count FROM members");
  if (memberCount.rows[0].count === 0) {
    await pool.query(
      `
        INSERT INTO members (mb_id, mb_password_hash, mb_name, mb_level)
        VALUES ($1, $2, $3, $4)
      `,
      [
        SEED_ADMIN_ID,
        bcrypt.hashSync(SEED_ADMIN_PASSWORD, 10),
        "관리자",
        10,
      ]
    );
  }
}

function mapMemberRow(row) {
  if (!row) return null;
  return {
    mb_id: row.mb_id,
    mb_name: row.mb_name,
    mb_level: row.mb_level,
  };
}

export async function verifyMemberLogin(mbId, password) {
  const { rows } = await pool.query(
    "SELECT mb_id, mb_password_hash, mb_name, mb_level FROM members WHERE mb_id = $1",
    [mbId]
  );
  const row = rows[0];
  if (!row || !bcrypt.compareSync(password, row.mb_password_hash)) {
    return null;
  }
  return mapMemberRow(row);
}

export async function createMemberSession(mbId, persistent = false) {
  const token = crypto.randomBytes(32).toString("hex");
  const hours = persistent ? 24 * 30 : 12;
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

  await pool.query(
    `
      INSERT INTO member_sessions (token, mb_id, expires_at)
      VALUES ($1, $2, $3)
    `,
    [token, mbId, expiresAt]
  );

  return { token, expiresAt: expiresAt.toISOString() };
}

export async function getMemberBySession(token) {
  await pool.query("DELETE FROM member_sessions WHERE expires_at < NOW()");

  const { rows } = await pool.query(
    `
      SELECT m.mb_id, m.mb_name, m.mb_level
      FROM member_sessions s
      JOIN members m ON m.mb_id = s.mb_id
      WHERE s.token = $1 AND s.expires_at > NOW()
    `,
    [token]
  );
  return mapMemberRow(rows[0]);
}

export async function deleteMemberSession(token) {
  const { rowCount } = await pool.query("DELETE FROM member_sessions WHERE token = $1", [
    token,
  ]);
  return rowCount > 0;
}

export async function listNoticePosts() {
  const { rows } = await pool.query(
    "SELECT * FROM notice_posts ORDER BY id DESC"
  );
  return rows.map((row) => mapNoticeRow(row, { includeContent: false }));
}

export async function getNoticePost(id, { incrementHits = false } = {}) {
  if (incrementHits) {
    await pool.query("UPDATE notice_posts SET hits = hits + 1 WHERE id = $1", [
      Number(id),
    ]);
  }

  const { rows } = await pool.query("SELECT * FROM notice_posts WHERE id = $1", [
    Number(id),
  ]);
  return mapNoticeRow(rows[0], { includeContent: true });
}

export async function listQaPosts() {
  const { rows } = await pool.query("SELECT * FROM qa_posts ORDER BY id DESC");
  return Promise.all(rows.map((row) => mapQaRowWithAttachments(row, { includeContent: false })));
}

export async function getQaPost(id, { includeContent = true } = {}) {
  const { rows } = await pool.query("SELECT * FROM qa_posts WHERE id = $1", [
    Number(id),
  ]);
  const row = rows[0];
  if (!row) return null;

  const shouldIncludeContent = includeContent && !row.is_secret;
  return mapQaRowWithAttachments(row, { includeContent: shouldIncludeContent });
}

export async function getQaPostFull(id) {
  const { rows } = await pool.query("SELECT * FROM qa_posts WHERE id = $1", [
    Number(id),
  ]);
  return mapQaRowWithAttachments(rows[0], { includeContent: true });
}

export async function verifyQaPassword(id, password) {
  const { rows } = await pool.query(
    "SELECT password_hash FROM qa_posts WHERE id = $1",
    [Number(id)]
  );
  if (!rows[0]) return false;
  return bcrypt.compareSync(password, rows[0].password_hash);
}

export async function createQaPost(payload) {
  const attachments = Array.isArray(payload.attachments)
    ? payload.attachments.filter((item) => item?.attachmentPath)
    : payload.attachmentPath
      ? [
          {
            attachmentName: payload.attachmentName || "",
            attachmentPath: payload.attachmentPath,
          },
        ]
      : [];
  const first = attachments[0] || { attachmentName: "", attachmentPath: "" };

  const { rows } = await pool.query(
    `
      INSERT INTO qa_posts (
        status, is_secret, subject, author, password_hash,
        email, homepage, link1, link2, content,
        attachment_name, attachment_path, receive_mail, hits
      ) VALUES (
        '접수완료', TRUE, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0
      )
      RETURNING id
    `,
    [
      payload.subject,
      payload.author,
      bcrypt.hashSync(payload.password, 10),
      payload.email || "",
      payload.homepage || "",
      payload.link1 || "",
      payload.link2 || "",
      payload.content,
      first.attachmentName || "",
      first.attachmentPath || "",
      Boolean(payload.receiveMail),
    ]
  );

  const postId = rows[0].id;
  if (attachments.length) {
    await replaceQaAttachments(postId, attachments);
  }

  return getQaPostFull(postId);
}

export async function incrementQaHits(id) {
  await pool.query("UPDATE qa_posts SET hits = hits + 1 WHERE id = $1", [
    Number(id),
  ]);
  return getQaPost(id);
}

export async function createNoticePost(payload) {
  const { rows } = await pool.query(
    `
      INSERT INTO notice_posts (is_notice, subject, author, content, hits)
      VALUES (TRUE, $1, $2, $3, 0)
      RETURNING id
    `,
    [payload.subject, payload.author || "관리자", payload.content]
  );
  return getNoticePost(rows[0].id);
}

export async function updateNoticePost(id, payload) {
  const { rowCount } = await pool.query(
    `
      UPDATE notice_posts
      SET subject = $1, author = $2, content = $3
      WHERE id = $4
    `,
    [payload.subject, payload.author || "관리자", payload.content, Number(id)]
  );
  if (!rowCount) return null;
  return getNoticePost(id);
}

export async function deleteNoticePost(id) {
  const { rowCount } = await pool.query("DELETE FROM notice_posts WHERE id = $1", [
    Number(id),
  ]);
  return rowCount > 0;
}

export async function getQaPostAttachmentMeta(id) {
  const attachments = await listQaAttachmentRows(id);
  if (attachments.length) {
    return {
      attachment_name: attachments[0].attachment_name,
      attachment_path: attachments[0].attachment_path,
      attachments,
    };
  }

  const { rows } = await pool.query(
    "SELECT attachment_name, attachment_path FROM qa_posts WHERE id = $1",
    [Number(id)]
  );
  const row = rows[0] || null;
  if (!row) return null;
  return {
    ...row,
    attachments: row.attachment_path
      ? [
          {
            id: null,
            attachment_name: row.attachment_name,
            attachment_path: row.attachment_path,
            sort_order: 0,
          },
        ]
      : [],
  };
}

export async function updateQaPost(id, payload) {
  const base = [
    payload.subject,
    payload.author,
    payload.email || "",
    payload.homepage || "",
    payload.link1 || "",
    payload.link2 || "",
    payload.content,
    Boolean(payload.receiveMail),
    Number(id),
  ];

  let rowCount;
  if (payload.newPassword?.trim()) {
    const result = await pool.query(
      `
        UPDATE qa_posts
        SET subject = $1, author = $2, email = $3, homepage = $4,
            link1 = $5, link2 = $6, content = $7, receive_mail = $8, password_hash = $9
        WHERE id = $10
      `,
      [...base.slice(0, 8), bcrypt.hashSync(payload.newPassword, 10), base[8]]
    );
    rowCount = result.rowCount;
  } else {
    const result = await pool.query(
      `
        UPDATE qa_posts
        SET subject = $1, author = $2, email = $3, homepage = $4,
            link1 = $5, link2 = $6, content = $7, receive_mail = $8
        WHERE id = $9
      `,
      base
    );
    rowCount = result.rowCount;
  }

  if (!rowCount) return null;
  return getQaPostFull(id);
}

export async function deleteQaPost(id) {
  const { rowCount } = await pool.query("DELETE FROM qa_posts WHERE id = $1", [
    Number(id),
  ]);
  return rowCount > 0;
}

export async function checkDbHealth() {
  await pool.query("SELECT 1");
}

function mapAttendanceRow(row, { includeDetail = false } = {}) {
  if (!row) return null;

  const post = {
    id: row.id,
    subject: row.subject,
    listSubject: buildAttendanceListSubject(row),
    workDate: formatViewDate(row.work_date),
    reporterName: row.reporter_name || "",
    date: formatBoardDate(row.created_at),
    viewDate: formatViewDateInSeoul(row.created_at),
    registeredTime: formatViewTime(row.created_at),
  };

  if (includeDetail) {
    post.workContent = row.work_content;
    post.personnelCount = row.personnel_count;
    post.latitude = row.latitude;
    post.longitude = row.longitude;
    post.address = row.address || "";
    post.detailSubject = buildAttendanceDetailSubject(row);
    post.photoName = row.photo_name || "";
    post.photos = [];
    post.photoCount = 0;
    post.hasPhoto = Boolean(row.photo_path);
  }

  return post;
}

async function attachAttendancePhotos(post) {
  if (!post) return post;

  const { rows } = await pool.query(
    `
      SELECT id, photo_name, photo_path, sort_order
      FROM attendance_report_photos
      WHERE report_id = $1
      ORDER BY sort_order ASC, id ASC
    `,
    [Number(post.id)]
  );

  if (rows.length > 0) {
    post.photos = rows.map((row) => ({
      id: row.id,
      photoName: row.photo_name || "",
      sortOrder: row.sort_order,
    }));
    post.photoCount = post.photos.length;
    post.hasPhoto = post.photoCount > 0;
    post.photoName = post.photos[0]?.photoName || post.photoName;
    return post;
  }

  if (post.hasPhoto) {
    post.photos = [
      {
        id: null,
        photoName: post.photoName || "현장 사진",
        sortOrder: 0,
        legacy: true,
      },
    ];
    post.photoCount = 1;
  }

  return post;
}

function validateAttendanceDateFilter(value) {
  if (!value?.trim()) return "";
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  return "";
}

function validateAttendanceMonthFilter(value) {
  if (!value?.trim()) return "";
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}$/.test(trimmed)) return trimmed;
  return "";
}

function monthToDateRange(month) {
  const [year, monthNum] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNum, 0).getDate();
  const mm = String(monthNum).padStart(2, "0");
  return {
    fromDate: `${year}-${mm}-01`,
    toDate: `${year}-${mm}-${String(lastDay).padStart(2, "0")}`,
  };
}

export async function listAttendanceReports({ workDate, month, fromDate, toDate } = {}) {
  const conditions = [];
  const params = [];

  const exactDate = validateAttendanceDateFilter(workDate);
  const monthKey = validateAttendanceMonthFilter(month);

  if (exactDate) {
    params.push(exactDate);
    conditions.push(`work_date = $${params.length}`);
  } else if (monthKey) {
    const range = monthToDateRange(monthKey);
    params.push(range.fromDate);
    conditions.push(`work_date >= $${params.length}`);
    params.push(range.toDate);
    conditions.push(`work_date <= $${params.length}`);
  } else {
    const from = validateAttendanceDateFilter(fromDate);
    const to = validateAttendanceDateFilter(toDate);
    if (from) {
      params.push(from);
      conditions.push(`work_date >= $${params.length}`);
    }
    if (to) {
      params.push(to);
      conditions.push(`work_date <= $${params.length}`);
    }
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM attendance_reports ${whereClause} ORDER BY id DESC`,
    params
  );
  return rows.map((row) => mapAttendanceRow(row, { includeDetail: false }));
}

export async function getAttendanceReport(id, { includeDetail = false } = {}) {
  const { rows } = await pool.query(
    "SELECT * FROM attendance_reports WHERE id = $1",
    [Number(id)]
  );
  return mapAttendanceRow(rows[0], { includeDetail });
}

export async function getAttendanceReportFull(id) {
  const post = await getAttendanceReport(id, { includeDetail: true });
  return attachAttendancePhotos(post);
}

export async function getAttendancePhotoMeta(id, photoId = null) {
  if (photoId) {
    const { rows } = await pool.query(
      `
        SELECT p.photo_name, p.photo_path
        FROM attendance_report_photos p
        WHERE p.report_id = $1 AND p.id = $2
      `,
      [Number(id), Number(photoId)]
    );
    if (rows[0]) {
      return {
        photo_name: rows[0].photo_name,
        photo_path: rows[0].photo_path,
      };
    }
  }

  const { rows } = await pool.query(
    `
      SELECT photo_name, photo_path
      FROM attendance_report_photos
      WHERE report_id = $1
      ORDER BY sort_order ASC, id ASC
      LIMIT 1
    `,
    [Number(id)]
  );
  if (rows[0]) {
    return {
      photo_name: rows[0].photo_name,
      photo_path: rows[0].photo_path,
    };
  }

  const legacy = await pool.query(
    "SELECT photo_name, photo_path FROM attendance_reports WHERE id = $1",
    [Number(id)]
  );
  if (!legacy.rows[0]?.photo_path) return null;
  return {
    photo_name: legacy.rows[0].photo_name,
    photo_path: legacy.rows[0].photo_path,
  };
}

export async function listAttendancePhotoPaths(reportId) {
  const { rows } = await pool.query(
    `
      SELECT photo_path
      FROM attendance_report_photos
      WHERE report_id = $1
    `,
    [Number(reportId)]
  );
  const paths = rows.map((row) => row.photo_path).filter(Boolean);

  if (paths.length > 0) return paths;

  const legacy = await pool.query(
    "SELECT photo_path FROM attendance_reports WHERE id = $1",
    [Number(reportId)]
  );
  if (legacy.rows[0]?.photo_path) {
    return [legacy.rows[0].photo_path];
  }
  return [];
}

function compactAttendanceText(text, maxLen) {
  const oneLine = String(text || "").trim().replace(/\s+/g, " ");
  if (!oneLine) return "-";
  if (oneLine.length <= maxLen) return oneLine;
  return `${oneLine.slice(0, maxLen)}…`;
}

function compactAttendanceLocation(row) {
  const address = String(row.address || "").trim().replace(/\s+/g, " ");
  if (address) return compactAttendanceText(address, 18);
  if (row.latitude != null && row.longitude != null) return "현장(GPS)";
  return "장소 미등록";
}

function formatAttendanceLocationFull(row) {
  const address = String(row.address || "").trim().replace(/\s+/g, " ");
  if (address) return address;
  if (row.latitude != null && row.longitude != null) return "현장(GPS)";
  return "장소 미등록";
}

/** 어디서 · 누가 · 무엇을 (목록용 — 짧게) */
function buildAttendanceListSubject(row) {
  const where = compactAttendanceLocation(row);
  const who = row.reporter_name?.trim() || "-";
  const what = compactAttendanceText(row.work_content, 22);
  return `${where} · ${who} · ${what}`;
}

/** 어디서 · 누가 · 무엇을 (상세용 — 전체) */
function buildAttendanceDetailSubject(row) {
  const where = formatAttendanceLocationFull(row);
  const who = row.reporter_name?.trim() || "-";
  const what = String(row.work_content || "").trim().replace(/\s+/g, " ") || "-";
  return `${where} · ${who} · ${what}`;
}

function buildAttendanceSubject(workDate, reporterName, workContent, address) {
  return buildAttendanceDetailSubject({
    work_date: workDate,
    reporter_name: reporterName,
    work_content: workContent,
    address,
  });
}

export async function createAttendanceReport(payload, photos = []) {
  const workDate = payload.workDate;
  const reporterName = payload.reporterName?.trim() || "";
  const workContent = payload.workContent?.trim() || "";
  const subject =
    payload.subject?.trim() ||
    buildAttendanceSubject(workDate, reporterName, workContent, payload.address);

  const firstPhoto = photos[0] || { photoName: "", photoPath: "" };

  const { rows } = await pool.query(
    `
      INSERT INTO attendance_reports (
        subject, work_date, work_content, personnel_count,
        reporter_name, latitude, longitude, address,
        photo_name, photo_path
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `,
    [
      subject,
      workDate,
      workContent,
      Number(payload.personnelCount) || 1,
      reporterName,
      payload.latitude ?? null,
      payload.longitude ?? null,
      payload.address?.trim() || "",
      firstPhoto.photoName || "",
      firstPhoto.photoPath || "",
    ]
  );

  const reportId = rows[0].id;

  for (let index = 0; index < photos.length; index += 1) {
    const photo = photos[index];
    await pool.query(
      `
        INSERT INTO attendance_report_photos (report_id, photo_name, photo_path, sort_order)
        VALUES ($1, $2, $3, $4)
      `,
      [reportId, photo.photoName || "", photo.photoPath, index]
    );
  }

  return getAttendanceReportFull(reportId);
}

export async function deleteAttendanceReport(id) {
  const photoPaths = await listAttendancePhotoPaths(id);

  const { rowCount } = await pool.query(
    "DELETE FROM attendance_reports WHERE id = $1",
    [Number(id)]
  );

  return { deleted: rowCount > 0, photoPaths };
}
