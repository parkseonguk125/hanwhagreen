import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import HgHeader from "../components/v2/HgHeader";
import HgFooter from "../components/v2/HgFooter";
import HgSubLayout from "../components/v2/HgSubLayout";
import HgCompanyContent from "../components/v2/content/HgCompanyContent";
import HgCeoContent from "../components/v2/content/HgCeoContent";
import HgMapContent from "../components/v2/content/HgMapContent";
import HgTechnologyContent from "../components/v2/content/HgTechnologyContent";
import HgConstructionContent from "../components/v2/content/HgConstructionContent";
import { getContentPageConfig } from "../config/contentPages";
import { subNavGroups } from "../utils/navRoutes";
import { useHgReveal } from "../components/v2/hooks";

function renderContent(config) {
  switch (config.coId) {
    case "company":
      return <HgCompanyContent config={config} />;
    case "ceo":
      return <HgCeoContent config={config} />;
    case "map":
      return <HgMapContent config={config} />;
    case "technology":
      return <HgTechnologyContent config={config} />;
    case "construction":
      return <HgConstructionContent />;
    default:
      return null;
  }
}

export default function ContentPage() {
  const [searchParams] = useSearchParams();
  const coId = searchParams.get("co_id") || "";
  const config = getContentPageConfig(coId);
  useHgReveal([coId]);

  useEffect(() => {
    if (config) {
      document.title = `${config.title} | 한화그린`;
      return () => {
        document.title = "한화그린";
      };
    }
    document.title = "한화그린";
    return undefined;
  }, [config]);

  if (!config) {
    return (
      <>
        <HgHeader />
        <main className="hg-main">
          <div className="hg-container hg-board-loading">페이지를 찾을 수 없습니다.</div>
        </main>
        <HgFooter />
      </>
    );
  }

  const parentTitle = subNavGroups[config.navGroupIndex]?.title ?? "";

  return (
    <>
      <HgHeader />
      <HgSubLayout
        title={config.title}
        bannerUrl={config.banner}
        visualSubtitle={config.visualSubtitle}
        currentNavTitle={config.navTitle}
        navGroupIndex={config.navGroupIndex}
        parentTitle={parentTitle}
        wide={
          config.coId === "construction" ||
          config.coId === "company" ||
          config.coId === "ceo" ||
          config.coId === "map" ||
          config.coId === "technology"
        }
      >
        {renderContent(config)}
      </HgSubLayout>
      <HgFooter />
    </>
  );
}
