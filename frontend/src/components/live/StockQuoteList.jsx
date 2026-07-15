import { WATCHLIST_STOCKS } from "../../data/watchlistStocks.js";
import {
  formatStockChange,
  formatStockPrice,
  getNaverFinanceUrl,
} from "./stockFormat.js";

const STOCK_NAME_BY_CODE = Object.fromEntries(
  WATCHLIST_STOCKS.map((stock) => [stock.code, stock.name])
);

function ChangeIcon({ direction }) {
  if (direction === "up") {
    return (
      <svg className="live-stock-change-icon" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M6 2L10 8H2L6 2Z" fill="currentColor" />
      </svg>
    );
  }
  if (direction === "down") {
    return (
      <svg className="live-stock-change-icon" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M6 10L2 4H10L6 10Z" fill="currentColor" />
      </svg>
    );
  }
  return <span className="live-stock-change-icon live-stock-change-icon--flat">−</span>;
}

function StockRangeBar({ position, direction }) {
  if (position == null) return null;

  return (
    <div className="live-stock-range" aria-hidden="true">
      <div className="live-stock-range-track">
        <span
          className={`live-stock-range-marker live-stock-range-marker--${direction}`}
          style={{ left: `${position}%` }}
        />
      </div>
      <div className="live-stock-range-labels">
        <span>저가</span>
        <span>고가</span>
      </div>
    </div>
  );
}

function StockQuoteCard({ stock }) {
  const direction =
    stock.direction ||
    (stock.change > 0 ? "up" : stock.change < 0 ? "down" : "flat");
  const displayName = STOCK_NAME_BY_CODE[stock.code] || stock.name;

  return (
    <li className={`live-stock-card live-stock-card--${direction}`}>
      <a
        className="live-stock-card-link"
        href={getNaverFinanceUrl(stock.code)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="live-stock-card-body">
          <div className="live-stock-card-top">
            <strong className="live-stock-name">{displayName}</strong>
            <span className="live-stock-code">{stock.code}</span>
          </div>
          <StockRangeBar position={stock.rangePosition} direction={direction} />
        </div>

        <div className="live-stock-card-price">
          <span className="live-stock-price">{formatStockPrice(stock.closePrice)}</span>
          <span className={`live-stock-change live-stock-change--${direction}`}>
            <ChangeIcon direction={direction} />
            {formatStockChange(stock.change, stock.changeRate)}
          </span>
        </div>
      </a>
    </li>
  );
}

export default function StockQuoteList({ stocks }) {
  return (
    <ul className="live-stock-list">
      {stocks.map((stock) => (
        <StockQuoteCard key={stock.code} stock={stock} />
      ))}
    </ul>
  );
}
