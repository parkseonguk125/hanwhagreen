import WeatherPanel from "./WeatherPanel.jsx";
import AirQualityPanel from "./AirQualityPanel.jsx";
import StockPanel from "./StockPanel.jsx";
import CompanyMapPanel from "./CompanyMapPanel.jsx";

export default function LiveInfoPanels({ gridClassName = "" }) {
  const gridClass = ["live-info-grid", gridClassName].filter(Boolean).join(" ");

  return (
    <div className={gridClass}>
      <WeatherPanel />
      <AirQualityPanel />
      <StockPanel />
      <CompanyMapPanel />
    </div>
  );
}
