/**
 * Shared Utilities and Central Data Store for Motechart Robotik
 */

// Disable telemetry and debugging prints in production build
if (import.meta.env.PROD) {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.warn = () => {};
}


import {
  INITIAL_APPLICANTS,
  INITIAL_BLOG_ARTICLES,
  INITIAL_LANDING_DATA,
  INITIAL_PORTFOLIO_PROJECTS,
  INITIAL_REG_SETTINGS,
} from './src/lib/content.ts';
import {
  formatIndonesianSchedule,
  formatLocalOffsetIso,
  normalizeRegSettings as normalizeRegSettingsCore,
  resolveRegistrationState,
  toLocalDateTimeParts,
  validateRegistrationSchedule,
} from './src/lib/logic.ts';

export {
  INITIAL_APPLICANTS,
  INITIAL_BLOG_ARTICLES,
  INITIAL_LANDING_DATA,
  INITIAL_PORTFOLIO_PROJECTS,
  INITIAL_REG_SETTINGS,
  formatIndonesianSchedule,
  formatLocalOffsetIso,
  resolveRegistrationState,
  toLocalDateTimeParts,
  validateRegistrationSchedule,
};

export function normalizeRegSettings(settings) {
  return normalizeRegSettingsCore(settings, INITIAL_REG_SETTINGS);
}


// --- LOCAL STORAGE DATA HELPERS (CMS PERSISTENCE WITH OBFUSCATION) ---
// SECURITY NOTE: This is NOT encryption. It is simple obfuscation (Base64 + XOR)
// to prevent casual inspection of localStorage. It does NOT protect against
// a determined attacker with DevTools access. Sensitive data should only be
// stored server-side (Firestore) and protected by security rules.
export function obfuscate(text) {
  try {
    const b64 = btoa(unescape(encodeURIComponent(text)));
    let result = '';
    for (let i = 0; i < b64.length; i++) {
      result += String.fromCharCode(b64.charCodeAt(i) ^ 18); // XOR key 18
    }
    return 'SEC_' + result;
  } catch (e) {
    return text;
  }
}

export function deobfuscate(text) {
  if (!text || typeof text !== 'string' || !text.startsWith('SEC_')) return null;
  try {
    const rawCipher = text.substring(4);
    let raw = '';
    for (let i = 0; i < rawCipher.length; i++) {
      raw += String.fromCharCode(rawCipher.charCodeAt(i) ^ 18);
    }
    return decodeURIComponent(escape(atob(raw)));
  } catch (e) {
    return null;
  }
}

export function loadData(key, fallbackData) {
  try {
    const rawData = localStorage.getItem(key);
    if (!rawData) {
      saveData(key, fallbackData, false);
      return fallbackData;
    }
    
    if (rawData.startsWith('SEC_')) {
      const dec = deobfuscate(rawData);
      if (dec) {
        return JSON.parse(dec);
      }
    }
    
    try {
      const parsed = JSON.parse(rawData);
      saveData(key, parsed, false);
      return parsed;
    } catch (e) {
      saveData(key, fallbackData, false);
      return fallbackData;
    }
  } catch (e) {
    console.error('LocalStorage load failed:', e);
    return fallbackData;
  }
}

export function saveData(key, data, syncToCloud = true) {
  try {
    const serialized = JSON.stringify(data);
    const encrypted = obfuscate(serialized);
    localStorage.setItem(key, encrypted);

    const currentUser = auth ? auth.currentUser : null;
    if (useFirebase && syncToCloud && currentUser) {
      let writePromise = null;
      if (key === 'robotik_reg_settings') {
        writePromise = db.collection('settings').doc('registration').set(data);
      } else if (key === 'robotik_landing') {
        writePromise = db.collection('landing').doc('content').set(data);
      } else if (key === 'robotik_blog') {
        writePromise = db.collection('blog').doc('articles').set({ articles: data });
      } else if (key === 'robotik_portfolio') {
        writePromise = db.collection('portfolio').doc('projects').set({ projects: data });
      }
      if (writePromise) {
        return writePromise
          .then(() => true)
          .catch((err) => {
            console.error(`Cloud Sync Error (${key}):`, err);
            throw err;
          });
      }
    }
    return Promise.resolve(true);
  } catch (e) {
    console.error('LocalStorage save failed:', e);
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      customAlert('⚠️ Penyimpanan browser Anda penuh! Perubahan data tidak dapat disimpan secara permanen.');
    }
    return Promise.reject(e);
  }
}


// --- FIREBASE FIRESTORE SYNC & SEEDING ---
const firebaseConfig = {
  apiKey: "AIzaSyAQQctyhe_Z9HTiWQLt2MUuYeGMOCE1T5U",
  authDomain: "website-motechart.firebaseapp.com",
  projectId: "website-motechart",
  storageBucket: "website-motechart.firebasestorage.app",
  messagingSenderId: "469005681722",
  appId: "1:469005681722:web:d21d38dae2aa6ef5bfe103"
};

let db = null;
let auth = null;
let useFirebase = false;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.head.appendChild(script);
  });
}

export async function loadFirebaseSDKs() {
  if (typeof firebase !== 'undefined') return;
  await loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
  await Promise.all([
    loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js"),
    loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js")
  ]);
}

export async function ensureFirebaseInitialized() {
  if (useFirebase && db && auth) {
    return;
  }
  if (typeof firebase === 'undefined' && firebaseConfig.projectId !== 'PLACEHOLDER_PROJECT_ID') {
    try {
      await loadFirebaseSDKs();
    } catch (e) {
      console.error("Failed to load Firebase scripts dynamically:", e);
      return;
    }
  }
  if (typeof firebase !== 'undefined' && firebaseConfig.projectId !== 'PLACEHOLDER_PROJECT_ID' && !useFirebase) {
    try {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      auth = firebase.auth();
      useFirebase = true;
      
      // Update state object properties
      state.db = db;
      state.auth = auth;
      state.useFirebase = useFirebase;
      
      console.log("Motechart Cloud Engine: Firebase Firestore & Auth initialized successfully! ☁️");
    } catch (e) {
      console.error("Motechart Cloud Engine: Firebase initialization failed:", e);
    }
  }
}


// Migration utility for landing page data
export function migrateLandingData(data) {
  let changed = false;
  if (!data) return false;
  if (data.footerInstagram === 'https://instagram.com' || !data.footerInstagram) {
    data.footerInstagram = 'https://www.instagram.com/motechart_mansabo/';
    changed = true;
  }
  if (data.footerYoutube === 'https://youtube.com' || !data.footerYoutube) {
    data.footerYoutube = 'https://www.youtube.com/@Motechart-RobotikMAN1Bogor';
    changed = true;
  }
  if ('footerGithub' in data) {
    delete data.footerGithub;
    changed = true;
  }
  return changed;
}

// --- CENTRAL DATA STATE OBJECT ---
export const state = {
  blogArticles: loadData('robotik_blog', INITIAL_BLOG_ARTICLES),
  portfolioProjects: loadData('robotik_portfolio', INITIAL_PORTFOLIO_PROJECTS),
  applicants: loadData('robotik_applicants', INITIAL_APPLICANTS).map(app => {
    if (!app.timestamp && app.tanggalDaftar) {
      app.timestamp = `${app.tanggalDaftar}T00:00:00.000Z`;
    }
    return app;
  }),
  regSettings: normalizeRegSettings(loadData('robotik_reg_settings', INITIAL_REG_SETTINGS)),
  landingData: loadData('robotik_landing', INITIAL_LANDING_DATA),
  soundMuted: false,
  useFirebase: useFirebase,
  db: db,
  auth: auth
};

// Run local migration
if (migrateLandingData(state.landingData)) {
  saveData('robotik_landing', state.landingData, false);
}


// --- CLOUD FIREBASE SYNC HELPERS ---
export async function syncApplicantsFromFirestore() {
  if (!state.useFirebase) return;
  try {
    const snapshot = await state.db.collection('applicants').get();
    const fetched = [];
    snapshot.forEach(doc => {
      fetched.push(doc.data());
    });
    state.applicants = fetched.map(app => {
      if (!app.timestamp && app.tanggalDaftar) {
        app.timestamp = `${app.tanggalDaftar}T00:00:00.000Z`;
      }
      return app;
    });
    saveData('robotik_applicants', state.applicants, false);
    console.log(`Cloud sync completed: ${state.applicants.length} applicants loaded.`);
  } catch (e) {
    console.error("Firestore sync applicants failed:", e);
  }
}

export async function syncRegSettingsFromFirestore() {
  if (!state.useFirebase) return;
  try {
    const doc = await state.db.collection('settings').doc('registration').get();
    if (doc.exists) {
      state.regSettings = normalizeRegSettings(doc.data());
      saveData('robotik_reg_settings', state.regSettings, false);
      console.log("Cloud sync completed: Registration settings loaded.");
    }
  } catch (e) {
    console.error("Firestore sync settings failed:", e);
  }
}

export async function syncLandingDataFromFirestore() {
  if (!state.useFirebase) return;
  try {
    const doc = await state.db.collection('landing').doc('content').get();
    if (doc.exists) {
      const data = doc.data();
      migrateLandingData(data);
      state.landingData = data;
      saveData('robotik_landing', state.landingData, false);
      console.log("Cloud sync completed: Landing page data loaded.");
    }
  } catch (e) {
    console.error("Firestore sync landing data failed:", e);
  }
}

export async function syncBlogFromFirestore() {
  if (!state.useFirebase) return;
  try {
    const doc = await state.db.collection('blog').doc('articles').get();
    if (doc.exists) {
      const cloudData = doc.data();
      state.blogArticles = cloudData.articles || [];
      saveData('robotik_blog', state.blogArticles, false);
      console.log("Cloud sync completed: Blog articles loaded.");
    }
  } catch (e) {
    console.error("Firestore sync blog failed:", e);
  }
}

export async function syncPortfolioFromFirestore() {
  if (!state.useFirebase) return;
  try {
    const doc = await state.db.collection('portfolio').doc('projects').get();
    if (doc.exists) {
      const cloudData = doc.data();
      state.portfolioProjects = cloudData.projects || [];
      saveData('robotik_portfolio', state.portfolioProjects, false);
      console.log("Cloud sync completed: Portfolio projects loaded.");
    }
  } catch (e) {
    console.error("Firestore sync portfolio failed:", e);
  }
}

let applicantsUnsubscribe = null;
export function setupRealTimeApplicantsSync(onUpdateCallback) {
  if (!state.useFirebase) return;
  if (applicantsUnsubscribe) return;
  
  const currentUser = state.auth ? state.auth.currentUser : null;
  if (!currentUser) {
    console.warn("setupRealTimeApplicantsSync: User is not authenticated. Deferring real-time subscription.");
    return;
  }
  
  try {
    applicantsUnsubscribe = state.db.collection('applicants').onSnapshot(snapshot => {
      const fetched = [];
      snapshot.forEach(doc => {
        fetched.push(doc.data());
      });
      state.applicants = fetched.map(app => {
        if (!app.timestamp && app.tanggalDaftar) {
          app.timestamp = `${app.tanggalDaftar}T00:00:00.000Z`;
        }
        return app;
      });
      saveData('robotik_applicants', state.applicants, false);
      console.log("Real-time applicants updated from Cloud Firestore!");

      if (typeof onUpdateCallback === 'function') {
        onUpdateCallback(state.applicants);
      }
    }, err => {
      console.error("Firestore real-time applicants subscription failed:", err);
      applicantsUnsubscribe = null;
    });
  } catch (e) {
    console.error("Failed to setup Firestore real-time listener:", e);
  }
}

export function unsubscribeRealTimeApplicants() {
  if (applicantsUnsubscribe) {
    try {
      applicantsUnsubscribe();
      console.log("Unsubscribed from real-time applicants sync.");
    } catch (e) {
      console.error("Failed to unsubscribe from real-time applicants sync:", e);
    }
    applicantsUnsubscribe = null;
  }
}

export async function initializeCloudDataSync(callbacks = {}) {
  if (state.useFirebase) {
    console.log("Motechart Cloud Engine: Initiating data sync from Firebase Firestore...");
    await syncLandingDataFromFirestore();
    await syncRegSettingsFromFirestore();
    await syncApplicantsFromFirestore();
    await syncBlogFromFirestore();
    await syncPortfolioFromFirestore();
    
    if (typeof callbacks.onSyncComplete === 'function') {
      callbacks.onSyncComplete();
    }
  }
}


// --- WEB AUDIO AUDIO SYNTHESIZER ---
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function playRoboticSound(type) {
  if (state.soundMuted) return;
  
  try {
    initAudio();
    if (!audioCtx) return;

    const time = audioCtx.currentTime;
    
    switch (type) {
      case 'click': {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(100, time + 0.06);
        gainNode.gain.setValueAtTime(0.08, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.07);
        break;
      }
      case 'hover': {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, time);
        osc.frequency.setValueAtTime(1800, time + 0.015);
        gainNode.gain.setValueAtTime(0.015, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.035);
        break;
      }
      case 'success': {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const noteTime = time + (idx * 0.08);
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);
          gainNode.gain.setValueAtTime(0.05, noteTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.08);
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.09);
        });
        break;
      }
      case 'error': {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, time);
        osc.frequency.linearRampToValueAtTime(80, time + 0.15);
        gainNode.gain.setValueAtTime(0.08, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, time);
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.17);
        break;
      }
    }
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
}


// --- MARKDOWN & HTML UTILITIES ---
export function parseMarkdownToHtml(markdown) {
  if (!markdown) return '';

  // If content is already HTML, sanitize it to prevent Stored XSS.
  // Only allow safe tags and strip all event handlers and dangerous attributes.
  if (markdown.trim().startsWith('<') || /<\/?[a-z][\s\S]*>/i.test(markdown)) {
    return sanitizeRichHtml(markdown);
  }

  let escaped = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const codeBlocks = [];
  escaped = escaped.replace(/```([\s\S]*?)```/g, (match, code) => {
    let cleanCode = code;
    const matchLang = code.match(/^([a-zA-Z0-9+#-]+)\r?\n/);
    let lang = '';
    if (matchLang) {
      lang = matchLang[1];
      cleanCode = code.slice(matchLang[0].length);
    }
    const id = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(`<pre><code class="language-${lang}">${cleanCode.trim()}</code></pre>`);
    return id;
  });

  escaped = escaped.replace(/^\s*>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
  escaped = escaped.replace(/^\s*####\s+(.+)$/gm, '<h4>$1</h4>');
  escaped = escaped.replace(/^\s*###\s+(.+)$/gm, '<h3>$1</h3>');
  escaped = escaped.replace(/^\s*##\s+(.+)$/gm, '<h2>$1</h2>');
  escaped = escaped.replace(/^\s*#\s+(.+)$/gm, '<h1>$1</h1>');

  escaped = escaped.replace(/^\s*[\-\*]\s+(.+)$/gm, '<li>$1</li>');
  escaped = escaped.replace(/(?:^\s*<li>.*?<\/li>\s*)+/gm, (match) => {
    return `<ul>\n${match}</ul>\n`;
  });

  escaped = escaped.replace(/^\s*\d+\.\s+(.+)$/gm, '<ol-item>$1</ol-item>');
  escaped = escaped.replace(/(?:^\s*<ol-item>.*?<\/ol-item>\s*)+/gm, (match) => {
    return `<ol>\n${match.replace(/<ol-item>/g, '<li>').replace(/<\/ol-item>/g, '</li>')}</ol>\n`;
  });

  const paragraphs = escaped.split(/\n\s*\n+/);
  const processed = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (/^(<h[1-6]|<ul|<ol|<blockquote|<pre|<li>|__CODE_BLOCK_)/.test(trimmed)) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
  });
  escaped = processed.join('\n\n');

  escaped = escaped.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  escaped = escaped.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  escaped = escaped.replace(/_([^_]+)_/g, '<em>$1</em>');
  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
  escaped = escaped.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, (_m, alt, rawUrl) => {
    const safe = sanitizeUrl(rawUrl);
    return safe ? `<img src="${safe}" alt="${alt}" class="blog-img" loading="lazy">` : '';
  });
  escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, rawUrl) => {
    const safe = sanitizeUrl(rawUrl);
    return safe ? `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>` : label;
  });

  codeBlocks.forEach((block, idx) => {
    escaped = escaped.replace(`__CODE_BLOCK_${idx}__`, block);
  });

  return escaped;
}

export function sanitizeInput(text) {
  if (typeof text !== 'string') return text;
  try {
    // DOMParser-based sanitizer: parse as HTML, then extract only text content
    // This neutralizes all tags, event handlers, javascript: URIs, and script injection
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return (doc.body.textContent || '').trim();
  } catch (e) {
    // Fallback: aggressive strip if DOMParser fails
    return text.replace(/<[^>]*>/g, '').replace(/on\w+\s*=/gi, '').trim();
  }
}

/**
 * Sanitizes rich HTML content (from CMS Rich Text Editor) to prevent Stored XSS.
 * Allows only a safe whitelist of tags and attributes. Strips everything else.
 */
export function sanitizeRichHtml(html) {
  if (typeof html !== 'string') return '';
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const ALLOWED_TAGS = new Set([
      'P', 'BR', 'B', 'I', 'U', 'STRONG', 'EM', 'S', 'STRIKE',
      'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
      'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE', 'CODE',
      'A', 'IMG', 'SPAN', 'DIV', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD',
      'FIGURE', 'FIGCAPTION', 'HR', 'SUB', 'SUP'
    ]);
    const ALLOWED_ATTRS = new Set([
      'href', 'src', 'alt', 'title', 'class', 'id',
      'target', 'rel', 'width', 'height', 'loading',
      'colspan', 'rowspan', 'scope'
    ]);
    // Safe style properties whitelist
    const SAFE_STYLE_PROPS = /^(color|background-color|font-size|font-weight|font-style|text-align|text-decoration|margin|padding|border|border-radius|max-width|display|line-height|letter-spacing|white-space|vertical-align|opacity)/i;

    function sanitizeNode(node) {
      if (node.nodeType === Node.TEXT_NODE) return;
      if (node.nodeType === Node.COMMENT_NODE) {
        node.remove();
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      if (!ALLOWED_TAGS.has(node.tagName)) {
        // Replace disallowed tags with their text content
        const text = document.createTextNode(node.textContent || '');
        node.parentNode.replaceChild(text, node);
        return;
      }

      // Remove all disallowed attributes
      const attrs = Array.from(node.attributes);
      for (const attr of attrs) {
        const name = attr.name.toLowerCase();
        // Remove ALL event handlers (onclick, onerror, onload, etc.)
        if (name.startsWith('on')) {
          node.removeAttribute(attr.name);
          continue;
        }
        if (name === 'style') {
          // Sanitize inline styles: only allow safe properties
          const safeStyles = attr.value.split(';')
            .map(s => s.trim())
            .filter(s => s && SAFE_STYLE_PROPS.test(s.split(':')[0].trim()))
            .join('; ');
          if (safeStyles) {
            node.setAttribute('style', safeStyles);
          } else {
            node.removeAttribute('style');
          }
          continue;
        }
        if (!ALLOWED_ATTRS.has(name)) {
          node.removeAttribute(attr.name);
          continue;
        }
        // Validate URL attributes
        if (name === 'href' || name === 'src') {
          const val = attr.value.trim().toLowerCase();
          if (val.startsWith('javascript:') || val.startsWith('vbscript:') || val.startsWith('data:text')) {
            node.removeAttribute(attr.name);
          }
        }
      }

      // Force safe link attributes
      if (node.tagName === 'A') {
        node.setAttribute('rel', 'noopener noreferrer');
      }

      // Recurse into children (copy array since DOM may mutate)
      Array.from(node.childNodes).forEach(sanitizeNode);
    }

    sanitizeNode(doc.body);
    return doc.body.innerHTML;
  } catch (e) {
    // Fallback: strip ALL HTML if parsing fails
    return html.replace(/<[^>]*>/g, '').replace(/on\w+\s*=/gi, '');
  }
}

export function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validates a URL string to ensure it uses a safe protocol (https:// or http://).
 * Returns the URL if safe, or an empty string if dangerous (e.g., javascript:, data:).
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  // Only allow http:// and https:// protocols
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Allow safe base64 data URLs for images
  if (/^data:image\/(jpeg|png|gif|webp|svg\+xml);base64,/i.test(trimmed)) return trimmed;
  // Allow relative paths starting with ./ or /
  if (/^\.?\//.test(trimmed)) return trimmed;
  // Block everything else (javascript:, data: other than images, vbscript:, etc.)
  return '';
}

/**
 * Sanitizes CMS-provided HTML to allow ONLY <span> tags (for hero title accent).
 * Strips all other HTML tags and dangerous attributes.
 */
export function sanitizeHeroHtml(html) {
  if (typeof html !== 'string') return '';
  // Allow only <span> and </span> tags, escape everything else
  return html.replace(/<(?!\/?(span)\s*\/?>)[^>]*>/gi, (match) => escapeHtml(match));
}

// --- SECURE SESSION TOKEN MANAGEMENT ---



// --- LOGIN RATE LIMITER ---
// Uses localStorage (not sessionStorage) so rate limits persist across tabs and page refreshes.
const LOGIN_STORAGE_KEY = 'robotik_login_attempts';

/**
 * Returns the current login rate limit state.
 * @returns {{ attempts: number, lockoutUntil: number|null, isLocked: boolean, remainingMs: number }}
 */
export function getLoginRateLimit() {
  try {
    const data = JSON.parse(localStorage.getItem(LOGIN_STORAGE_KEY) || '{}');
    const attempts = data.attempts || 0;
    const lockoutUntil = data.lockoutUntil || null;
    const now = Date.now();
    if (lockoutUntil && now < lockoutUntil) {
      return { attempts, lockoutUntil, isLocked: true, remainingMs: lockoutUntil - now };
    }
    // If lockout expired, reset
    if (lockoutUntil && now >= lockoutUntil) {
      localStorage.removeItem(LOGIN_STORAGE_KEY);
      return { attempts: 0, lockoutUntil: null, isLocked: false, remainingMs: 0 };
    }
    return { attempts, lockoutUntil: null, isLocked: false, remainingMs: 0 };
  } catch (e) {
    return { attempts: 0, lockoutUntil: null, isLocked: false, remainingMs: 0 };
  }
}

/**
 * Records a failed login attempt and applies escalating lockout.
 * Lockout schedule: 5 attempts = 30s, 8 = 60s, 10 = 120s, 15+ = 300s
 */
export function recordFailedLogin() {
  const { attempts } = getLoginRateLimit();
  const newAttempts = attempts + 1;
  let lockoutMs = 0;
  if (newAttempts >= 15) lockoutMs = 300000;      // 5 minutes
  else if (newAttempts >= 10) lockoutMs = 120000;  // 2 minutes
  else if (newAttempts >= 8) lockoutMs = 60000;    // 1 minute
  else if (newAttempts >= 5) lockoutMs = 30000;    // 30 seconds

  const lockoutUntil = lockoutMs > 0 ? Date.now() + lockoutMs : null;
  localStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify({ attempts: newAttempts, lockoutUntil }));
  return { attempts: newAttempts, lockoutUntil, isLocked: !!lockoutUntil, lockoutMs };
}

/**
 * Resets the login rate limiter on successful login.
 */
export function resetLoginRateLimit() {
  localStorage.removeItem(LOGIN_STORAGE_KEY);
}

// --- FORM SUBMISSION RATE LIMITER ---
// Uses sessionStorage to persist cooldown across page refreshes within the same session.
const FORM_COOLDOWN_MS = 5000; // 5 seconds between submissions
const FORM_SUBMIT_KEY = 'robotik_form_last_submit';

/**
 * Checks if a form submission is allowed (cooldown-based).
 * @returns {{ allowed: boolean, remainingMs: number }}
 */
export function checkFormRateLimit() {
  const now = Date.now();
  const lastSubmit = parseInt(sessionStorage.getItem(FORM_SUBMIT_KEY) || '0', 10);
  const elapsed = now - lastSubmit;
  if (elapsed < FORM_COOLDOWN_MS) {
    return { allowed: false, remainingMs: FORM_COOLDOWN_MS - elapsed };
  }
  return { allowed: true, remainingMs: 0 };
}

/**
 * Records a form submission timestamp.
 */
export function recordFormSubmission() {
  sessionStorage.setItem(FORM_SUBMIT_KEY, String(Date.now()));
}

// --- REAL-TIME SETTINGS & LANDING SYNC LISTENERS ---
let regSettingsUnsubscribe = null;
export function setupRealTimeRegSettingsSync(onUpdateCallback) {
  if (!state.useFirebase) return;
  if (regSettingsUnsubscribe) return;
  try {
    regSettingsUnsubscribe = state.db.collection('settings').doc('registration').onSnapshot(doc => {
      if (doc.exists) {
        state.regSettings = normalizeRegSettings(doc.data());
        saveData('robotik_reg_settings', state.regSettings, false);
        console.log("Real-time registration settings updated from Cloud Firestore!");
        if (typeof onUpdateCallback === 'function') {
          onUpdateCallback(state.regSettings);
        }
      }
    }, err => {
      console.warn("Firestore real-time settings listener failed:", err);
    });
  } catch (e) {
    console.error("Failed to setup Firestore real-time listener for reg settings:", e);
  }
}

let landingDataUnsubscribe = null;
export function setupRealTimeLandingDataSync(onUpdateCallback) {
  if (!state.useFirebase) return;
  if (landingDataUnsubscribe) return;
  try {
    landingDataUnsubscribe = state.db.collection('landing').doc('content').onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        migrateLandingData(data);
        state.landingData = data;
        saveData('robotik_landing', state.landingData, false);
        console.log("Real-time landing data updated from Cloud Firestore!");
        if (typeof onUpdateCallback === 'function') {
          onUpdateCallback(state.landingData);
        }
      }
    }, err => {
      console.warn("Firestore real-time landing data listener failed:", err);
    });
  } catch (e) {
    console.error("Failed to setup Firestore real-time listener for landing data:", e);
  }
}

let blogUnsubscribe = null;
export function setupRealTimeBlogSync(onUpdateCallback) {
  if (!state.useFirebase) return;
  if (blogUnsubscribe) return;
  try {
    blogUnsubscribe = state.db.collection('blog').doc('articles').onSnapshot(doc => {
      if (doc.exists) {
        state.blogArticles = doc.data().articles || [];
        saveData('robotik_blog', state.blogArticles, false);
        console.log("Real-time blog articles updated from Cloud Firestore!");
        if (typeof onUpdateCallback === 'function') {
          onUpdateCallback(state.blogArticles);
        }
      }
    }, err => {
      console.warn("Firestore real-time blog listener failed:", err);
    });
  } catch (e) {
    console.error("Failed to setup Firestore real-time listener for blog:", e);
  }
}

let portfolioUnsubscribe = null;
export function setupRealTimePortfolioSync(onUpdateCallback) {
  if (!state.useFirebase) return;
  if (portfolioUnsubscribe) return;
  try {
    portfolioUnsubscribe = state.db.collection('portfolio').doc('projects').onSnapshot(doc => {
      if (doc.exists) {
        state.portfolioProjects = doc.data().projects || [];
        saveData('robotik_portfolio', state.portfolioProjects, false);
        console.log("Real-time portfolio projects updated from Cloud Firestore!");
        if (typeof onUpdateCallback === 'function') {
          onUpdateCallback(state.portfolioProjects);
        }
      }
    }, err => {
      console.warn("Firestore real-time portfolio listener failed:", err);
    });
  } catch (e) {
    console.error("Failed to setup Firestore real-time listener for portfolio:", e);
  }
}

export function unsubscribeAllRealtimeSync() {
  unsubscribeRealTimeApplicants();
  const listeners = [
    [regSettingsUnsubscribe, () => { regSettingsUnsubscribe = null; }],
    [landingDataUnsubscribe, () => { landingDataUnsubscribe = null; }],
    [blogUnsubscribe, () => { blogUnsubscribe = null; }],
    [portfolioUnsubscribe, () => { portfolioUnsubscribe = null; }],
  ];
  listeners.forEach(([unsub, clear]) => {
    if (typeof unsub === 'function') {
      try {
        unsub();
      } catch (e) {
        console.warn("Realtime unsubscribe failed:", e);
      }
      clear();
    }
  });
}

// --- CUSTOM DIALOG OVERLAYS (ALERT & CONFIRM) ---
function ensurePopupStyles() {
  if (!document.getElementById('custom-popup-styles')) {
    const style = document.createElement('style');
    style.id = 'custom-popup-styles';
    style.textContent = `
      .custom-popup-dialog {
        background: rgba(11, 17, 32, 0.98);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        color: #ffffff;
        padding: 2rem;
        max-width: 440px;
        width: 90%;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
        overflow: hidden;
        outline: none;
        position: fixed;
        top: 50% !important;
        left: 50% !important;
        right: auto !important;
        bottom: auto !important;
        margin: 0 !important;
        transform: translate(-50%, -50%) scale(0.92) !important;
        opacity: 0;
        transition: opacity 0.3s, transform 0.3s, display 0.3s, overlay 0.3s;
        transition-behavior: allow-discrete;
        z-index: 99999;
      }
      .custom-popup-dialog[open] {
        opacity: 1 !important;
        transform: translate(-50%, -50%) scale(1) !important;
      }
      @starting-style {
        .custom-popup-dialog[open] {
          opacity: 0 !important;
          transform: translate(-50%, -50%) scale(0.92) !important;
        }
      }
      .custom-popup-dialog::backdrop {
        background: rgba(2, 6, 23, 0.8);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .popup-content {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      .popup-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .popup-icon {
        font-size: 1.75rem;
      }
      .popup-title {
        font-family: 'Outfit', sans-serif;
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
        letter-spacing: 0.02em;
        color: #FACC15;
      }
      .popup-message {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 0.95rem;
        line-height: 1.6;
        color: #E2E8F0;
        margin: 0;
      }
      .popup-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
      .popup-actions .popup-btn {
        min-height: 42px;
        padding: 0.5rem 1.5rem;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        border-radius: 8px;
        border: 1px solid transparent;
        transition: all 0.2s ease;
      }
      .popup-actions .popup-btn-confirm {
        background: #FACC15;
        color: #0F172A;
      }
      .popup-actions .popup-btn-confirm:hover {
        background: #EAB308;
        transform: translateY(-1px);
        box-shadow: 0 0 12px rgba(250, 204, 21, 0.4);
      }
      .popup-actions .popup-btn-cancel {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
      .popup-actions .popup-btn-cancel:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.3);
      }
    `;
    document.head.appendChild(style);
  }
}

export function customAlert(message) {
  return new Promise((resolve) => {
    ensurePopupStyles();
    
    let dialog = document.getElementById('custom-alert-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'custom-alert-dialog';
      dialog.className = 'custom-popup-dialog';
      dialog.innerHTML = `
        <div class="popup-content">
          <div class="popup-header">
            <span class="popup-icon">⚠️</span>
            <h3 class="popup-title">Pemberitahuan</h3>
          </div>
          <p class="popup-message"></p>
          <div class="popup-actions">
            <button class="popup-btn popup-btn-confirm popup-close-btn">OK</button>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);
    }

    dialog.querySelector('.popup-message').textContent = message;
    
    const closeBtn = dialog.querySelector('.popup-close-btn');
    const handleClose = () => {
      dialog.close();
      closeBtn.removeEventListener('click', handleClose);
      resolve();
    };
    closeBtn.addEventListener('click', handleClose);
    
    dialog.showModal();
    document.body.classList.add('dialog-open');
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      resolve();
    }, { once: true });
  });
}

export function showToast(message, type = 'success') {
  ensurePopupStyles();
  
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.bottom = '2rem';
    container.style.right = '2rem';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '0.5rem';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.style.background = 'rgba(11, 17, 32, 0.95)';
  toast.style.backdropFilter = 'blur(8px)';
  toast.style.border = type === 'error' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(6, 182, 212, 0.4)';
  toast.style.color = 'var(--text-white)';
  toast.style.padding = '0.75rem 1.25rem';
  toast.style.borderRadius = 'var(--radius-md)';
  toast.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.3)';
  toast.style.fontSize = '0.85rem';
  toast.style.fontWeight = '500';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '0.5rem';
  toast.style.pointerEvents = 'auto';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(1rem)';
  toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';

  const icon = type === 'error' ? '❌' : '✅';
  const iconSpan = document.createElement('span');
  iconSpan.textContent = icon;
  const msgSpan = document.createElement('span');
  msgSpan.textContent = String(message ?? '');
  toast.append(iconSpan, msgSpan);
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-1rem)';
    toast.addEventListener('transitionend', () => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    });
  }, 3000);
}

export function customConfirm(message) {
  return new Promise((resolve) => {
    ensurePopupStyles();

    let dialog = document.getElementById('custom-confirm-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'custom-confirm-dialog';
      dialog.className = 'custom-popup-dialog';
      dialog.innerHTML = `
        <div class="popup-content">
          <div class="popup-header">
            <span class="popup-icon">❓</span>
            <h3 class="popup-title" style="color: #06B6D4;">Konfirmasi</h3>
          </div>
          <p class="popup-message"></p>
          <div class="popup-actions">
            <button class="popup-btn popup-btn-cancel popup-cancel-btn">Batal</button>
            <button class="popup-btn popup-btn-confirm popup-confirm-btn">Ya, Setuju</button>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);
    }

    dialog.querySelector('.popup-message').textContent = message;

    const cancelBtn = dialog.querySelector('.popup-cancel-btn');
    const confirmBtn = dialog.querySelector('.popup-confirm-btn');

    let resolved = false;

    const handleCancel = () => {
      if (resolved) return;
      resolved = true;
      dialog.close();
      resolve(false);
    };

    const handleConfirm = () => {
      if (resolved) return;
      resolved = true;
      dialog.close();
      resolve(true);
    };

    cancelBtn.onclick = handleCancel;
    confirmBtn.onclick = handleConfirm;

    dialog.showModal();
    document.body.classList.add('dialog-open');
    dialog.onclose = () => {
      document.body.classList.remove('dialog-open');
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    };
  });
}

