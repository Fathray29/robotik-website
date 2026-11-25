import { DIVISIONS_CATALOG } from '../lib/content';
import { buildSpurGearPath, escapeHtml } from '../lib/logic';
import { appState } from '../lib/store';
import type { DivisionKey } from '../lib/types';

let activeDivision: DivisionKey = 'mechanics';
let listenersBound = false;

const DRIVE_GEAR_PATH = buildSpurGearPath({
  teeth: 12,
  rootRadius: 31.6,
  pitchRadius: 39,
  tipRadius: 43.6,
  phaseOffsetDeg: 0,
});

const PINION_GEAR_PATH = buildSpurGearPath({
  teeth: 8,
  rootRadius: 18.6,
  pitchRadius: 26,
  tipRadius: 30.6,
  phaseOffsetDeg: 22.5,
});

function buildOscilloscopePaths(): { pwmPath: string; filteredPath: string } {
  const period = 52;
  const periods = 8;
  const yHigh = 204;
  const yLow = 238;
  const yPeak = 212;
  const yValley = 221;

  const pwmSegments: string[] = [`M 0 ${yLow}`];
  const rcSegments: string[] = [`M 0 ${yPeak}`];

  for (let i = 0; i < periods; i += 1) {
    const x0 = i * period;
    // 65% duty cycle: 18px LOW, 34px HIGH (34 / 52 = 65.4%)
    pwmSegments.push(`H ${x0 + 18} V ${yHigh} H ${x0 + period} V ${yLow}`);
    // Smooth phase-locked RC low-pass discharge (LOW) and charge (HIGH) ripple around 65% DC mean
    rcSegments.push(`Q ${x0 + 7} 218, ${x0 + 18} ${yValley} Q ${x0 + 30} 213, ${x0 + period} ${yPeak}`);
  }

  return {
    pwmPath: pwmSegments.join(' '),
    filteredPath: rcSegments.join(' '),
  };
}

const OSC_PATHS = buildOscilloscopePaths();

function buildMechanicsBlueprintSvg(): string {
  return `
    <div class="division-blueprint-stage" data-graphic="mechanics" aria-label="Animasi skematik CAD roda gigi dan kinematika divisi Mekanik">
      <svg viewBox="0 0 320 280" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
        <defs>
          <pattern id="mech-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(250, 204, 21, 0.08)" stroke-width="0.75" />
          </pattern>
          <radialGradient id="mech-glow" cx="50%" cy="47%" r="50%">
            <stop offset="0%" stop-color="rgba(250, 204, 21, 0.15)" />
            <stop offset="100%" stop-color="rgba(250, 204, 21, 0)" />
          </radialGradient>
        </defs>

        <!-- Blueprint frame + subtle grid + radial focal glow -->
        <rect x="8" y="8" width="304" height="264" rx="10" fill="#070D19" stroke="rgba(250, 204, 21, 0.18)" stroke-width="1" />
        <rect x="8" y="8" width="304" height="264" rx="10" fill="url(#mech-grid)" />
        <circle cx="160" cy="132" r="96" fill="url(#mech-glow)" />

        <!-- Top HUD labels -->
        <text x="24" y="29" fill="#FACC15" font-family="JetBrains Mono, monospace" font-size="9.5" opacity="0.88">SCALE 1:1</text>
        <text x="296" y="29" text-anchor="end" fill="#22D3EE" font-family="JetBrains Mono, monospace" font-size="9.5" opacity="0.9">CAD-01 · Z12:Z8</text>

        <!-- Left precision caliper guide -->
        <g stroke="#FACC15" stroke-width="1" opacity="0.45">
          <line x1="28" y1="62" x2="28" y2="202" />
          <line x1="24" y1="62" x2="32" y2="62" />
          <line x1="24" y1="132" x2="31" y2="132" />
          <line x1="24" y1="202" x2="32" y2="202" />
        </g>

        <!-- Centered outer CAD calibration reticle (centered at 160, 132; clears top HUD & bottom dimension bar) -->
        <g transform="translate(160 132)">
          <g class="svg-spin-slow">
            <circle cx="0" cy="0" r="84" stroke="#FACC15" stroke-width="1" stroke-dasharray="16 8 3 8" opacity="0.3" />
            <circle cx="0" cy="0" r="78" stroke="#22D3EE" stroke-width="0.9" stroke-dasharray="4 12" opacity="0.3" />
          </g>
        </g>

        <!-- Engineering datum centerlines (horizontal axis y=132, shaft axes x=134 and x=199) -->
        <g stroke="rgba(148, 163, 184, 0.22)" stroke-width="1" stroke-dasharray="4 4">
          <line x1="62" y1="132" x2="260" y2="132" />
          <line x1="134" y1="68" x2="134" y2="216" />
          <line x1="199" y1="84" x2="199" y2="216" />
        </g>

        <!-- Exact Tangent Pitch Circles (r1=39 @ x=134, r2=26 @ x=199 -> touch at x=173, y=132) -->
        <circle cx="134" cy="132" r="39" stroke="rgba(250, 204, 21, 0.26)" stroke-width="1" stroke-dasharray="3 3" />
        <circle cx="199" cy="132" r="26" stroke="rgba(34, 211, 238, 0.28)" stroke-width="1" stroke-dasharray="3 3" />

        <!-- Drive Spur Gear: Z1=12, pitch r=39, CW 12s (1 tooth/sec) -->
        <g transform="translate(134 132)">
          <g class="svg-gear-cw">
            <path d="${DRIVE_GEAR_PATH}" fill="rgba(250, 204, 21, 0.12)" stroke="#FACC15" stroke-width="1.6" stroke-linejoin="round" />
            <circle cx="0" cy="0" r="25" fill="#070D19" stroke="rgba(250, 204, 21, 0.65)" stroke-width="1.4" />
            <!-- 3 precision spokes at 120° -->
            <g stroke="#FACC15" stroke-width="2.4" stroke-linecap="round">
              <line x1="0" y1="-25" x2="0" y2="-10" />
              <line x1="21.65" y1="12.5" x2="8.66" y2="5" />
              <line x1="-21.65" y1="12.5" x2="-8.66" y2="5" />
            </g>
            <!-- Subtle timing index mark on rim -->
            <circle cx="0" cy="-28.5" r="1.8" fill="#22D3EE" />
            <!-- Shaft hub + keyway -->
            <circle cx="0" cy="0" r="10" fill="#0B1324" stroke="#FACC15" stroke-width="2.2" />
            <rect x="-2" y="-10" width="4" height="3.5" fill="#FACC15" />
            <circle cx="0" cy="0" r="3.4" fill="#22D3EE" />
          </g>
        </g>

        <!-- Meshing Pinion Spur Gear: Z2=8, pitch r=26, CCW 8s (1 tooth/sec, exact 3:2 lock) -->
        <g transform="translate(199 132)">
          <g class="svg-gear-ccw">
            <path d="${PINION_GEAR_PATH}" fill="rgba(34, 211, 238, 0.12)" stroke="#22D3EE" stroke-width="1.6" stroke-linejoin="round" />
            <circle cx="0" cy="0" r="13.5" fill="#070D19" stroke="rgba(34, 211, 238, 0.65)" stroke-width="1.3" />
            <!-- 4 spokes -->
            <g stroke="#22D3EE" stroke-width="1.8" stroke-linecap="round">
              <line x1="0" y1="-13.5" x2="0" y2="-6.5" />
              <line x1="0" y1="6.5" x2="0" y2="13.5" />
              <line x1="-13.5" y1="0" x2="-6.5" y2="0" />
              <line x1="6.5" y1="0" x2="13.5" y2="0" />
            </g>
            <circle cx="0" cy="-16.2" r="1.5" fill="#FACC15" />
            <circle cx="0" cy="0" r="6.5" fill="#0B1324" stroke="#FACC15" stroke-width="2" />
            <circle cx="0" cy="0" r="2.2" fill="#FACC15" />
          </g>
        </g>

        <!-- Pitch Contact Point Reticle at exact mesh point (173, 132) -->
        <g transform="translate(173 132)">
          <circle cx="0" cy="0" r="6" stroke="#22D3EE" stroke-width="1" opacity="0.45" class="svg-pitch-pulse" />
          <circle cx="0" cy="0" r="2.2" fill="#F8FAFC" />
        </g>

        <!-- Clean Center-Distance Dimension Callout (d = 65.0 mm · 3:2) -->
        <g stroke="#FACC15" stroke-width="1.1" opacity="0.85">
          <line x1="134" y1="222" x2="134" y2="238" opacity="0.55" />
          <line x1="199" y1="222" x2="199" y2="238" opacity="0.55" />
          <line x1="136" y1="230" x2="197" y2="230" />
          <polyline points="141,227 135,230 141,233" fill="none" />
          <polyline points="192,227 198,230 192,233" fill="none" />
        </g>
        <text x="166.5" y="252" text-anchor="middle" fill="#FACC15" font-family="JetBrains Mono, monospace" font-size="9.5" opacity="0.92">d: 65.0 mm · RATIO 3:2</text>
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
          <radialGradient id="elec-glow" cx="50%" cy="38%" r="48%">
            <stop offset="0%" stop-color="rgba(34, 211, 238, 0.16)" />
            <stop offset="100%" stop-color="rgba(34, 211, 238, 0)" />
          </radialGradient>
        </defs>

        <rect x="8" y="8" width="304" height="264" rx="10" fill="#070D19" stroke="rgba(34, 211, 238, 0.22)" stroke-width="1" />
        <rect x="8" y="8" width="304" height="264" rx="10" fill="url(#elec-grid)" />
        <circle cx="160" cy="106" r="96" fill="url(#elec-glow)" />

        <!-- Top HUD labels -->
        <text x="24" y="29" fill="#22D3EE" font-family="JetBrains Mono, monospace" font-size="9.5" opacity="0.9">VCC 5.0V · 3.3V</text>
        <text x="296" y="29" text-anchor="end" fill="#FACC15" font-family="JetBrains Mono, monospace" font-size="9.5" opacity="0.9">PCB-02 · ACTIVE</text>

        <!-- Static Copper PCB Traces (every trace terminates cleanly on an actual IC pin & pad) -->
        <g stroke="rgba(34, 211, 238, 0.24)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <!-- Top power & clock buses to top IC pins (x=142, x=178) -->
          <path d="M 142 46 V 65" />
          <path d="M 178 46 V 65" />
          <!-- Left input traces to left IC pins (y=88, y=100, y=124) -->
          <path d="M 36 68 H 76 L 96 88 H 119" />
          <path d="M 36 100 H 119" />
          <path d="M 36 144 H 76 L 96 124 H 119" />
          <!-- Right output traces from right IC pins (y=88, y=100, y=124) -->
          <path d="M 201 88 H 224 L 244 68 H 284" />
          <path d="M 201 100 H 284" />
          <path d="M 201 124 H 224 L 244 144 H 284" />
          <!-- Bottom probe traces from MCU bottom pins (x=154, x=166) directly into Oscilloscope -->
          <path d="M 154 147 V 178" />
          <path d="M 166 147 V 178" />
        </g>

        <!-- Seamless Cyan Signal Pulses (period 100 === keyframe 100->0, flows IN left -> OUT right & down to CH1) -->
        <g stroke="#22D3EE" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-trace-flow">
          <path d="M 36 68 H 76 L 96 88 H 119" />
          <path d="M 36 100 H 119" />
          <path d="M 201 100 H 284" />
          <path d="M 201 124 H 224 L 244 144 H 284" />
          <path d="M 154 147 V 178" />
        </g>

        <!-- Seamless Gold Power/Filtered Pulses (period 100 === keyframe 100->0, consistent forward flow) -->
        <g stroke="#FACC15" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" class="svg-trace-flow-alt">
          <path d="M 142 46 V 65" />
          <path d="M 178 46 V 65" />
          <path d="M 36 144 H 76 L 96 124 H 119" />
          <path d="M 201 88 H 224 L 244 68 H 284" />
          <path d="M 166 147 V 178" />
        </g>

        <!-- Terminal Solder Pads -->
        <g fill="#070D19" stroke="#22D3EE" stroke-width="2">
          <circle cx="36" cy="68" r="4.5" />
          <circle cx="36" cy="100" r="4.5" />
          <circle cx="284" cy="100" r="4.5" />
          <circle cx="284" cy="144" r="4.5" />
        </g>
        <g fill="#070D19" stroke="#FACC15" stroke-width="2">
          <circle cx="36" cy="144" r="4.5" />
          <circle cx="284" cy="68" r="4.5" />
          <circle cx="142" cy="46" r="4" />
          <circle cx="178" cy="46" r="4" />
        </g>

        <!-- Central MCU QFP-16 Package (centered at 160, 106; body x=126..194, y=72..140) -->
        <g>
          <!-- Metallic IC Pins on all 4 sides -->
          <g stroke="#94A3B8" stroke-width="2.2" stroke-linecap="round" opacity="0.82">
            <!-- Top pins -->
            <line x1="142" y1="65" x2="142" y2="72" />
            <line x1="154" y1="65" x2="154" y2="72" />
            <line x1="166" y1="65" x2="166" y2="72" />
            <line x1="178" y1="65" x2="178" y2="72" />
            <!-- Bottom pins -->
            <line x1="142" y1="140" x2="142" y2="147" />
            <line x1="154" y1="140" x2="154" y2="147" />
            <line x1="166" y1="140" x2="166" y2="147" />
            <line x1="178" y1="140" x2="178" y2="147" />
            <!-- Left pins -->
            <line x1="119" y1="88" x2="126" y2="88" />
            <line x1="119" y1="100" x2="126" y2="100" />
            <line x1="119" y1="112" x2="126" y2="112" />
            <line x1="119" y1="124" x2="126" y2="124" />
            <!-- Right pins -->
            <line x1="194" y1="88" x2="201" y2="88" />
            <line x1="194" y1="100" x2="201" y2="100" />
            <line x1="194" y1="112" x2="201" y2="112" />
            <line x1="194" y1="124" x2="201" y2="124" />
          </g>

          <!-- Chip body & die silkscreen -->
          <rect x="126" y="72" width="68" height="68" rx="8" fill="#0B1324" stroke="#22D3EE" stroke-width="2" />
          <rect x="135" y="81" width="50" height="50" rx="4" fill="#09101E" stroke="rgba(250, 204, 21, 0.45)" stroke-width="1" />
          <!-- Pin 1 / Activity status LED -->
          <circle cx="142" cy="88" r="2.4" fill="#FACC15" class="svg-led-pulse" />
          <text x="160" y="104" text-anchor="middle" fill="#F8FAFC" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600">MCU</text>
          <text x="160" y="118" text-anchor="middle" fill="#22D3EE" font-family="JetBrains Mono, monospace" font-size="8.5">ESP32</text>
        </g>

        <!-- Live Oscilloscope Strip (Phase-locked PWM + RC-Filtered Voltage) -->
        <rect x="24" y="178" width="272" height="76" rx="6" fill="#050A14" stroke="rgba(34, 211, 238, 0.24)" stroke-width="1" />
        <!-- Oscilloscope Probe Connection Terminals (rendered cleanly over top bezel) -->
        <circle cx="154" cy="178" r="3.4" fill="#070D19" stroke="#22D3EE" stroke-width="1.8" />
        <circle cx="166" cy="178" r="3.4" fill="#070D19" stroke="#FACC15" stroke-width="1.8" />
        <!-- Graticule reference lines -->
        <g stroke="rgba(255,255,255,0.06)" stroke-width="0.9">
          <line x1="30" y1="221" x2="290" y2="221" stroke-dasharray="3 3" />
          <line x1="95" y1="198" x2="95" y2="246" />
          <line x1="160" y1="198" x2="160" y2="246" />
          <line x1="225" y1="198" x2="225" y2="246" />
        </g>
        <text x="34" y="192" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="8.5">CH1 PWM · CH2 RC</text>
        <text x="286" y="192" text-anchor="end" fill="#FACC15" font-family="JetBrains Mono, monospace" font-size="8.5">20kHz · 65%</text>

        <clipPath id="osc-clip">
          <rect x="30" y="197" width="260" height="50" />
        </clipPath>
        <g clip-path="url(#osc-clip)">
          <!-- Synchronized seamless scrolling (-104px = exactly 2 periods of 52px) -->
          <g class="svg-wave-scroll">
            <path d="${OSC_PATHS.pwmPath}" stroke="#22D3EE" stroke-width="1.9" stroke-linejoin="round" fill="none" />
            <path d="${OSC_PATHS.filteredPath}" stroke="#FACC15" stroke-width="1.6" stroke-linecap="round" opacity="0.88" fill="none" />
          </g>
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
