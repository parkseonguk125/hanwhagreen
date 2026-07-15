import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import HgHeader from "../components/v2/HgHeader";
import HgFooter from "../components/v2/HgFooter";
import HgBoardTable from "../components/v2/HgBoardTable";
import NewsBoardView from "../components/board/NewsBoardView";
import {
  getNewsPost,
  incrementNewsHits,
  newsPosts,
} from "../services/boardStorage";

export default function NewsBoardPage() {
  const [searchParams] = useSearchParams();
  const wrId = searchParams.get("wr_id");
  const viewPost = useMemo(() => (wrId ? getNewsPost(wrId) : null), [wrId]);

  useEffect(() => {
    if (viewPost) {
      document.title = `${viewPost.subject} > 홍보영 | 한화그린`;
      incrementNewsHits(viewPost.id);
      return () => {
        document.title = "한화그린";
      };
    }

    document.title = "홍보영  페이지 | 한화그린";
    return () => {
      document.title = "한화그린";
    };
  }, [viewPost]);

  if (wrId) {
    if (!viewPost) {
      return (
        <>
          <HgHeader />
          <main className="hg-main">
            <div className="hg-sub-content">
              <p className="hg-board-loading">게시물을 찾을 수 없습니다.</p>
            </div>
          </main>
          <HgFooter />
        </>
      );
    }

    return (
      <>
        <HgHeader />
        <main className="hg-main">
          <div className="hg-sub-content">
            <NewsBoardView post={viewPost} />
          </div>
        </main>
        <HgFooter />
      </>
    );
  }

  return (
    <>
      <HgHeader />
      <main className="hg-main">
        <div className="hg-sub-content">
          <HgBoardTable posts={newsPosts} table="news" />
        </div>
      </main>
      <HgFooter />
    </>
  );
}
