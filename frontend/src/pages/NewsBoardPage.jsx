import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import HgHeader from "../components/v2/HgHeader";
import HgFooter from "../components/v2/HgFooter";
import HgSubLayout from "../components/v2/HgSubLayout";
import HgBoardTable from "../components/v2/HgBoardTable";
import NewsBoardView from "../components/board/NewsBoardView";
import { boardBanners } from "../config/boardBanners";
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
      document.title = `${viewPost.subject} | 홍보영상 | 한화그린`;
      incrementNewsHits(viewPost.id);
      return () => {
        document.title = "한화그린";
      };
    }

    document.title = "홍보영상 | 한화그린";
    return () => {
      document.title = "한화그린";
    };
  }, [viewPost]);

  if (wrId) {
    if (!viewPost) {
      return (
        <>
          <HgHeader />
          <HgSubLayout
            title="홍보영상"
            bannerUrl={boardBanners.company}
            currentNavTitle="홍보영상"
            hideNav
          >
            <p className="hg-board-loading">게시물을 찾을 수 없습니다.</p>
          </HgSubLayout>
          <HgFooter />
        </>
      );
    }

    return (
      <>
        <HgHeader />
        <HgSubLayout
          title="홍보영상"
          bannerUrl={boardBanners.company}
          currentNavTitle="홍보영상"
          hideNav
        >
          <NewsBoardView post={viewPost} />
        </HgSubLayout>
        <HgFooter />
      </>
    );
  }

  return (
    <>
      <HgHeader />
      <HgSubLayout
        title="홍보영상"
        bannerUrl={boardBanners.company}
        visualSubtitle="현장 영상으로 한화그린의 기술을 확인하세요."
        currentNavTitle="홍보영상"
        hideNav
      >
        <section className="hg-proj__lead is-armed">
          <h2 className="hg-proj__headline">
            <span className="hg-proj__headline-line">현장에서 확인하는</span>
            <span className="hg-proj__headline-line">
              한화그린 <strong>홍보영상</strong>
            </span>
          </h2>
          <p className="hg-proj__sub">
            폐수처리·액비순환·악취저감 관련 현장 영상을 모았습니다.
          </p>
        </section>
        <HgBoardTable posts={newsPosts} table="news" />
      </HgSubLayout>
      <HgFooter />
    </>
  );
}
