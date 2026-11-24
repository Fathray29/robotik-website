import { DIVISIONS_CATALOG } from '../lib/content';
import { escapeHtml } from '../lib/logic';
import { appState } from '../lib/store';
import type { DivisionKey } from '../lib/types';

let activeDivision: DivisionKey = 'mechanics';
let listenersBound = false;

function buildMechanicsBlueprintSvg(): string {
  return `
    <div class="division-blueprint-stage" data-graphic="mechanics" aria-label="Animasi skematik CAD roda gigi dan kinematika divisi Mekanik">
      <svg viewBox="0 0 320 280" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
        <defs>
          <pattern id="mech-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(250, 204, 21, 0.08)" stroke-width="0.75" />
          </pattern>
          <radialGradient id="mech-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(250, 204, 21, 0.16)" />
            <stop offset="100%" stop-color="rgba(250, 204, 21, 0)" />
          </radialGradient>
        </defs>

        <!-- Blueprint grid + subtle radial focal highlight -->
        <rect x="8" y="8" width="304" height="264" rx="10" fill="#070D19" stroke="rgba(250, 204, 21, 0.16)" stroke-width="1" />
        <rect x="8" y="8" width="304" height="264" rx="10" fill="url(#mech-grid)" />
        <circle cx="160" cy="140" r="102" fill="url(#mech-glow)" />

        <!-- Top HUD labels -->
        <text x="24" y="30" fill="#FACC15" font-family="JetBrains Mono, monospace" font-size="9.5" opacity="0.85">SCALE 1:1</text>
        <text x="296" y="30" text-anchor="end" fill="#22D3EE" font-family="JetBrains Mono, monospace" font-size="9.5" opacity="0.9">CAD-01: ACTIVE</text>

        <!-- Vertical caliper guide on left -->
        <g stroke="#FACC15" stroke-width="1" opacity="0.55">
          <line x1="30" y1="62" x2="30" y2="218" />
          <line x1="25" y1="62" x2="35" y2="62" />
          <line x1="25" y1="140" x2="33" y2="140" />
          <line x1="25" y1="218" x2="35" y2="218" />
        </g>

        <!-- Rotating outer calibration reticle -->
        <g class="svg-spin-slow" style="transform-origin: 164px 138px;">
          <circle cx="164" cy="138" r="96" stroke="#FACC15" stroke-width="1" stroke-dasharray="14 7 3 7" opacity="0.35" />
          <circle cx="164" cy="138" r="88" stroke="#22D3EE" stroke-width="0.9" stroke-dasharray="4 10" opacity="0.35" />
        </g>
        <circle cx="164" cy="138" r="82" stroke="#FACC15" stroke-width="1.2" opacity="0.5" />

        <!-- Center crosshair -->
        <line x1="76" y1="138" x2="252" y2="138" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="3 4" />
        <line x1="164" y1="50" x2="164" y2="226" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="3 4" />

        <!-- Main Large Drive Gear (CW rotation, center 136,144) -->
        <g class="svg-gear-cw" style="transform-origin: 136px 144px;">
          <!-- 12 Gear Teeth -->
          <g fill="#FACC15">
            <rect x="131" y="96" width="10" height="11" rx="1.5" />
            <rect x="131" y="96" width="10" height="11" rx="1.5" transform="rotate(30 136 144)" />
            <rect x="131" y="96" width="10" height="11" rx="1.5" transform="rotate(60 136 144)" />
            <rect x="131" y="96" width="10" height="11" rx="1.5" transform="rotate(90 136 144)" />
            <rect x="131" y="96" width="10" height="11" rx="1.5" transform="rotate(120 136 144)" />
            <rect x="131" y="96" width="10" height="11" rx="1.5" transform="rotate(150 136 144)" />
            <rect x="131" y="96" width="10" height="11" rx="1.5" transform="rotate(180 136 144)" />
            <rect x="131" y="96" width="10" height="11" rx="1.5" transform="rotate(210 136 144)" />
            <rect x="131" y="96" width="10" height="11" rx="1.5" transform="rotate(240 136 144)" />
            <rect x="131" y="96" width="10" height="11" rx="1.5" transform="rotate(270 136 144)" />
            <rect x="131" y="96" width="10" height="11" rx="1.5" transform="rotate(300 136 144)" />
            <rect x="131" y="96" width="10" height="11" rx="1.5" transform="rotate(330 136 144)" />
          </g>
          <circle cx="136" cy="144" r="38" fill="#0B1324" stroke="#FACC15" stroke-width="5" />
          <circle cx="136" cy="144" r="27" fill="none" stroke="#FACC15" stroke-width="1.5" opacity="0.65" />
          <!-- Spokes -->
          <line x1="136" y1="112" x2="136" y2="176" stroke="#FACC15" stroke-width="2.5" />
          <line x1="104" y1="144" x2="168" y2="144" stroke="#FACC15" stroke-width="2.5" />
          <line x1="114" y1="122" x2="158" y2="166" stroke="#FACC15" stroke-width="1.5" opacity="0.65" />
          <circle cx="136" cy="144" r="10" fill="#070D19" stroke="#FACC15" stroke-width="3" />
          <circle cx="136" cy="144" r="3.5" fill="#22D3EE" />
        </g>

        <!-- Secondary Meshing Pinion Gear (CCW rotation, center 202,138) -->
        <g class="svg-gear-ccw" style="transform-origin: 202px 138px;">
          <g fill="#22D3EE">
            <rect x="198" y="106" width="8" height="9" rx="1.5" />
            <rect x="198" y="106" width="8" height="9" rx="1.5" transform="rotate(45 202 138)" />
            <rect x="198" y="106" width="8" height="9" rx="1.5" transform="rotate(90 202 138)" />
            <rect x="198" y="106" width="8" height="9" rx="1.5" transform="rotate(135 202 138)" />
            <rect x="198" y="106" width="8" height="9" rx="1.5" transform="rotate(180 202 138)" />
            <rect x="198" y="106" width="8" height="9" rx="1.5" transform="rotate(225 202 138)" />
            <rect x="198" y="106" width="8" height="9" rx="1.5" transform="rotate(270 202 138)" />
            <rect x="198" y="106" width="8" height="9" rx="1.5" transform="rotate(315 202 138)" />
          </g>
          <circle cx="202" cy="138" r="24" fill="#0B1324" stroke="#22D3EE" stroke-width="4" />
          <line x1="202" y1="118" x2="202" y2="158" stroke="#22D3EE" stroke-width="2" />
          <line x1="182" y1="138" x2="222" y2="138" stroke="#22D3EE" stroke-width="2" />
          <circle cx="202" cy="138" r="7" fill="#070D19" stroke="#FACC15" stroke-width="2.5" />
        </g>

        <!-- Oscillating Kinematic Arm Overlay -->
        <g class="svg-arm-rock" style="transform-origin: 136px 144px;">
          <line x1="136" y1="144" x2="148" y2="82" stroke="#FACC15" stroke-width="2.2" stroke-linecap="round" />
          <line x1="148" y1="82" x2="196" y2="104" stroke="#FACC15" stroke-width="1.6" stroke-dasharray="4 3" />
          <circle cx="148" cy="82" r="5" fill="#FACC15" />
          <circle cx="196" cy="104" r="3.5" fill="#22D3EE" />
        </g>

        <!-- Angle callout -->
        <text x="176" y="88" fill="#FACC15" font-family="JetBrains Mono, monospace" font-size="9" opacity="0.85">45° · 3:2</text>

        <!-- Bottom precision measurement line -->
        <g stroke="#FACC15" stroke-width="1.2" opacity="0.8">
          <line x1="94" y1="248" x2="234" y2="248" />
          <polyline points="101,244 94,248 101,252" fill="none" />
          <polyline points="227,244 234,248 227,252" fill="none" />
        </g>
        <text x="164" y="241" text-anchor="middle" fill="#FACC15" font-family="JetBrains Mono, monospace" font-size="10">L: 90.00 mm</text>
      </svg>
    </div>
  `;
}

function buildElectronicsBlueprintSvg(): string {
  return `
    <div class="division-blueprint-stage" data-graphic="electronics" aria-label="Animasi jalur PCB dan gelombang sinyal osiloskop divisi Elektronik">
      <svg viewBox="0 0 320 280" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
        <defs>
          <pattern id="elec-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(34, 211, 238, 0.08)" stroke-width="0.75" />
          </pattern>
          <radialGradient id="elec-glow" cx="50%" cy="42%" r="48%">
            <stop offset="0%" stop-color="rgba(34, 211, 238, 0.18)" />
            <stop offset="100%" stop-color="rgba(34, 211, 238, 0)" />
          </radialGradient>
        </defs>

        <rect x="8" y="8" width="304" height="264" rx="10" fill="#070D19" stroke="rgba(34, 211, 238, 0.22)" stroke-width="1" />
        <rect x="8" y="8" width="304" height="264" rx="10" fill="url(#elec-grid)" />
        <circle cx="160" cy="118" r="98" fill="url(#elec-glow)" />

        <!-- Top HUD labels -->
        <text x="24" y="30" fill="#22D3EE" font-family="JetBrains Mono, monospace" font-size="9.5" opacity="0.9">VCC 5.0V · 3.3V</text>
        <text x="296" y="30" text-anchor="end" fill="#FACC15" font-family="JetBrains Mono, monospace" font-size="9.5" opacity="0.9">PCB-02: ACTIVE</text>

        <!-- Static copper PCB traces -->
        <g stroke="rgba(34, 211, 238, 0.28)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M 38 72 H 84 L 106 94 H 126" />
          <path d="M 38 118 H 126" />
          <path d="M 38 164 H 84 L 106 142 H 126" />
          <path d="M 194 94 H 214 L 236 72 H 282" />
          <path d="M 194 118 H 282" />
          <path d="M 194 142 H 214 L 236 164 H 282" />
          <path d="M 160 44 V 84" />
        </g>

        <!-- Animated current pulses along PCB traces -->
        <g stroke="#22D3EE" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="svg-trace-flow">
          <path d="M 38 72 H 84 L 106 94 H 126" />
          <path d="M 38 118 H 126" />
          <path d="M 194 118 H 282" />
          <path d="M 194 142 H 214 L 236 164 H 282" />
        </g>
        <g stroke="#FACC15" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-trace-flow-alt">
          <path d="M 38 164 H 84 L 106 142 H 126" />
          <path d="M 194 94 H 214 L 236 72 H 282" />
          <path d="M 160 44 V 84" />
        </g>

        <!-- Terminal Solder Pads -->
        <g fill="#070D19" stroke="#22D3EE" stroke-width="2">
          <circle cx="38" cy="72" r="5" />
          <circle cx="38" cy="118" r="5" />
          <circle cx="282" cy="118" r="5" />
          <circle cx="282" cy="164" r="5" />
        </g>
        <g fill="#070D19" stroke="#FACC15" stroke-width="2">
          <circle cx="38" cy="164" r="5" />
          <circle cx="282" cy="72" r="5" />
          <circle cx="160" cy="44" r="5" />
        </g>

        <!-- Central MCU IC Chip (ESP32 / ATmega328P) -->
        <g>
          <rect x="126" y="84" width="68" height="68" rx="8" fill="#0B1324" stroke="#22D3EE" stroke-width="2" />
          <rect x="135" y="93" width="50" height="50" rx="4" fill="#09101E" stroke="rgba(250, 204, 21, 0.45)" stroke-width="1" />
          <circle cx="142" cy="100" r="2.2" fill="#FACC15" />
          <text x="160" y="116" text-anchor="middle" fill="#F8FAFC" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600">MCU</text>
          <text x="160" y="130" text-anchor="middle" fill="#22D3EE" font-family="JetBrains Mono, monospace" font-size="8.5">ESP32</text>
          <!-- IC Pins top/bottom -->
          <g stroke="#94A3B8" stroke-width="2" opacity="0.7">
            <line x1="140" y1="78" x2="140" y2="84" />
            <line x1="153" y1="78" x2="153" y2="84" />
            <line x1="167" y1="78" x2="167" y2="84" />
            <line x1="180" y1="78" x2="180" y2="84" />
            <line x1="140" y1="152" x2="140" y2="158" />
            <line x1="153" y1="152" x2="153" y2="158" />
            <line x1="167" y1="152" x2="167" y2="158" />
            <line x1="180" y1="152" x2="180" y2="158" />
          </g>
        </g>

        <!-- Live Oscilloscope PWM Waveform Strip at Bottom -->
        <rect x="24" y="186" width="272" height="68" rx="6" fill="#050A14" stroke="rgba(34, 211, 238, 0.2)" stroke-width="1" />
        <line x1="24" y1="220" x2="296" y2="220" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3 3" />
        <text x="34" y="200" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="8.5">CH1 · PWM 20kHz</text>
        <text x="286" y="200" text-anchor="end" fill="#FACC15" font-family="JetBrains Mono, monospace" font-size="8.5">DUTY 65%</text>

        <clipPath id="osc-clip">
          <rect x="30" y="204" width="260" height="44" />
        </clipPath>
        <g clip-path="url(#osc-clip)">
          <!-- Animated scrolling PWM square + filtered wave -->
          <path
            class="svg-wave-scroll"
            d="M 0 236 H 20 V 210 H 52 V 236 H 72 V 210 H 104 V 236 H 124 V 210 H 156 V 236 H 176 V 210 H 208 V 236 H 228 V 210 H 260 V 236 H 280 V 210 H 312 V 236 H 332 V 210 H 364 V 236 H 384 V 210 H 416 V 236"
            stroke="#22D3EE"
            stroke-width="2"
            fill="none"
          />
          <path
            class="svg-wave-scroll-slow"
            d="M 0 226 Q 26 206, 52 226 T 104 226 T 156 226 T 208 226 T 260 226 T 312 226 T 364 226 T 416 226"
            stroke="#FACC15"
            stroke-width="1.4"
            opacity="0.7"
            fill="none"
          />
        </g>
      </svg>
    </div>
  `;
}

function buildProgrammingBlueprintSvg(): string {
  return `
    <div class="division-blueprint-stage" data-graphic="programming" aria-label="Animasi pemetaan labirin otonom dan kurva PID divisi Pemrograman">
      <svg viewBox="0 0 320 280" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
        <defs>
          <pattern id="prog-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(34, 211, 238, 0.07)" stroke-width="0.75" />
          </pattern>
          <radialGradient id="prog-glow" cx="50%" cy="44%" r="50%">
            <stop offset="0%" stop-color="rgba(250, 204, 21, 0.14)" />
            <stop offset="100%" stop-color="rgba(34, 211, 238, 0)" />
          </radialGradient>
        </defs>

        <rect x="8" y="8" width="304" height="264" rx="10" fill="#070D19" stroke="rgba(250, 204, 21, 0.2)" stroke-width="1" />
        <rect x="8" y="8" width="304" height="264" rx="10" fill="url(#prog-grid)" />
        <circle cx="160" cy="120" r="96" fill="url(#prog-glow)" />

        <!-- Top HUD -->
        <text x="24" y="30" fill="#22D3EE" font-family="JetBrains Mono, monospace" font-size="9.5" opacity="0.9">NAV-03 · FLOOD-FILL</text>
        <text x="296" y="30" text-anchor="end" fill="#FACC15" font-family="JetBrains Mono, monospace" font-size="9.5" opacity="0.9">PID 500 Hz</text>

        <!-- 4x4 Maze Arena Frame (centered x: 64..256, y: 46..174) -->
        <rect x="64" y="46" width="192" height="128" rx="4" fill="#050A14" stroke="rgba(148, 163, 184, 0.45)" stroke-width="2" />

        <!-- Subtle cell grid -->
        <g stroke="rgba(255,255,255,0.06)" stroke-width="1">
          <line x1="112" y1="46" x2="112" y2="174" />
          <line x1="160" y1="46" x2="160" y2="174" />
          <line x1="208" y1="46" x2="208" y2="174" />
          <line x1="64" y1="78" x2="256" y2="78" />
          <line x1="64" y1="110" x2="256" y2="110" />
          <line x1="64" y1="142" x2="256" y2="142" />
        </g>

        <!-- Maze internal walls -->
        <g stroke="#94A3B8" stroke-width="2.4" stroke-linecap="round">
          <line x1="112" y1="78" x2="112" y2="142" />
          <line x1="112" y1="78" x2="208" y2="78" />
          <line x1="160" y1="110" x2="160" y2="174" />
          <line x1="208" y1="110" x2="208" y2="142" />
          <line x1="160" y1="142" x2="208" y2="142" />
        </g>

        <!-- Goal marker cell -->
        <rect x="168" y="116" width="32" height="20" rx="3" fill="rgba(250, 204, 21, 0.14)" stroke="#FACC15" stroke-width="1" />
        <text x="184" y="129" text-anchor="middle" fill="#FACC15" font-family="JetBrains Mono, monospace" font-size="8" font-weight="600">GOAL</text>

        <!-- Start marker -->
        <circle cx="88" cy="158" r="4.5" fill="#22D3EE" opacity="0.6" />
        <text x="88" y="170" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="7.5">START</text>

        <!-- Solved Shortest Path (Static Dim + Animated Tracing Pulse) -->
        <path
          d="M 88 158 V 62 H 232 V 158 H 232 V 94 H 184 V 126"
          stroke="rgba(34, 211, 238, 0.24)"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          class="svg-maze-path"
          d="M 88 158 V 62 H 232 V 94 H 184 V 126"
          stroke="#22D3EE"
          stroke-width="2.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Sweeping Lidar / Ultrasonic Bot Indicator at waypoint -->
        <g class="svg-bot-glide">
          <path d="M 0 0 L -16 -14 A 22 22 0 0 1 16 -14 Z" fill="rgba(250, 204, 21, 0.22)" />
          <circle cx="0" cy="0" r="7" fill="#090D16" stroke="#FACC15" stroke-width="2.4" />
          <circle cx="0" cy="0" r="2.6" fill="#22D3EE" />
        </g>

        <!-- PID Stabilization Response Graph at Bottom -->
        <rect x="24" y="190" width="272" height="64" rx="6" fill="#050A14" stroke="rgba(250, 204, 21, 0.2)" stroke-width="1" />
        <line x1="34" y1="222" x2="286" y2="222" stroke="rgba(250, 204, 21, 0.35)" stroke-dasharray="4 3" />
        <text x="34" y="204" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="8.5">PID RESPONSE · SETPOINT</text>
        <text x="286" y="204" text-anchor="end" fill="#22D3EE" font-family="JetBrains Mono, monospace" font-size="8.5">ERR ±0.4°</text>

        <!-- Damped PID convergence curve -->
        <path
          d="M 34 246 C 68 198, 92 200, 118 230 C 142 242, 162 214, 188 223 C 214 227, 238 220, 286 222"
          stroke="rgba(34, 211, 238, 0.25)"
          stroke-width="2"
          fill="none"
        />
        <path
          class="svg-pid-curve"
          d="M 34 246 C 68 198, 92 200, 118 230 C 142 242, 162 214, 188 223 C 214 227, 238 220, 286 222"
          stroke="#22D3EE"
          stroke-width="2.4"
          stroke-linecap="round"
          fill="none"
        />
      </svg>
    </div>
  `;
}

function getDivisionGraphicSvg(divisionId: DivisionKey): string {
  if (divisionId === 'mechanics') return buildMechanicsBlueprintSvg();
  if (divisionId === 'electronics') return buildElectronicsBlueprintSvg();
  return buildProgrammingBlueprintSvg();
}

export function selectDivision(
  divisionId: DivisionKey,
  onExplorePortfolio?: (category: string) => void
): void {
  activeDivision = divisionId;
  renderDivisionWorkbench(onExplorePortfolio);
}

export function renderDivisionWorkbench(onExplorePortfolio?: (category: string) => void): void {
  const navContainer = document.getElementById('division-tabs');
  const detailContainer = document.getElementById('division-panel');
  if (!navContainer || !detailContainer) return;

  // Update active button state
  navContainer.querySelectorAll<HTMLButtonElement>('[data-div]').forEach((btn) => {
    const isActive = btn.dataset.div === activeDivision;
    btn.setAttribute('aria-selected', String(isActive));
    btn.classList.toggle('is-active', isActive);
  });

  const spec = DIVISIONS_CATALOG[activeDivision];
  const dynamicDesc =
    activeDivision === 'mechanics'
      ? appState.landingData.divMechDesc
      : activeDivision === 'electronics'
        ? appState.landingData.divElecDesc
        : appState.landingData.divProgDesc;

  detailContainer.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-center division-stage-enter">
      <div class="lg:col-span-6 flex flex-col justify-between gap-4">
        <div>
          <p class="font-mono text-xs font-semibold tracking-wider text-amber-300 uppercase mb-1.5">
            DIVISI ${escapeHtml(spec.index)} / ${escapeHtml(spec.subtitle)}
          </p>
          <h3 class="font-display text-3xl sm:text-[2.15rem] font-bold text-white tracking-tight mb-2.5">
            ${escapeHtml(spec.label)}
          </h3>
          <p class="text-slate-300 text-sm sm:text-[15px] leading-relaxed">
            ${escapeHtml(dynamicDesc)}
          </p>
        </div>

        <ul class="space-y-2.5">
          ${spec.focusPoints
            .map(
              (point) => `
              <li class="flex items-start gap-2.5 text-sm text-slate-100 leading-snug">
                <span class="mt-1.5 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(250,204,21,0.75)] shrink-0" aria-hidden="true"></span>
                <span>${escapeHtml(point)}</span>
              </li>
            `
            )
            .join('')}
        </ul>

        <div class="pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div class="text-xs text-slate-400 leading-relaxed">
            <span class="text-slate-200 font-medium">Alat praktik:</span>
            ${spec.tools.map((t) => escapeHtml(t)).join(' · ')}
          </div>
          <button
            type="button"
            data-explore-division="${escapeHtml(spec.portfolioCategory)}"
            class="inline-flex items-center gap-2 text-sm font-semibold text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Lihat karya divisi ini</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>

      <div class="lg:col-span-6 flex items-center justify-center">
        ${getDivisionGraphicSvg(activeDivision)}
      </div>
    </div>
  `;

  // Bind explore button inside updated panel
  const exploreBtn = detailContainer.querySelector<HTMLButtonElement>('[data-explore-division]');
  if (exploreBtn && onExplorePortfolio) {
    exploreBtn.addEventListener('click', () => {
      onExplorePortfolio(exploreBtn.dataset.exploreDivision || 'all');
    });
  }

  // Bind division selector tabs strictly once via event delegation
  if (!listenersBound) {
    listenersBound = true;
    navContainer.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-div]');
      if (!target) return;
      const divId = target.dataset.div as DivisionKey;
      if (divId && DIVISIONS_CATALOG[divId]) {
        selectDivision(divId, onExplorePortfolio);
      }
    });
  }
}
