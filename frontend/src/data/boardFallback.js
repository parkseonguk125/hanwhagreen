/** API 연결 실패 시 공지·문의 목록/상세에 사용하는 기본 데이터 */
export const fallbackNoticePosts = [
  {
    id: 1,
    isNotice: true,
    subject: "한화그린 홈페이지 리뉴얼",
    author: "관리자",
    hits: 3437,
    date: "04-11",
    viewDate: "2024-04-11",
    content:
      "한화그린 홈페이지가 리뉴얼 되었습니다.\n\n많은 관심과 사랑 부탁드립니다.",
  },
];

export const fallbackQaPosts = [
  {
    id: 18,
    status: "접수완료",
    isSecret: true,
    subject:
      "카지노 솔루션 | 슬롯 솔루션 | 홀덤 솔루션 | 라이브 홀덤 솔루션 | 에보소프트",
    author: "토지노 솔루션",
    hits: 1,
    date: "02-09",
    listDate: "02-09",
    viewDate: "2026-02-09",
    content: "온라인 문의드립니다.",
    email: "",
    homepage: "",
    link1: "",
    link2: "",
    attachmentName: "",
    hasAttachment: true,
    receiveMail: true,
  },
];

export function getFallbackNoticePost(id) {
  return fallbackNoticePosts.find((post) => post.id === Number(id)) || null;
}

export function getFallbackQaPost(id) {
  return fallbackQaPosts.find((post) => post.id === Number(id)) || null;
}
