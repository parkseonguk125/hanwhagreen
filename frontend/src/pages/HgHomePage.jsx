import HgHeader from "../components/v2/HgHeader";
import HgFooter from "../components/v2/HgFooter";
import HgHomeRedesign from "../components/v2/HgHomeRedesign";

export default function HgHomePage() {
  return (
    <>
      <HgHeader />
      <main className="hg-main hg-main--home">
        <HgHomeRedesign />
      </main>
      <HgFooter />
    </>
  );
}
