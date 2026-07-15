const SIZE_MAP = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 45,
  hero: 64,
};

function SvgWrap({ size = "md", className = "", children, viewBox = "0 0 24 24" }) {
  const dim = typeof size === "number" ? size : SIZE_MAP[size] || 20;

  return (
    <svg
      className={`hg-icon ${className}`.trim()}
      width={dim}
      height={dim}
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

const icons = {
  at: ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <path
        d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z M12 16v3 M9.5 19h5"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </SvgWrap>
  ),
  "mega-phone": ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <path
        d="M5 9 9 5h4l6 6v4l-4 4H9L5 15V9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinejoin="round"
      />
      <path d="M13 5l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 11h2v2H8z" fill="currentColor" />
    </SvgWrap>
  ),
  headphone: ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <path
        d="M4 14v3a2 2 0 0 0 2 2h1v-7H6a2 2 0 0 0-2 2Zm14 0v3a2 2 0 0 1-2 2h-1v-7h2a2 2 0 0 1 2 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M6 12a6 6 0 0 1 12 0"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </SvgWrap>
  ),
  badge: ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <circle cx="12" cy="10" r="6" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <path
        d="M8.5 15.5 12 21l3.5-5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinejoin="round"
      />
      <path d="M10 10h4M12 8v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </SvgWrap>
  ),
  lock: ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <rect x="6" y="11" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </SvgWrap>
  ),
  "chevron-down": ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgWrap>
  ),
  "chevron-up": ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <path
        d="M6 15l6-6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgWrap>
  ),
  "chevron-left": ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <path
        d="M15 6 9 12l6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgWrap>
  ),
  "chevron-right": ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgWrap>
  ),
  "arrow-right": ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <path
        d="M5 12h12M13 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgWrap>
  ),
  "arrow-up": ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <path
        d="M12 19V5M7 10l5-5 5 5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgWrap>
  ),
  "eco-energy": ({ size, className }) => (
    <SvgWrap size={size} className={className} viewBox="0 0 48 48">
      <path
        d="M24 4C14 14 10 22 10 28a14 14 0 0 0 28 0c0-6-4-14-14-24Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M24 18v14M18 25h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </SvgWrap>
  ),
  search: ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M16 16l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </SvgWrap>
  ),
  pencil: ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <path
        d="M4 20l12-12 4 4L8 24H4v-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
      />
      <path d="M13 7l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </SvgWrap>
  ),
  times: ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </SvgWrap>
  ),
  home: ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <path
        d="M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1V11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
      />
    </SvgWrap>
  ),
  message: ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <path
        d="M4 5h16v10H8l-4 4V5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
      />
    </SvgWrap>
  ),
  link: ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <path
        d="M10 14a4 4 0 0 1 0-5.7l1.3-1.3a4 4 0 0 1 5.7 5.7l-.8.8"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M14 10a4 4 0 0 1 0 5.7l-1.3 1.3a4 4 0 0 1-5.7-5.7l.8-.8"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </SvgWrap>
  ),
  "folder-open": ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <path
        d="M4 8V18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H9L7 7H5a1 1 0 0 0-1 1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinejoin="round"
      />
    </SvgWrap>
  ),
  instagram: ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="4"
        ry="4"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="17" cy="7" r="1" fill="currentColor" />
    </SvgWrap>
  ),
  youtube: ({ size, className }) => (
    <SvgWrap size={size} className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
    </SvgWrap>
  ),
  facebook: ({ size, className }) => (
    <SvgWrap size={size} className={className}>
      <path
        d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H6v4h3v8h4v-8h3l1-4h-4V9c0-.6.4-1 1-1Z"
        fill="currentColor"
      />
    </SvgWrap>
  ),
};

export default function Icon({ name, size = "md", className = "" }) {
  const Component = icons[name];
  if (!Component) return null;
  return <Component size={size} className={className} />;
}

export function HeroArrow({ direction, className = "" }) {
  return (
    <Icon
      name={direction === "prev" ? "chevron-left" : "chevron-right"}
      size="hero"
      className={`hero-arrow-icon ${className}`.trim()}
    />
  );
}
