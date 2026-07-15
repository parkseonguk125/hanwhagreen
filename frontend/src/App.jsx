import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import HgHomePage from "./pages/HgHomePage";
import ContentPage from "./pages/ContentPage";
import BoardRouter from "./pages/BoardRouter";
import BoardWritePage from "./pages/BoardWritePage";
import BoardPasswordPage from "./pages/BoardPasswordPage";
import LoginPage from "./pages/LoginPage";
import NewsLinkPage from "./pages/NewsLinkPage";

function ScrollToTop() {
  const { pathname, search } = useLocation();

  // 페이지네이션(page)·분류 필터(sca)만 바뀔 때는 스크롤 위치를 유지하고,
  // 실제 페이지(게시판·게시물)가 바뀔 때만 최상단으로 이동
  const params = new URLSearchParams(search);
  const scrollKey = [
    pathname,
    params.get("bo_table") || "",
    params.get("co_id") || "",
    params.get("wr_id") || "",
    params.get("w") || "",
  ].join("|");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [scrollKey]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HgHomePage />} />
        <Route path="/bbs/content.php" element={<ContentPage />} />
        <Route path="/bbs/board.php" element={<BoardRouter />} />
        <Route path="/bbs/write.php" element={<BoardWritePage />} />
        <Route path="/bbs/password.php" element={<BoardPasswordPage />} />
        <Route path="/bbs/login.php" element={<LoginPage />} />
        <Route path="/bbs/link.php" element={<NewsLinkPage />} />
      </Routes>
    </>
  );
}
