import type {
  BlogArticle,
  CountdownParts,
  CustomQuestion,
  LandingData,
  PortfolioProject,
  RegistrationSettings,
  ValidationResult,
} from './types';

export function escapeHtml(text: unknown): string {
  if (typeof text !== 'string') return String(text ?? '');
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizePlainText(text: unknown): string {
  if (typeof text !== 'string') return String(text ?? '');
  return text
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

export function sanitizeUrl(url: unknown): string {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^data:image\/(jpeg|png|gif|webp|svg\+xml);base64,/i.test(trimmed)) return trimmed;
  if (/^\.?\//.test(trimmed) && !trimmed.startsWith('//')) return trimmed;
  return '';
}

export function sanitizeHeroHtml(html: unknown): string {
  if (typeof html !== 'string') return '';
  return html.replace(/<(?!\/?(span)\s*\/?>)[^>]*>/gi, (match) => escapeHtml(match));
}

export function isLegacyExternalUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  return /images\.unsplash\.com|picsum\.photos|via\.placeholder\.com/i.test(url);
}

export function normalizePhoneNumber(rawPhone: string): string {
  return rawPhone.replace(/[\s\-().]/g, '').trim();
}

export function validateRegistrationField(
  field: 'nama_lengkap' | 'email' | 'no_hp' | 'motivasi' | 'divisi',
  rawValue: string
): ValidationResult {
  const value = (rawValue || '').trim();

  if (field === 'nama_lengkap') {
    if (!value) {
      return { valid: false, message: 'Nama lengkap wajib diisi.' };
    }
    if (!/^[a-zA-ZÀ-ÿ\s'.,-]{2,60}$/.test(value)) {
      return {
        valid: false,
        message: 'Nama lengkap minimal 2 karakter dan hanya menggunakan huruf, spasi, titik, koma, tanda kutip, atau tanda hubung.',
      };
    }
    return { valid: true, message: '' };
  }

  if (field === 'email') {
    if (!value) {
      return { valid: false, message: 'Alamat email wajib diisi.' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return { valid: false, message: 'Format email tidak valid (contoh: nama@sekolah.sch.id).' };
    }
    return { valid: true, message: '' };
  }

  if (field === 'no_hp') {
    const normalized = normalizePhoneNumber(value);
    if (!normalized) {
      return { valid: false, message: 'Nomor WhatsApp wajib diisi.' };
    }
    if (!/^(08|\+628|628)[0-9]{7,12}$/.test(normalized)) {
      return {
        valid: false,
        message: 'Gunakan nomor Indonesia aktif (dimulai 08 atau +628, total 10–14 digit).',
      };
    }
    return { valid: true, message: '' };
  }

  if (field === 'divisi') {
    if (!value) {
      return { valid: false, message: 'Pilih salah satu divisi minat utama Anda.' };
    }
    return { valid: true, message: '' };
  }

  if (field === 'motivasi') {
    if (!value || value.length < 20) {
      return {
        valid: false,
        message: `Tuliskan motivasi minimal 20 karakter (saat ini ${value.length}/20).`,
      };
    }
    return { valid: true, message: '' };
  }

  return { valid: true, message: '' };
}

export function validateCustomQuestionAnswer(
  question: CustomQuestion,
  rawValue: string
): ValidationResult {
  const value = (rawValue || '').trim();
  if (question.required && !value) {
    return {
      valid: false,
      message: question.type === 'text' ? 'Pertanyaan ini wajib diisi.' : 'Pilih salah satu opsi yang tersedia.',
    };
  }
  return { valid: true, message: '' };
}

export function normalizeRegistrationId(raw: string): string {
  const cleaned = (raw || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('ROBO-')) return cleaned;
  if (/^[A-Z0-9]{6,10}$/.test(cleaned)) {
    return `ROBO-${cleaned}`;
  }
  return cleaned;
}

export function generateRegistrationId(seedUint32?: number): string {
  let num: number;
  if (typeof seedUint32 === 'number' && Number.isFinite(seedUint32)) {
    num = seedUint32 >>> 0;
  } else {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    num = buf[0];
  }
  const suffix = num.toString(36).toUpperCase().slice(0, 8).padStart(8, '0');
  return `ROBO-${suffix}`;
}

export function computeCountdown(targetIso: string | undefined, nowMs: number = Date.now()): CountdownParts {
  if (!targetIso) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const targetMs = new Date(targetIso).getTime();
  if (Number.isNaN(targetMs)) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const diff = targetMs - nowMs;
  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { expired: false, days, hours, minutes, seconds };
}

export function filterArticles(
  articles: BlogArticle[],
  category: string,
  searchQuery: string
): BlogArticle[] {
  const q = (searchQuery || '').trim().toLowerCase();
  const cat = (category || 'all').toLowerCase();
  return articles.filter((article) => {
    const matchesCategory = cat === 'all' || (article.category || '').toLowerCase() === cat;
    if (!matchesCategory) return false;
    if (!q) return true;
    const haystack = [article.title, article.excerpt, article.author, article.category]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function filterProjects(projects: PortfolioProject[], category: string): PortfolioProject[] {
  const cat = (category || 'all').toLowerCase();
  if (cat === 'all') return projects;
  return projects.filter((proj) => {
    const projCat = (proj.category || '').toLowerCase();
    return projCat === cat || projCat.includes(cat);
  });
}

export function extractProjectShortDesc(proj: PortfolioProject): string {
  if (proj.description && proj.description.trim()) {
    return proj.description.trim();
  }
  if (!proj.content) return proj.specs || '';
  const cleaned = proj.content
    .replace(/#+\s+.+/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/[*_`#-]/g, '')
    .trim();
  const firstParagraph = cleaned
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  if (!firstParagraph) return proj.specs || '';
  return firstParagraph.length > 140 ? `${firstParagraph.slice(0, 137)}...` : firstParagraph;
}

export function extractProjectImages(proj: PortfolioProject): string[] {
  const images: string[] = [];
  const pushIfSafe = (url: string) => {
    const safe = sanitizeUrl(url);
    if (safe && !images.includes(safe)) {
      images.push(safe);
    }
  };
  if (proj.headerImage) {
    pushIfSafe(proj.headerImage);
  }
  const imgRegex = /!\[.*?\]\((.*?)\)/g;
  let match: RegExpExecArray | null;
  const content = proj.content || '';
  while ((match = imgRegex.exec(content)) !== null) {
    if (match[1]) pushIfSafe(match[1]);
  }
  return images;
}

export interface PrimarySkillTag {
  label: string;
  tone: 'iot' | 'mechanics' | 'cpp' | 'electronics' | 'default';
}

export function extractPrimarySkillTag(proj: PortfolioProject): PrimarySkillTag {
  const category = (proj.category || '').toLowerCase();
  const divisionKey = (proj.divisionKey || '').toLowerCase();
  const titleText = (proj.title || '').toLowerCase();
  const haystack = [proj.title, proj.components, proj.specs, proj.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const isCombinedCategory = category.includes('&') || category.includes(',');

  // 1. Explicit IoT / wireless telemetry signals
  if (
    category.includes('iot') ||
    /\b(iot|mqtt|telemetry|telemetri|blynk|thingspeak|smart\s+agri|smart\s+home)\b/.test(haystack)
  ) {
    return { label: 'IoT', tone: 'iot' };
  }

  // 2. Explicit programming / autonomous navigation signals (unless explicitly pure electronics/analog)
  const isExplicitElectronics =
    (!isCombinedCategory && (category.includes('elektronik') || category.includes('electronics'))) ||
    divisionKey === 'electronics' ||
    /\b(analog|komparator|lm358)\b/.test(titleText);

  if (
    category.includes('pemrograman') ||
    category.includes('programming') ||
    divisionKey === 'programming' ||
    (!isExplicitElectronics &&
      (/\b(labirin|labyrinth|maze|flood-fill|pid|line\s+follower|algoritma|c\+\+|autonomous|otonom)\b/.test(titleText) ||
        (isCombinedCategory && /\b(labirin|labyrinth|maze|flood-fill|pid|algoritma|otonom)\b/.test(haystack))))
  ) {
    if (/\bpython\b/.test(haystack) && !/\b(c\+\+|arduino|pid|flood-fill|avr|atmega)\b/.test(haystack)) {
      return { label: 'Python', tone: 'cpp' };
    }
    return { label: 'C++', tone: 'cpp' };
  }

  // 3. Sensor & electronic circuit focus on combined/electronics categories
  if (
    (!isCombinedCategory && (category.includes('elektronik') || category.includes('electronics'))) ||
    divisionKey === 'electronics' ||
    (isCombinedCategory &&
      /\b(obstacle|ultrasonik|ultrasonic|sensor|komparator|lm358|pcb|sirkuit|rangkaian)\b/.test(haystack) &&
      !/\b(sumo|soccer|mecanum|chassis|sasis|cad|3d\s*print)\b/.test(titleText))
  ) {
    return { label: 'Electronics', tone: 'electronics' };
  }

  // 4. Mechanics / CAD / Chassis / Structural Robotics
  if (
    category.includes('mekanik') ||
    category.includes('mechanics') ||
    divisionKey === 'mechanics' ||
    /\b(mecanum|sasis|chassis|cad|3d\s*print|akrilik|kinematik|soccer|sumo)\b/.test(haystack)
  ) {
    return { label: 'Mechanics', tone: 'mechanics' };
  }

  // 5. General fallback keyword inference
  if (/\b(c\+\+|pid|flood-fill|algoritma|line\s+follower|maze|arduino)\b/.test(haystack) || (proj.code && proj.code.includes('void setup'))) {
    return { label: 'C++', tone: 'cpp' };
  }
  if (/\b(pcb|solder|komparator|lm358|driver\s+motor|sensor|daya|regulator)\b/.test(haystack)) {
    return { label: 'Electronics', tone: 'electronics' };
  }

  const fallback = (proj.category || '').trim();
  if (fallback) {
    const label = fallback.length > 16 ? `${fallback.slice(0, 15)}…` : fallback.charAt(0).toUpperCase() + fallback.slice(1);
    return { label, tone: 'default' };
  }
  return { label: 'Robotics', tone: 'default' };
}

export function sanitizeRichHtmlSafe(html: string): string {
  if (!html) return '';
  // Remove dangerous tags with their bodies completely
  let cleaned = html
    .replace(/<(script|style|iframe|object|embed|svg|math|form|input|button|textarea|select|meta|link|base)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|style|iframe|object|embed|svg|math|form|input|button|textarea|select|meta|link|base)[^>]*\/?>/gi, '');

  const allowedTags = new Set([
    'p', 'br', 'b', 'i', 'u', 'strong', 'em', 's', 'strike',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'a', 'img', 'span', 'div', 'hr', 'sub', 'sup',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ]);

  cleaned = cleaned.replace(/<\/?([a-zA-Z0-9-]+)([^>]*)>/g, (full, rawTag, rawAttrs) => {
    const tag = String(rawTag).toLowerCase();
    if (!allowedTags.has(tag)) return '';
    if (full.startsWith('</')) return `</${tag}>`;

    const safeAttrs: string[] = [];
    if (tag === 'a') {
      const hrefMatch = String(rawAttrs).match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const rawHref = hrefMatch ? (hrefMatch[1] || hrefMatch[2] || hrefMatch[3] || '') : '';
      const safeHref = sanitizeUrl(rawHref);
      if (safeHref) {
        safeAttrs.push(`href="${escapeHtml(safeHref)}"`);
        safeAttrs.push('target="_blank"');
        safeAttrs.push('rel="noopener noreferrer"');
      }
    } else if (tag === 'img') {
      const srcMatch = String(rawAttrs).match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const rawSrc = srcMatch ? (srcMatch[1] || srcMatch[2] || srcMatch[3] || '') : '';
      const safeSrc = sanitizeUrl(rawSrc);
      if (!safeSrc) return '';
      const altMatch = String(rawAttrs).match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const altText = altMatch ? (altMatch[1] || altMatch[2] || '') : '';
      safeAttrs.push(`src="${escapeHtml(safeSrc)}"`);
      safeAttrs.push(`alt="${escapeHtml(altText)}"`);
      safeAttrs.push('class="md-inline-img"');
      safeAttrs.push('loading="lazy"');
      safeAttrs.push('referrerpolicy="no-referrer"');
    }

    const attrStr = safeAttrs.length > 0 ? ` ${safeAttrs.join(' ')}` : '';
    return tag === 'br' || tag === 'hr' || tag === 'img' ? `<${tag}${attrStr}>` : `<${tag}${attrStr}>`;
  });

  return cleaned;
}

export function parseMarkdownToSafeHtml(markdown: string): string {
  if (!markdown) return '';

  // Support HTML content authored via Admin CMS rich text editor while keeping strict XSS sanitization
  const trimmedInput = markdown.trim();
  if (/^<(p|div|h[1-6]|ul|ol|blockquote|pre|strong|em|b|i|br|span)\b/i.test(trimmedInput) && !trimmedInput.includes('```')) {
    return sanitizeRichHtmlSafe(markdown);
  }

  let escaped = escapeHtml(markdown);

  const codeBlocks: string[] = [];
  escaped = escaped.replace(/```([a-zA-Z0-9+#-]*)\r?\n?([\s\S]*?)```/g, (_match, lang, code) => {
    const safeLang = (lang || 'text').toLowerCase().replace(/[^a-z0-9+#-]/g, '');
    const id = `__CODE_BLOCK_${codeBlocks.length}__`;
    const displayLang = safeLang === 'cpp' ? 'C++ / Arduino' : safeLang.toUpperCase();
    codeBlocks.push(
      `<div class="md-code-block"><div class="md-code-header"><span class="md-code-lang">${escapeHtml(displayLang)}</span><button type="button" class="md-copy-btn" data-copy-code>Salin Kode</button></div><pre><code class="language-${safeLang}">${code.trim()}</code></pre></div>`
    );
    return `\n\n${id}\n\n`;
  });

  escaped = escaped.replace(/^\s*&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>');
  escaped = escaped.replace(/^\s*####\s+(.+)$/gm, '<h4>$1</h4>');
  escaped = escaped.replace(/^\s*###\s+(.+)$/gm, '<h3>$1</h3>');
  escaped = escaped.replace(/^\s*##\s+(.+)$/gm, '<h2>$1</h2>');
  escaped = escaped.replace(/^\s*#\s+(.+)$/gm, '<h2>$1</h2>');

  escaped = escaped.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
  escaped = escaped.replace(/(?:^\s*<li>.*?<\/li>\s*)+/gm, (block) => `<ul>\n${block}</ul>\n`);

  escaped = escaped.replace(/^\s*\d+\.\s+(.+)$/gm, '<oli>$1</oli>');
  escaped = escaped.replace(/(?:^\s*<oli>.*?<\/oli>\s*)+/gm, (block) => {
    return `<ol>\n${block.replace(/<oli>/g, '<li>').replace(/<\/oli>/g, '</li>')}</ol>\n`;
  });

  const blocks = escaped.split(/\n\s*\n+/);
  const processed = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (/^(<h[1-6]|<ul|<ol|<blockquote|__CODE_BLOCK_)/.test(trimmed)) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
  });
  escaped = processed.filter(Boolean).join('\n');

  // Inline images first (before links) with URL validation
  escaped = escaped.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, rawUrl) => {
    const safe = sanitizeUrl(rawUrl);
    if (!safe) return '';
    return `<img src="${escapeHtml(safe)}" alt="${escapeHtml(alt)}" class="md-inline-img" loading="lazy" referrerpolicy="no-referrer">`;
  });

  // Inline links with strict protocol sanitization
  escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, rawUrl) => {
    const safe = sanitizeUrl(rawUrl);
    if (!safe) return label;
    return `<a href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  escaped = escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');

  codeBlocks.forEach((block, idx) => {
    escaped = escaped.replace(`__CODE_BLOCK_${idx}__`, block);
  });

  return escaped;
}

export function sanitizeCsvCell(value: unknown): string {
  const raw = String(value ?? '').replace(/\r?\n/g, ' ');
  // Prevent CSV spreadsheet formula injection (=, +, -, @, tab, CR)
  const neutralized = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${neutralized.replace(/"/g, '""')}"`;
}

export function mapFirebaseAuthError(codeOrMessage: string): string {
  const text = (codeOrMessage || '').toLowerCase();
  if (text.includes('invalid-credential') || text.includes('wrong-password') || text.includes('user-not-found')) {
    return 'Email atau password tidak sesuai. Periksa kembali kredensial pengurus.';
  }
  if (text.includes('invalid-email')) {
    return 'Format alamat email tidak valid.';
  }
  if (text.includes('too-many-requests')) {
    return 'Terlalu banyak percobaan login ke server. Tunggu beberapa menit lalu coba lagi.';
  }
  if (text.includes('network-request-failed')) {
    return 'Gagal terhubung ke server autentikasi. Periksa koneksi internet Anda.';
  }
  if (text.includes('user-disabled')) {
    return 'Akun pengurus ini sedang dinonaktifkan.';
  }
  return 'Gagal masuk ke Portal Pengurus. Periksa email, password, dan koneksi internet.';
}

export function parseScheduleTimestamp(raw: string | undefined | null): number | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Handle explicit timezone offsets or Z directly
  if (/(Z|[+-]\d{2}:?\d{2})$/i.test(trimmed)) {
    const ms = Date.parse(trimmed);
    return Number.isNaN(ms) ? null : ms;
  }

  // Parse local YYYY-MM-DDTHH:mm(:ss)? strictly in local browser time
  const localMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (localMatch) {
    const [, y, m, d, hh, mm, ss = '0'] = localMatch;
    const dt = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss), 0);
    return Number.isNaN(dt.getTime()) ? null : dt.getTime();
  }

  const fallback = Date.parse(trimmed);
  return Number.isNaN(fallback) ? null : fallback;
}

export function formatLocalOffsetIso(
  dateInput: Date | string,
  hourStr?: string,
  minuteStr?: string,
  customOffsetMinutes?: number
): string {
  let dt: Date;
  if (dateInput instanceof Date) {
    dt = dateInput;
  } else {
    const dateMatch = String(dateInput || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateMatch) return '';
    const [, y, m, d] = dateMatch;
    const hh = Math.min(23, Math.max(0, Number(hourStr ?? 0) || 0));
    const mm = Math.min(59, Math.max(0, Number(minuteStr ?? 0) || 0));
    dt = new Date(Number(y), Number(m) - 1, Number(d), hh, mm, 0, 0);
  }
  if (Number.isNaN(dt.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  const offsetMin = typeof customOffsetMinutes === 'number' ? customOffsetMinutes : -dt.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const absOff = Math.abs(offsetMin);
  const offH = pad(Math.floor(absOff / 60));
  const offM = pad(absOff % 60);

  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:00${sign}${offH}:${offM}`;
}

export function toLocalDateTimeParts(raw: string | undefined | null): { date: string; hour: string; minute: string } {
  const ms = parseScheduleTimestamp(raw);
  if (ms === null) return { date: '', hour: '08', minute: '00' };
  const dt = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`,
    hour: pad(dt.getHours()),
    minute: pad(dt.getMinutes()),
  };
}

export function formatIndonesianSchedule(rawOrMs: string | number | null | undefined): string {
  const ms = typeof rawOrMs === 'number' ? rawOrMs : parseScheduleTimestamp(rawOrMs);
  if (ms === null) return '';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toLocaleString();
  }
}

export function computeCountdownFromMs(targetMs: number | null, nowMs: number = Date.now()): CountdownParts {
  if (targetMs === null || Number.isNaN(targetMs)) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const diff = targetMs - nowMs;
  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { expired: false, days, hours, minutes, seconds };
}

export function resolveRegistrationState(
  settings: Partial<RegistrationSettings> | null | undefined,
  nowMs: number = Date.now()
): import('./types').ResolvedRegistrationState {
  const mode: import('./types').RegistrationMode =
    settings?.mode === 'auto' || settings?.mode === 'manual_open' || settings?.mode === 'manual_closed'
      ? settings.mode
      : settings?.status === 'closed_permanently'
        ? 'manual_closed'
        : settings?.status === 'closed'
          ? settings?.countdownTarget
            ? 'auto'
            : 'manual_closed'
          : 'manual_open';

  const openAtMs = parseScheduleTimestamp(
    settings?.openAt !== undefined
      ? settings.openAt
      : settings?.status === 'closed'
        ? settings?.countdownTarget
        : ''
  );
  const closeAtMs = parseScheduleTimestamp(
    settings?.closeAt !== undefined
      ? settings.closeAt
      : settings?.status === 'open' || (!settings?.status && settings?.isOpen !== false)
        ? settings?.countdownTarget
        : ''
  );
  const showCountdown =
    settings?.showCountdown !== undefined
      ? settings.showCountdown !== false
      : settings?.showHeaderCountdown !== false;

  let phase: import('./types').RegistrationPhase = 'closed';
  let countdownTargetMs: number | null = null;

  if (mode === 'manual_closed') {
    phase = 'closed';
    countdownTargetMs = null;
  } else if (mode === 'manual_open') {
    if (closeAtMs !== null && nowMs >= closeAtMs) {
      // Deadline passed -> automatically close registration
      phase = 'closed';
      countdownTargetMs = null;
    } else {
      phase = 'open';
      countdownTargetMs = closeAtMs;
    }
  } else {
    // mode === 'auto'
    if (openAtMs !== null && closeAtMs !== null && closeAtMs <= openAtMs) {
      // Malformed inverted window safety fallback: closed
      phase = 'closed';
      countdownTargetMs = null;
    } else if (openAtMs !== null && nowMs < openAtMs) {
      phase = 'upcoming';
      countdownTargetMs = openAtMs;
    } else if (closeAtMs !== null && nowMs >= closeAtMs) {
      phase = 'closed';
      countdownTargetMs = null;
    } else if (openAtMs !== null || closeAtMs !== null) {
      phase = 'open';
      countdownTargetMs = closeAtMs;
    } else {
      // No timestamps set in auto mode -> safe closed default
      phase = 'closed';
      countdownTargetMs = null;
    }
  }

  const countdown = countdownTargetMs !== null ? computeCountdownFromMs(countdownTargetMs, nowMs) : null;

  return {
    phase,
    mode,
    canSubmit: phase === 'open',
    canCheckStatus: phase === 'closed',
    openAtMs,
    closeAtMs,
    countdownTargetMs,
    countdown: countdown && !countdown.expired ? countdown : null,
    showCountdown,
  };
}

export function validateRegistrationSchedule(
  mode: import('./types').RegistrationMode,
  openAt: string,
  closeAt: string,
  nowMs: number = Date.now()
): ValidationResult {
  const openMs = parseScheduleTimestamp(openAt);
  const closeMs = parseScheduleTimestamp(closeAt);

  if (mode === 'manual_closed') {
    return { valid: true, message: '' };
  }

  if (mode === 'manual_open') {
    if (closeAt.trim() && closeMs === null) {
      return { valid: false, message: 'Format waktu penutupan tidak valid.' };
    }
    if (closeMs !== null && closeMs <= nowMs) {
      return {
        valid: false,
        message: 'Waktu penutupan harus lebih besar dari waktu sekarang agar pendaftaran tetap terbuka.',
      };
    }
    return { valid: true, message: '' };
  }

  // mode === 'auto'
  if (openAt.trim() && openMs === null) {
    return { valid: false, message: 'Format waktu pembukaan tidak valid.' };
  }
  if (closeAt.trim() && closeMs === null) {
    return { valid: false, message: 'Format waktu penutupan tidak valid.' };
  }
  if (openMs === null && closeMs === null) {
    return {
      valid: false,
      message: 'Pada mode Jadwal Otomatis, isi minimal Waktu Mulai atau Waktu Selesai pendaftaran.',
    };
  }
  if (openMs !== null && closeMs !== null && closeMs <= openMs) {
    return {
      valid: false,
      message: 'Waktu Selesai (Tutup) harus lebih akhir daripada Waktu Mulai (Buka).',
    };
  }

  return { valid: true, message: '' };
}

export function isStatusCheckEnabled(
  statusOrSettings: RegistrationSettings | RegistrationSettings['status'] | string | undefined,
  nowMs: number = Date.now()
): boolean {
  if (statusOrSettings && typeof statusOrSettings === 'object') {
    return resolveRegistrationState(statusOrSettings, nowMs).canCheckStatus;
  }
  // Legacy string support: enabled once closed/closed_permanently, disabled when open or upcoming
  return statusOrSettings !== 'open' && statusOrSettings !== 'upcoming';
}

export function normalizeRegSettings(
  settings: Partial<RegistrationSettings> | null | undefined,
  defaults: RegistrationSettings
): RegistrationSettings {
  if (!settings) {
    return { ...defaults, customQuestions: [...defaults.customQuestions] };
  }

  const hasExplicitMode =
    settings.mode === 'auto' || settings.mode === 'manual_open' || settings.mode === 'manual_closed';

  let mode: import('./types').RegistrationMode;
  let openAt = typeof settings.openAt === 'string' ? settings.openAt : '';
  let closeAt = typeof settings.closeAt === 'string' ? settings.closeAt : '';

  if (hasExplicitMode) {
    mode = settings.mode!;
  } else if (settings.status === 'closed_permanently') {
    mode = 'manual_closed';
    openAt = '';
    closeAt = '';
  } else if (settings.status === 'closed' || settings.isOpen === false) {
    if (settings.countdownTarget && settings.countdownTarget.trim()) {
      mode = 'auto';
      openAt = settings.countdownTarget.trim();
      closeAt = '';
    } else {
      mode = 'manual_closed';
      openAt = '';
      closeAt = '';
    }
  } else {
    mode = 'manual_open';
    openAt = '';
    closeAt = typeof settings.countdownTarget === 'string' ? settings.countdownTarget.trim() : '';
  }

  const showCountdown =
    settings.showCountdown !== undefined
      ? settings.showCountdown !== false
      : settings.showHeaderCountdown !== false;

  const resolved = resolveRegistrationState({ mode, openAt, closeAt, showCountdown });
  const legacyStatus: RegistrationSettings['status'] =
    resolved.phase === 'open'
      ? 'open'
      : resolved.phase === 'upcoming'
        ? 'closed'
        : 'closed_permanently';

  const legacyCountdownTarget =
    resolved.phase === 'upcoming' ? openAt : resolved.phase === 'open' ? closeAt : '';

  return {
    ...defaults,
    ...settings,
    mode,
    openAt,
    closeAt,
    showCountdown,
    showHeaderCountdown: showCountdown,
    status: legacyStatus,
    isOpen: resolved.phase === 'open',
    countdownTarget: legacyCountdownTarget,
    customQuestions: Array.isArray(settings.customQuestions)
      ? settings.customQuestions
      : [...defaults.customQuestions],
  };
}

export function migrateLegacyLandingData(data: Partial<LandingData> | null | undefined, defaults: LandingData): LandingData {
  if (!data) return { ...defaults };
  const merged: LandingData = { ...defaults, ...data };

  // Preserve all existing Firestore values (achievements, location, email, etc.) without rewriting them
  if (!merged.footerInstagram || merged.footerInstagram === 'https://instagram.com') {
    merged.footerInstagram = defaults.footerInstagram;
  }
  if (!merged.footerYoutube || merged.footerYoutube === 'https://youtube.com') {
    merged.footerYoutube = defaults.footerYoutube;
  }

  return merged;
}

export interface SpurGearParams {
  teeth: number;
  rootRadius: number;
  pitchRadius: number;
  tipRadius: number;
  phaseOffsetDeg?: number;
}

export function buildSpurGearPath({
  teeth,
  rootRadius,
  pitchRadius,
  tipRadius,
  phaseOffsetDeg = 0,
}: SpurGearParams): string {
  const step = (Math.PI * 2) / teeth;
  const phaseRad = (phaseOffsetDeg * Math.PI) / 180;
  // Involute-inspired trapezoidal tooth profile with crisp visual backlash for stroke clearance
  const halfRoot = step * 0.23;
  const halfPitch = step * 0.195;
  const halfTip = step * 0.13;
  const fmt = (n: number) => Number(n.toFixed(2));

  const commands: string[] = [];
  for (let i = 0; i < teeth; i += 1) {
    const center = phaseRad + i * step;
    const vertices = [
      { a: center - halfRoot, r: rootRadius },
      { a: center - halfPitch, r: pitchRadius },
      { a: center - halfTip, r: tipRadius },
      { a: center + halfTip, r: tipRadius },
      { a: center + halfPitch, r: pitchRadius },
      { a: center + halfRoot, r: rootRadius },
    ];
    vertices.forEach(({ a, r }, idx) => {
      const x = fmt(Math.cos(a) * r);
      const y = fmt(Math.sin(a) * r);
      commands.push(`${i === 0 && idx === 0 ? 'M' : 'L'} ${x} ${y}`);
    });
  }
  return `${commands.join(' ')} Z`;
}

