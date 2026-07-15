import { useState } from "react";
import { assets, navGroups, topLinks } from "../../data/mock";
import { HgNavLink } from "./HgNavLink";

export default function HgMobileMenu({ open, onClose }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className={`hg-drawer${open ? " is-open" : ""}`} aria-hidden={!open}>
      <div className="hg-drawer__backdrop" onClick={onClose} />
      <div className="hg-drawer__panel">
        <div className="hg-drawer__head">
          <img src={assets.logoWhite} alt="한화그린" />
          <button type="button" className="hg-drawer__close" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>
        <div className="hg-drawer__body">
          {navGroups.map((group, index) => (
            <div key={group.title} className="hg-drawer__group">
              <button
                type="button"
                className="hg-drawer__group-btn"
                onClick={() => setExpanded(expanded === index ? null : index)}
                aria-expanded={expanded === index}
              >
                {group.title}
                <span>{expanded === index ? "−" : "+"}</span>
              </button>
              {expanded === index && (
                <div className="hg-drawer__sub">
                  {group.items.map((item) => (
                    <HgNavLink key={item.label} item={item} onNavigate={onClose} />
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="hg-drawer__quick">
            {topLinks.map((link) => (
              <HgNavLink key={link.label} item={link} onNavigate={onClose} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
