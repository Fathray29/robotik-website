import { escapeHtml } from '../lib/logic';

export type HeroSubsystemKey = 'chassis' | 'mcu' | 'sensor' | 'power';

interface HeroSubsystemSpec {
  id: HeroSubsystemKey;
  tabLabel: string;
  title: string;
  detail: string;
  divisionHint: string;
  accent: 'gold' | 'cyan' | 'emerald';
}

const SUBSYSTEMS: Record<HeroSubsystemKey, HeroSubsystemSpec> = {
  chassis: {
    id: 'chassis',
    tabLabel: 'Sasis 4WD',
    title: 'Sasis Akrilik & Roda Mecanum 4WD',
    detail: 'Gerak maju, mundur, dan geser samping 360° tanpa putar badan. Desain CAD dan cetak dudukan sendiri di lab.',
    divisionHint: 'Divisi Mekanik',
    accent: 'gold',
  },
  mcu: {
    id: 'mcu',
    tabLabel: 'ESP32 & PID',
    title: 'Mikrokontroler ESP32 · Loop Kontrol PID',
    detail: 'Baca sensor hingga 500 kali per detik, lalu koreksi kecepatan tiap motor agar belokan tajam tetap stabil.',
    divisionHint: 'Divisi Pemrograman',
    accent: 'cyan',
  },
  sensor: {
    id: 'sensor',
    tabLabel: 'Sensor',
    title: 'Array Ultrasonik HC-SR04 & IR Optik',
    detail: 'Deteksi dinding labirin sampai jarak 250 cm dan baca garis lintasan arena tanpa kehilangan arah.',
    divisionHint: 'Divisi Elektronik',
    accent: 'emerald',
  },
  power: {
    id: 'power',
    tabLabel: 'Daya Li-Po',
    title: 'Baterai Li-Po 3S & Buck Converter 5V',
    detail: 'Pisahkan jalur daya motor dan mikrokontroler agar robot tidak pernah restart saat akselerasi mendadak.',
    divisionHint: 'Divisi Elektronik',
    accent: 'gold',
  },
};

const ORDER: HeroSubsystemKey[] = ['chassis', 'mcu', 'sensor', 'power'];

let activeSubsystem: HeroSubsystemKey = 'mcu';
let autoCycleTimer: number | null = null;
let userInteracted = false;

function stopAutoCycle(): void {
  if (autoCycleTimer !== null) {
    window.clearInterval(autoCycleTimer);
    autoCycleTimer = null;
  }
}

function applySubsystemSelection(root: HTMLElement, key: HeroSubsystemKey): void {
  activeSubsystem = key;
  const spec = SUBSYSTEMS[key];
  root.dataset.activePart = key;

  root.querySelectorAll<HTMLButtonElement>('[data-hero-tab]').forEach((btn) => {
    const isSelected = btn.dataset.heroTab === key;
    btn.classList.toggle('is-active', isSelected);
    btn.setAttribute('aria-selected', String(isSelected));
  });

  root.querySelectorAll<SVGGElement>('[data-hero-node]').forEach((node) => {
    const isSelected = node.dataset.heroNode === key;
    node.classList.toggle('is-selected', isSelected);
    node.setAttribute('aria-pressed', String(isSelected));
  });

  const titleEl = root.querySelector<HTMLElement>('#hero-bp-title');
  const detailEl = root.querySelector<HTMLElement>('#hero-bp-detail');
  const divEl = root.querySelector<HTMLElement>('#hero-bp-division');
  if (titleEl) titleEl.textContent = spec.title;
  if (detailEl) detailEl.textContent = spec.detail;
  if (divEl) divEl.textContent = spec.divisionHint;
}

export function initHeroBlueprintWorkbench(): void {
  const container = document.getElementById('hero-rover-workbench');
  if (!container) return;

  const spec = SUBSYSTEMS[activeSubsystem];

  container.innerHTML = `
    <div id="hero-bp-root" data-active-part="${activeSubsystem}" class="hero-bp-shell relative overflow-hidden rounded-xl border border-white/12 bg-[#0B1221] shadow-2xl">
      <!-- Top Schematic Viewport -->
      <div class="relative px-4 pt-4 pb-2 sm:px-5 sm:pt-5">
        <div class="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono text-slate-400 mb-2">
          <span class="text-cyan-300 whitespace-nowrap">SKEMATIK ROVER 4WD</span>
          <span class="whitespace-nowrap">Klik subsistem</span>
        </div>

        <div class="relative aspect-[16/10] w-full rounded-lg border border-white/8 bg-[#070D19] overflow-hidden">
          <svg
            viewBox="0 0 420 262"
            class="h-full w-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Diagram interaktif arsitektur robot 4WD Motechart"
          >
            <defs>
              <pattern id="hero-bp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" stroke="rgba(34, 211, 238, 0.07)" stroke-width="0.75" />
              </pattern>
              <radialGradient id="hero-bp-glow" cx="50%" cy="52%" r="48%">
                <stop offset="0%" stop-color="rgba(34, 211, 238, 0.14)" />
                <stop offset="100%" stop-color="rgba(7, 13, 25, 0)" />
              </radialGradient>
            </defs>

            <rect width="420" height="262" fill="#070D19" />
            <rect width="420" height="262" fill="url(#hero-bp-grid)" />
            <circle cx="210" cy="136" r="120" fill="url(#hero-bp-glow)" />

            <!-- Subtle Axis Guides -->
            <line x1="28" y1="136" x2="392" y2="136" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4" />
            <line x1="210" y1="18" x2="210" y2="246" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4" />

            <!-- Sweeping Ultrasonic Sonar Cone (Top / Front of Rover) -->
            <g class="hero-bp-sonar">
              <path d="M 210 58 L 154 16 A 78 78 0 0 1 266 16 Z" fill="rgba(52, 211, 153, 0.09)" />
              <path class="hero-sonar-ring" d="M 182 36 A 42 42 0 0 1 238 36" stroke="#34D399" stroke-width="1.4" stroke-linecap="round" />
              <path class="hero-sonar-ring hero-sonar-ring-2" d="M 166 24 A 64 64 0 0 1 254 24" stroke="#22D3EE" stroke-width="1.2" stroke-linecap="round" />
            </g>

            <!-- SUBSYSTEM 1: CHASSIS & 4WD MECANUM WHEELS -->
            <g
              data-hero-node="chassis"
              class="hero-bp-node hero-node-chassis"
              role="button"
              tabindex="0"
              aria-label="Inspeksi Sasis dan Roda Mecanum 4WD"
            >
              <!-- Outer Rover Chassis Plate -->
              <path
                d="M 146 66 L 274 66 L 288 80 L 288 212 L 274 226 L 146 226 L 132 212 L 132 80 Z"
                fill="#0C1526"
                stroke="#475569"
                stroke-width="2"
                class="node-stroke-target"
              />
              <rect x="142" y="76" width="136" height="140" rx="8" stroke="rgba(255,255,255,0.08)" stroke-dasharray="5 4" />

              <!-- 4 Mecanum Wheels -->
              <g class="node-wheel-group">
                <!-- Front Left -->
                <rect x="98" y="82" width="26" height="52" rx="6" fill="#0B1324" stroke="#64748B" stroke-width="2" class="node-stroke-target" />
                <path d="M 102 92 L 120 100 M 102 104 L 120 112 M 102 116 L 120 124" stroke="#FACC15" stroke-width="1.5" opacity="0.7" class="hero-wheel-roller" />
                <line x1="124" y1="108" x2="132" y2="108" stroke="#94A3B8" stroke-width="3" />

                <!-- Front Right -->
                <rect x="296" y="82" width="26" height="52" rx="6" fill="#0B1324" stroke="#64748B" stroke-width="2" class="node-stroke-target" />
                <path d="M 318 92 L 300 100 M 318 104 L 300 112 M 318 116 L 300 124" stroke="#FACC15" stroke-width="1.5" opacity="0.7" class="hero-wheel-roller" />
                <line x1="288" y1="108" x2="296" y2="108" stroke="#94A3B8" stroke-width="3" />

                <!-- Rear Left -->
                <rect x="98" y="158" width="26" height="52" rx="6" fill="#0B1324" stroke="#64748B" stroke-width="2" class="node-stroke-target" />
                <path d="M 120 168 L 102 176 M 120 180 L 102 188 M 120 192 L 102 200" stroke="#FACC15" stroke-width="1.5" opacity="0.7" class="hero-wheel-roller" />
                <line x1="124" y1="184" x2="132" y2="184" stroke="#94A3B8" stroke-width="3" />

                <!-- Rear Right -->
                <rect x="296" y="158" width="26" height="52" rx="6" fill="#0B1324" stroke="#64748B" stroke-width="2" class="node-stroke-target" />
                <path d="M 300 168 L 318 176 M 300 180 L 318 188 M 300 192 L 318 200" stroke="#FACC15" stroke-width="1.5" opacity="0.7" class="hero-wheel-roller" />
                <line x1="288" y1="184" x2="296" y2="184" stroke="#94A3B8" stroke-width="3" />
              </g>
            </g>

            <!-- PCB Signal & Power Traces connecting subsystems -->
            <g stroke="rgba(34, 211, 238, 0.25)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M 210 74 V 102" />
              <path d="M 168 128 H 146 V 108 H 132" />
              <path d="M 252 128 H 274 V 108 H 288" />
              <path d="M 168 148 H 146 V 184 H 132" />
              <path d="M 252 148 H 274 V 184 H 288" />
              <path d="M 210 170 V 186" />
            </g>
            <g stroke="#22D3EE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-trace-flow">
              <path d="M 210 74 V 102" />
              <path d="M 168 128 H 146 V 108 H 132" />
              <path d="M 252 128 H 274 V 108 H 288" />
            </g>
            <g stroke="#FACC15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-trace-flow-alt">
              <path d="M 210 186 V 170" />
              <path d="M 168 148 H 146 V 184 H 132" />
              <path d="M 252 148 H 274 V 184 H 288" />
            </g>

            <!-- SUBSYSTEM 2: FRONT ULTRASONIC SENSOR -->
            <g
              data-hero-node="sensor"
              class="hero-bp-node hero-node-sensor"
              role="button"
              tabindex="0"
              aria-label="Inspeksi Sensor Ultrasonik dan IR"
            >
              <rect x="172" y="52" width="76" height="22" rx="5" fill="#0B1324" stroke="#34D399" stroke-width="1.8" class="node-stroke-target" />
              <circle cx="192" cy="63" r="6" fill="#070D19" stroke="#34D399" stroke-width="1.6" />
              <circle cx="228" cy="63" r="6" fill="#070D19" stroke="#34D399" stroke-width="1.6" />
              <circle cx="192" cy="63" r="2" fill="#34D399" />
              <circle cx="228" cy="63" r="2" fill="#34D399" />
            </g>

            <!-- SUBSYSTEM 3: CENTRAL ESP32 MCU -->
            <g
              data-hero-node="mcu"
              class="hero-bp-node hero-node-mcu is-selected"
              role="button"
              tabindex="0"
              aria-label="Inspeksi Mikrokontroler ESP32 dan PID"
            >
              <rect x="168" y="102" width="84" height="68" rx="8" fill="#0B1324" stroke="#22D3EE" stroke-width="2" class="node-stroke-target" />
              <rect x="175" y="109" width="70" height="54" rx="4" fill="#070D19" stroke="rgba(250, 204, 21, 0.45)" stroke-width="1" />
              <text x="210" y="132" text-anchor="middle" fill="#F8FAFC" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">ESP32</text>
              <text x="210" y="147" text-anchor="middle" fill="#22D3EE" font-family="JetBrains Mono, monospace" font-size="7.5" letter-spacing="0.3">PID · 500Hz</text>
            </g>

            <!-- SUBSYSTEM 4: LI-PO 3S BATTERY PACK -->
            <g
              data-hero-node="power"
              class="hero-bp-node hero-node-power"
              role="button"
              tabindex="0"
              aria-label="Inspeksi Baterai Li-Po 3S dan Regulator Daya"
            >
              <rect x="155" y="186" width="110" height="28" rx="5" fill="#0B1324" stroke="#FACC15" stroke-width="1.8" class="node-stroke-target" />
              <text x="210" y="203" text-anchor="middle" fill="#FACC15" font-family="JetBrains Mono, monospace" font-size="8.2" font-weight="600">LI-PO 3S · 11.1V</text>
            </g>

            <!-- Precision Callout Labels (Clean spacing with clear margin gaps) -->
            <g font-family="JetBrains Mono, monospace" font-size="8" fill="#94A3B8">
              <text x="14" y="66" fill="#6EE7B7">HC-SR04</text>
              <line x1="60" y1="63" x2="164" y2="63" stroke="rgba(52,211,153,0.35)" stroke-dasharray="2 2" />
              <circle cx="164" cy="63" r="1.8" fill="#34D399" opacity="0.7" />

              <text x="14" y="111" fill="#FDE047">MECANUM 4WD</text>
              <line x1="78" y1="108" x2="92" y2="108" stroke="rgba(250,204,21,0.45)" />
              <circle cx="92" cy="108" r="1.8" fill="#FACC15" opacity="0.7" />

              <text x="406" y="140" text-anchor="end" fill="#67E8F9">MCU CORE</text>
              <line x1="258" y1="137" x2="354" y2="137" stroke="rgba(34,211,238,0.35)" stroke-dasharray="2 2" />
              <circle cx="258" cy="137" r="1.8" fill="#22D3EE" opacity="0.7" />

              <text x="406" y="203" text-anchor="end" fill="#FDE047">BUCK 5V</text>
              <line x1="271" y1="200" x2="358" y2="200" stroke="rgba(250,204,21,0.35)" stroke-dasharray="2 2" />
              <circle cx="271" cy="200" r="1.8" fill="#FACC15" opacity="0.7" />
            </g>
          </svg>
        </div>
      </div>

      <!-- Interactive Subsystem Selector Tabs + Live Engineering Readout -->
      <div class="px-4 pb-4 pt-2 sm:px-5 sm:pb-5 space-y-3">
        <div role="tablist" aria-label="Pilih subsistem robot" class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 rounded-lg border border-white/8 bg-[#070D19] p-1">
          ${ORDER.map((key) => {
            const item = SUBSYSTEMS[key];
            const active = key === activeSubsystem;
            return `
              <button
                type="button"
                role="tab"
                data-hero-tab="${key}"
                aria-selected="${active}"
                class="hero-bp-tab ${active ? 'is-active' : ''} rounded-md px-2.5 py-2 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
              >
                ${escapeHtml(item.tabLabel)}
              </button>
            `;
          }).join('')}
        </div>

        <div class="rounded-lg border border-white/8 bg-[#0D1526]/90 px-4 py-3 min-h-[78px] flex flex-col justify-center">
          <div class="flex items-center justify-between gap-2 mb-1">
            <h2 id="hero-bp-title" class="font-display text-sm font-semibold text-white leading-snug">
              ${escapeHtml(spec.title)}
            </h2>
            <span id="hero-bp-division" class="font-mono text-[11px] text-amber-300 whitespace-nowrap shrink-0">
              ${escapeHtml(spec.divisionHint)}
            </span>
          </div>
          <p id="hero-bp-detail" class="text-xs text-slate-300 leading-relaxed">
            ${escapeHtml(spec.detail)}
          </p>
        </div>
      </div>
    </div>
  `;

  const root = container.querySelector<HTMLElement>('#hero-bp-root');
  if (!root) return;

  const handleSelect = (key: HeroSubsystemKey) => {
    userInteracted = true;
    stopAutoCycle();
    applySubsystemSelection(root, key);
  };

  root.querySelectorAll<HTMLButtonElement>('[data-hero-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.heroTab as HeroSubsystemKey;
      if (key && SUBSYSTEMS[key]) handleSelect(key);
    });
  });

  root.querySelectorAll<SVGGElement>('[data-hero-node]').forEach((node) => {
    const activate = () => {
      const key = node.dataset.heroNode as HeroSubsystemKey;
      if (key && SUBSYSTEMS[key]) handleSelect(key);
    };
    node.addEventListener('click', activate);
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  // Gentle auto-highlight showcase until the user interacts (respects reduced motion)
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && !userInteracted) {
    stopAutoCycle();
    autoCycleTimer = window.setInterval(() => {
      if (userInteracted) {
        stopAutoCycle();
        return;
      }
      const nextIdx = (ORDER.indexOf(activeSubsystem) + 1) % ORDER.length;
      applySubsystemSelection(root, ORDER[nextIdx]);
    }, 4200);
  }
}
