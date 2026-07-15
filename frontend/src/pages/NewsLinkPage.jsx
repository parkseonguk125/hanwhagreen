import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getNewsPost } from "../services/boardStorage";

export default function NewsLinkPage() {
  const [searchParams] = useSearchParams();
  const table = searchParams.get("bo_table");
  const wrId = searchParams.get("wr_id");

  useEffect(() => {
    if (table !== "news" || !wrId) return;

    const post = getNewsPost(wrId);
    if (post?.relatedLink) {
      window.location.replace(post.relatedLink);
    }
  }, [table, wrId]);

  return null;
}
