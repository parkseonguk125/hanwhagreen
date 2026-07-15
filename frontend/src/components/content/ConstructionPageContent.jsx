import { constructionRecords } from "../../data/constructionRecords";

export default function ConstructionPageContent() {
  return (
    <section className="listSkin">
      <div className="inner">
        <div id="bo_list">
          <div className="tbl_head01 tbl_wrap table-responsive">
            <table>
              <caption> 목록</caption>
              <thead>
                <tr>
                  <th scope="col">번호</th>
                  <th scope="col">년도</th>
                  <th scope="col">발주처</th>
                  <th scope="col">지역</th>
                  <th scope="col">대표</th>
                  <th scope="col">공사종류</th>
                  <th scope="col">용량 (m2/D)</th>
                  <th scope="col">비교</th>
                </tr>
              </thead>
              <tbody>
                {constructionRecords.map((row, index) => (
                  <tr key={row.no} className={index % 2 === 0 ? "even" : ""}>
                    <td className="td_num2">{row.no}</td>
                    <td className="td_date">{row.year}</td>
                    <td className="td_subject">{row.client}</td>
                    <td className="td_date">{row.region}</td>
                    <td className="td_date">{row.rep}</td>
                    <td className="td_subject">{row.type}</td>
                    <td className="td_date">{row.capacity}</td>
                    <td className="td_date">{row.compare}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
