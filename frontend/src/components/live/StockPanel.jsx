import { fetchLiveStocks } from "../../services/liveDataApi.js";
import useLivePanelPoll from "./useLivePanelPoll.js";
import StockQuoteList from "./StockQuoteList.jsx";

function shouldPollStocks(result) {
  return (result?.pollIntervalMs ?? 0) > 0;
}

export default function StockPanel() {
  const { data, error, loading } = useLivePanelPoll(fetchLiveStocks, {
    shouldPoll: shouldPollStocks,
  });

  const statusLabel = data?.marketStatusLabel || (data?.live ? "실시간" : "종가");

  return (
    <article className="live-panel live-panel-stocks">
      <header className="live-stock-header">
        <div className="live-stock-header-left">
          <span className="live-stock-market-badge">KOSPI</span>
          <h3>핵심 주가</h3>
        </div>
        <div className="live-stock-header-right">
          {data?.basDtDisplay && (
            <span className="live-stock-time-meta">{data.basDtDisplay}</span>
          )}
        </div>
      </header>

      {data?.stocks && (
        <div className="live-stock-summary" aria-hidden="true">
          <span className="live-stock-summary-count">{data.stocks.length}종목</span>
          <span className="live-stock-summary-divider" />
          <span className="live-stock-summary-status">{statusLabel}</span>
        </div>
      )}

      <div className="live-panel-body live-panel-body-stocks">
        {loading && !data && <p className="live-panel-status">시세 불러오는 중…</p>}
        {error && <p className="live-panel-error">{error}</p>}
        {data?.note && <p className="live-stock-fallback-note">{data.note}</p>}
        {data?.stocks && <StockQuoteList stocks={data.stocks} />}
      </div>
    </article>
  );
}
