import HgHeader from "../components/v2/HgHeader";
import HgFooter from "../components/v2/HgFooter";
import HgHero from "../components/v2/HgHero";
import HgAreaSection from "../components/v2/HgAreaSection";
import HgVisionBand from "../components/v2/HgVisionBand";
import HgProduct from "../components/v2/HgProduct";
import HgCertGallery from "../components/v2/HgCertGallery";
import HgStoryVision from "../components/v2/HgStoryVision";
import HgStatsSection from "../components/v2/HgStatsSection";
import HgNewsSection from "../components/v2/HgNewsSection";
import HgContactCta from "../components/v2/HgContactCta";
import { useHgReveal } from "../components/v2/hooks";

export default function HgHomePage() {
  useHgReveal();

  return (
    <>
      <HgHeader />
      <main className="hg-main hg-main--home">
        <HgHero />
        <HgAreaSection />
        <HgVisionBand />
        <HgProduct />
        <HgCertGallery />
        <HgStoryVision />
        <HgStatsSection />
        <HgNewsSection />
        <HgContactCta />
      </main>
      <HgFooter />
    </>
  );
}
