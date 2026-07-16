import {
  fallbackNoticePosts,
  fallbackQaPosts,
  getFallbackNoticePost,
  getFallbackQaPost,
} from "../data/boardFallback.js";
import { getAuthToken } from "./authAccess";
import { apiFetch } from "./apiClient";

function jsonHeaders(includeAuth = false) {
  const headers = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "요청 처리 중 오류가 발생했습니다.");
  }
  return data;
}

export async function fetchNoticePosts() {
  try {
    const response = await apiFetch("/notice");
    return await parseResponse(response);
  } catch {
    return fallbackNoticePosts.map(({ content: _content, ...post }) => post);
  }
}

export async function fetchNoticePost(id, { skipHit = false } = {}) {
  try {
    const query = skipHit ? "?hit=0" : "";
    const response = await apiFetch(`/notice/${id}${query}`);
    return await parseResponse(response);
  } catch {
    const post = getFallbackNoticePost(id);
    if (!post) {
      throw new Error("게시물을 찾을 수 없습니다.");
    }
    return post;
  }
}

export async function createNoticePost(payload) {
  const response = await apiFetch("/notice", {
    method: "POST",
    headers: jsonHeaders(true),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateNoticePost(id, payload) {
  const response = await apiFetch(`/notice/${id}`, {
    method: "PUT",
    headers: jsonHeaders(true),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deleteNoticePost(id) {
  const response = await apiFetch(`/notice/${id}`, {
    method: "DELETE",
    headers: jsonHeaders(true),
  });
  return parseResponse(response);
}

export async function fetchQaPosts() {
  try {
    const response = await apiFetch("/qa");
    return await parseResponse(response);
  } catch {
    return fallbackQaPosts.map(({ content: _content, ...post }) => post);
  }
}

export async function fetchQaPost(id) {
  try {
    const response = await apiFetch(`/qa/${id}`, {
      headers: jsonHeaders(true),
    });
    return await parseResponse(response);
  } catch {
    const post = getFallbackQaPost(id);
    if (!post) {
      throw new Error("게시물을 찾을 수 없습니다.");
    }
    if (post.isSecret) {
      const { content: _content, ...locked } = post;
      return locked;
    }
    return post;
  }
}

function appendQaFormFields(formData, payload) {
  formData.append("author", payload.author);
  formData.append("password", payload.password);
  formData.append("email", payload.email || "");
  formData.append("homepage", payload.homepage || "");
  formData.append("link1", payload.link1 || "");
  formData.append("link2", payload.link2 || "");
  formData.append("subject", payload.subject);
  formData.append("content", payload.content);
  formData.append("receiveMail", payload.receiveMail ? "true" : "false");
  if (payload.newPassword) {
    formData.append("newPassword", payload.newPassword);
  }
}

export async function createQaPost(payload, files = []) {
  const formData = new FormData();
  appendQaFormFields(formData, payload);
  const list = Array.isArray(files) ? files : files ? [files] : [];
  list.forEach((file) => {
    if (file) formData.append("attachments", file);
  });

  const response = await apiFetch("/qa", {
    method: "POST",
    body: formData,
  });
  return parseResponse(response);
}

export async function updateQaPost(id, payload, files = []) {
  const formData = new FormData();
  appendQaFormFields(formData, payload);
  const list = Array.isArray(files) ? files : files ? [files] : [];
  list.forEach((file) => {
    if (file) formData.append("attachments", file);
  });

  const response = await apiFetch(`/qa/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseResponse(response);
}

function parseFilenameFromDisposition(header) {
  if (!header) return "";
  const match = header.match(/filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i);
  if (!match) return "";
  try {
    return decodeURIComponent(match[1] || match[2] || "");
  } catch {
    return match[1] || match[2] || "";
  }
}

export async function downloadQaAttachment(id, password, attachmentId) {
  const headers = {};
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (password?.trim()) {
    headers["X-Qa-Password"] = password.trim();
  } else {
    throw new Error("첨부파일을 받으려면 비밀번호 확인이 필요합니다.");
  }

  const path = attachmentId
    ? `/qa/${id}/attachments/${attachmentId}`
    : `/qa/${id}/attachment`;
  const response = await apiFetch(path, { headers });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "첨부파일을 받을 수 없습니다.");
  }

  const blob = await response.blob();
  const filename =
    parseFilenameFromDisposition(response.headers.get("Content-Disposition")) ||
    `qa-attachment-${id}`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function deleteQaPost(id, password) {
  const response = await apiFetch(`/qa/${id}`, {
    method: "DELETE",
    headers: jsonHeaders(true),
    body: JSON.stringify(password ? { password } : {}),
  });
  return parseResponse(response);
}

export async function incrementQaHits(id) {
  const response = await apiFetch(`/qa/${id}/hit`, { method: "POST" });
  return parseResponse(response);
}

export async function verifyQaPost(id, password) {
  const response = await apiFetch(`/qa/${id}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return parseResponse(response);
}

export async function fetchAttendancePosts({ workDate = "", month = "" } = {}) {
  const params = new URLSearchParams();
  if (workDate) params.set("work_date", workDate);
  if (month) params.set("month", month);
  const query = params.toString();
  const response = await apiFetch(`/attendance${query ? `?${query}` : ""}`);
  return parseResponse(response);
}

export async function fetchAttendancePost(id) {
  const response = await apiFetch(`/attendance/${id}`, {
    headers: jsonHeaders(true),
  });
  return parseResponse(response);
}

export async function deleteAttendancePost(id) {
  const response = await apiFetch(`/attendance/${id}`, {
    method: "DELETE",
    headers: jsonHeaders(true),
  });
  return parseResponse(response);
}

export async function fetchAttendancePhotoBlob(id, photoId = null) {
  const photoPath = photoId ? `/attendance/${id}/photos/${photoId}` : `/attendance/${id}/photo`;
  const response = await apiFetch(photoPath, {
    headers: jsonHeaders(true),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "사진을 불러올 수 없습니다.");
  }
  return response.blob();
}
