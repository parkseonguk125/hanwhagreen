export default function CeoPageContent({ config }) {
  return (
    <section className="sec sec1">
      <h1 className="blind">회사소개</h1>
      <div className="inner">
        <div className="lf_box">
          <img src={config.photoUrl} alt="" />
        </div>
        <div className="rt_box">
          <div className="text_box">
            <h1
              className="tit"
              dangerouslySetInnerHTML={{ __html: config.headingHtml }}
            />
            <dl>
              <dt>
                <strong>{config.welcome}</strong>
              </dt>
              <dd className="txt">
                <p dangerouslySetInnerHTML={{ __html: config.bodyHtml }} />
              </dd>
              <dd className="sign">
                <p>{config.signature}</p>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
