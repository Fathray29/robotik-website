export function getBrandLogoSvg(size = 36, idPrefix = 'hdr'): string {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="shrink-0">
      <defs>
        <linearGradient id="gold-${idPrefix}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FEF08A" />
          <stop offset="45%" stop-color="#FACC15" />
          <stop offset="100%" stop-color="#A16207" />
        </linearGradient>
        <linearGradient id="silver-${idPrefix}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F8FAFC" />
          <stop offset="55%" stop-color="#94A3B8" />
          <stop offset="100%" stop-color="#334155" />
        </linearGradient>
        <radialGradient id="cyan-${idPrefix}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#67E8F9" />
          <stop offset="70%" stop-color="#06B6D4" />
          <stop offset="100%" stop-color="#083344" />
        </radialGradient>
      </defs>
      <g transform="translate(64, 108)">
        <circle cx="0" cy="0" r="14" fill="url(#silver-${idPrefix})" stroke="#0F172A" stroke-width="1" />
        <circle cx="0" cy="0" r="9" fill="#020617" />
        <circle cx="0" cy="0" r="7" fill="url(#cyan-${idPrefix})" />
        <circle cx="0" cy="0" r="3.5" fill="#020617" />
      </g>
      <g transform="translate(136, 108)">
        <circle cx="0" cy="0" r="14" fill="url(#silver-${idPrefix})" stroke="#0F172A" stroke-width="1" />
        <circle cx="0" cy="0" r="9" fill="#020617" />
        <circle cx="0" cy="0" r="7" fill="url(#cyan-${idPrefix})" />
        <circle cx="0" cy="0" r="3.5" fill="#020617" />
      </g>
      <g transform="translate(100, 150)">
        <circle cx="0" cy="0" r="18" fill="url(#silver-${idPrefix})" stroke="#0F172A" stroke-width="1" />
        <circle cx="0" cy="0" r="11" fill="#020617" />
      </g>
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 100,45 L 35,45 L 35,125 L 48,155 L 76,108 L 82,90 L 100,90 L 118,90 L 124,108 L 152,155 L 165,125 L 165,45 Z" stroke="url(#gold-${idPrefix})" stroke-width="5" />
        <path d="M 100,54 L 44,54 L 44,120 L 53,143 L 75,107 L 80,99 L 100,99 L 120,99 L 125,107 L 147,143 L 156,120 L 156,54 Z" stroke="url(#gold-${idPrefix})" stroke-width="2.75" />
        <path d="M 100,45 L 100,140" stroke="url(#gold-${idPrefix})" stroke-width="2.5" />
      </g>
      <circle cx="100" cy="150" r="6.5" fill="url(#gold-${idPrefix})" stroke="#422006" stroke-width="1" />
    </svg>
  `;
}
