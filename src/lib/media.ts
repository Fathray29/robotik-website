import { sanitizeUrl } from './logic';

function toSvgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;
}

function buildBlueprintCover(title: string, subtitle: string, accent: string, motifSvg: string): string {
  return toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" fill="none">
      <defs>
        <pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        </pattern>
        <radialGradient id="rg" cx="55%" cy="44%" r="55%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#090D16" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="#090D16"/>
      <rect width="800" height="500" fill="url(#g)"/>
      <rect width="800" height="500" fill="url(#rg)"/>
      <rect x="28" y="28" width="744" height="444" rx="14" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
      <path d="M 28 56 V 28 H 56 M 772 56 V 28 H 744 M 28 444 V 472 H 56 M 772 444 V 472 H 744" stroke="${accent}" stroke-width="2" stroke-opacity="0.7"/>
      ${motifSvg}
      <text x="56" y="420" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="24" font-weight="700">${title}</text>
      <text x="56" y="446" fill="#94A3B8" font-family="ui-monospace, monospace" font-size="14">${subtitle}</text>
    </svg>
  `);
}

const SCHEMATIC_SOCCER = buildBlueprintCover(
  'Skematik Sasis 4WD Mecanum',
  'MEKANIK · RANGKA & KINEMATIKA',
  '#FACC15',
  `
    <g stroke="#FACC15" stroke-width="2" opacity="0.85">
      <rect x="290" y="120" width="220" height="220" rx="20" fill="#0D1526"/>
      <rect x="255" y="140" width="28" height="72" rx="6" fill="#111827"/>
      <rect x="517" y="140" width="28" height="72" rx="6" fill="#111827"/>
      <rect x="255" y="248" width="28" height="72" rx="6" fill="#111827"/>
      <rect x="517" y="248" width="28" height="72" rx="6" fill="#111827"/>
      <circle cx="400" cy="230" r="54" stroke="#22D3EE" stroke-dasharray="8 6"/>
      <circle cx="400" cy="230" r="24" fill="#090D16" stroke="#FACC15"/>
      <line x1="210" y1="230" x2="590" y2="230" stroke="rgba(255,255,255,0.14)" stroke-dasharray="4 4"/>
      <line x1="400" y1="88" x2="400" y2="372" stroke="rgba(255,255,255,0.14)" stroke-dasharray="4 4"/>
    </g>
  `
);

const SCHEMATIC_IOT = buildBlueprintCover(
  'Arsitektur Node ESP32 IoT',
  'ELEKTRONIK · TELEMETRI & SENSOR',
  '#22D3EE',
  `
    <g stroke="#22D3EE" stroke-width="2.2">
      <path d="M 180 170 H 290 L 320 200 H 350 M 180 230 H 350 M 180 290 H 290 L 320 260 H 350" stroke-opacity="0.5"/>
      <path d="M 450 200 H 480 L 510 170 H 620 M 450 230 H 620 M 450 260 H 480 L 510 290 H 620" stroke-opacity="0.5"/>
      <rect x="350" y="175" width="100" height="110" rx="12" fill="#0D1526" stroke="#22D3EE"/>
      <rect x="366" y="191" width="68" height="78" rx="6" fill="#090D16" stroke="#FACC15" stroke-opacity="0.7"/>
      <text x="400" y="236" text-anchor="middle" fill="#F8FAFC" font-family="ui-monospace, monospace" font-size="16" font-weight="700" stroke="none">ESP32</text>
      <circle cx="180" cy="170" r="7" fill="#090D16" stroke="#FACC15"/>
      <circle cx="180" cy="230" r="7" fill="#090D16" stroke="#22D3EE"/>
      <circle cx="180" cy="290" r="7" fill="#090D16" stroke="#FACC15"/>
      <circle cx="620" cy="170" r="7" fill="#090D16" stroke="#FACC15"/>
      <circle cx="620" cy="230" r="7" fill="#090D16" stroke="#22D3EE"/>
      <circle cx="620" cy="290" r="7" fill="#090D16" stroke="#FACC15"/>
    </g>
  `
);

const SCHEMATIC_MAZE = buildBlueprintCover(
  'Peta Navigasi Flood-Fill & PID',
  'PEMROGRAMAN · ALGORITMA OTONOM',
  '#34D399',
  `
    <g>
      <rect x="230" y="106" width="340" height="236" rx="10" fill="#0B1220" stroke="rgba(148,163,184,0.45)" stroke-width="2"/>
      <g stroke="rgba(148,163,184,0.55)" stroke-width="3" stroke-linecap="round">
        <line x1="315" y1="158" x2="315" y2="288"/>
        <line x1="315" y1="158" x2="485" y2="158"/>
        <line x1="400" y1="210" x2="400" y2="342"/>
        <line x1="485" y1="210" x2="485" y2="288"/>
      </g>
      <path d="M 272 316 V 132 H 528 V 248 H 442 V 210" stroke="#22D3EE" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="272" cy="316" r="8" fill="#34D399"/>
      <rect x="418" y="190" width="48" height="36" rx="6" fill="rgba(250,204,21,0.16)" stroke="#FACC15" stroke-width="1.5"/>
    </g>
  `
);

const SCHEMATIC_ARDUINO = buildBlueprintCover(
  'Modul Praktikum Mikrokontroler',
  'MATERI LAB · ARDUINO & C++',
  '#FACC15',
  `
    <g>
      <rect x="220" y="118" width="360" height="214" rx="14" fill="#0D1526" stroke="#22D3EE" stroke-width="2"/>
      <rect x="256" y="156" width="128" height="138" rx="8" fill="#090D16" stroke="rgba(250,204,21,0.5)" stroke-width="1.5"/>
      <text x="320" y="232" text-anchor="middle" fill="#FACC15" font-family="ui-monospace, monospace" font-size="16" font-weight="700">ATmega328P</text>
      <path d="M 416 174 H 544 M 416 206 H 516 M 416 238 H 544 M 416 270 H 492" stroke="#22D3EE" stroke-width="3" stroke-linecap="round" stroke-opacity="0.75"/>
    </g>
  `
);

export const MEDIA_ASSETS = {
  soccerBot: SCHEMATIC_SOCCER,
  smartAgri: SCHEMATIC_IOT,
  mazeSolver: SCHEMATIC_MAZE,
  arduinoWorkshop: SCHEMATIC_ARDUINO,
  heroLab: SCHEMATIC_SOCCER,
} as const;

export type MediaAssetKey = keyof typeof MEDIA_ASSETS;

export function resolveMediaAsset(url: string | undefined, fallbackKey: MediaAssetKey): string {
  const safe = sanitizeUrl(url || '');
  if (!safe) {
    return MEDIA_ASSETS[fallbackKey];
  }
  return safe;
}
