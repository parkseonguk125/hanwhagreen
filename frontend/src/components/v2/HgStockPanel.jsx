import { fetchLiveStocks } from "../../services/liveDataApi.js";
import useLivePanelPoll from "../live/useLivePanelPoll.js";

function changeClass(rate) {
  if (rate > 0) return "hg-stock__change--up";
  if (rate < 0) return "hg-stock__change--down";
  return "hg-stock__change--flat";
}

export default function HgStockPanel() {
  const { data, error, loading } = useLivePanelPoll(fetchLiveStocks, {
    shouldPoll: (r) => (r?.pollIntervalMs ?? 0) > 0,
  });

  return (
    <article className="hg-live__panel">
      <header className="hg-live__panel-head">
        <h3 className="hg-live__panel-title">핵심 주가</h3>
        <span className="hg-live__panel-updated">
          {data?.basDtDisplay || (data?.live ? "실시간" : "종가")}
        </span>
      </header>
      {loading && !data && <p className="hg-live__loading">시세 불러오는 중…</p>}
      {error && <p className="hg-live__error">{error}</p>}
      {data?.note && <p className="hg-live__error">{data.note}</p>}
      {data?.stocks && (
        <div className="hg-stock__list">
          {data.stocks.map((stock) => (
            <div key={stock.name} className="hg-stock__row">
              <span className="hg-stock__name">{stock.name}</span>
              <span className="hg-stock__price">
                {stock.closePrice != null ? stock.closePrice.toLocaleString() : "—"}
              </span>
              <span className={changeClass(stock.changeRate)}>
                {stock.changeRate != null
                  ? `${stock.changeRate > 0 ? "+" : ""}${stock.changeRate.toFixed(2)}%`
                  : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
