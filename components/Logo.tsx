export function Logo() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <svg width="36" height="36" viewBox="0 0 80 80" aria-hidden="true">
        <rect width="80" height="80" rx="22" fill="#FF5A1F" />
        <path d="M20 58 C 32 58, 30 30, 46 30 S 60 44, 60 22" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
        <circle cx="20" cy="58" r="7" fill="#fff" />
        <circle cx="60" cy="22" r="7" fill="#121A3A" />
      </svg>
      <span style={{ fontFamily: "var(--font-sora)", fontWeight: 700, fontSize: 24 }}>excurfy</span>
    </span>
  );
}
