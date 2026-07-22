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

/* 문의 데이터는 신뢰가 중요한 영역이므로 API 실패 시 임의 게시물을 노출하지 않는다. */
export const fallbackQaPosts = [];

export function getFallbackNoticePost(id) {
  return fallbackNoticePosts.find((post) => post.id === Number(id)) || null;
}

export function getFallbackQaPost(id) {
  return fallbackQaPosts.find((post) => post.id === Number(id)) || null;
}
