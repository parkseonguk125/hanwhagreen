import { useSearchParams } from "react-router-dom";
import NoticeBoardPage from "./NoticeBoardPage";
import NewsBoardPage from "./NewsBoardPage";
import QaBoardPage from "./QaBoardPage";
import AttendanceBoardPage from "./AttendanceBoardPage";
import GalleryBoardPage from "./GalleryBoardPage";

export default function BoardRouter() {
  const [searchParams] = useSearchParams();
  const table = searchParams.get("bo_table") || "notice";

  if (table === "qa") {
    return <QaBoardPage />;
  }

  if (table === "attendance") {
    return <AttendanceBoardPage />;
  }

  if (table === "news") {
    return <NewsBoardPage />;
  }

  if (table === "project") {
    return <GalleryBoardPage table="project" />;
  }

  if (table === "certification") {
    return <GalleryBoardPage table="certification" />;
  }

  return <NoticeBoardPage />;
}
