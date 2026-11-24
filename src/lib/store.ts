import {
  INITIAL_APPLICANTS,
  INITIAL_BLOG_ARTICLES,
  INITIAL_LANDING_DATA,
  INITIAL_PORTFOLIO_PROJECTS,
  INITIAL_REG_SETTINGS,
} from './content';
import {
  migrateLegacyLandingData,
  normalizeRegSettings,
} from './logic';
import { MEDIA_ASSETS, resolveMediaAsset } from './media';
import type {
  Applicant,
  BlogArticle,
  LandingData,
  PortfolioProject,
  RegistrationSettings,
} from './types';

declare global {
  interface Window {
    firebase?: {
      apps: unknown[];
      initializeApp: (config: Record<string, string>) => void;
      firestore: () => FirestoreLike;
      auth: () => unknown;
    };
  }
}

interface FirestoreDocSnapshot {
  exists: boolean;
  data: () => Record<string, unknown>;
}

interface FirestoreDocRef {
  get: () => Promise<FirestoreDocSnapshot>;
  set: (data: unknown) => Promise<void>;
  onSnapshot: (
    onNext: (doc: FirestoreDocSnapshot) => void,
    onErr?: (err: unknown) => void
  ) => () => void;
}

interface FirestoreLike {
  collection: (name: string) => {
    doc: (id: string) => FirestoreDocRef;
  };
}

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAQQctyhe_Z9HTiWQLt2MUuYeGMOCE1T5U',
  authDomain: 'website-motechart.firebaseapp.com',
  projectId: 'website-motechart',
  storageBucket: 'website-motechart.firebasestorage.app',
  messagingSenderId: '469005681722',
  appId: '1:469005681722:web:d21d38dae2aa6ef5bfe103',
};

const FORM_RATE_LIMIT_KEY = 'robotik_last_form_submit';
const FORM_COOLDOWN_MS = 15000;

function obfuscate(text: string): string {
  try {
    const b64 = btoa(unescape(encodeURIComponent(text)));
    let result = '';
    for (let i = 0; i < b64.length; i++) {
      result += String.fromCharCode(b64.charCodeAt(i) ^ 18);
    }
    return `SEC_${result}`;
  } catch {
    return text;
  }
}

function deobfuscate(text: string): string | null {
  if (!text || typeof text !== 'string' || !text.startsWith('SEC_')) return null;
  try {
    const rawCipher = text.substring(4);
    let raw = '';
    for (let i = 0; i < rawCipher.length; i++) {
      raw += String.fromCharCode(rawCipher.charCodeAt(i) ^ 18);
    }
    return decodeURIComponent(escape(atob(raw)));
  } catch {
    return null;
  }
}

export function loadLocalData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return structuredClone(fallback);
    }
    if (raw.startsWith('SEC_')) {
      const dec = deobfuscate(raw);
      if (dec) return JSON.parse(dec) as T;
    }
    return JSON.parse(raw) as T;
  } catch {
    return structuredClone(fallback);
  }
}

export function saveLocalData<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, obfuscate(serialized));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

function normalizeArticlesMedia(articles: BlogArticle[]): BlogArticle[] {
  const fallbackKeys: Array<keyof typeof MEDIA_ASSETS> = [
    'arduinoWorkshop',
    'mazeSolver',
    'smartAgri',
    'heroLab',
  ];
  return articles.map((art, idx) => ({
    ...art,
    headerImage: resolveMediaAsset(art.headerImage, fallbackKeys[idx % fallbackKeys.length]),
  }));
}

function normalizeProjectsMedia(projects: PortfolioProject[]): PortfolioProject[] {
  const fallbackKeys: Array<keyof typeof MEDIA_ASSETS> = [
    'soccerBot',
    'smartAgri',
    'mazeSolver',
    'heroLab',
  ];
  return projects.map((proj, idx) => ({
    ...proj,
    headerImage: resolveMediaAsset(proj.headerImage, fallbackKeys[idx % fallbackKeys.length]),
  }));
}

export interface AppStoreState {
  blogArticles: BlogArticle[];
  portfolioProjects: PortfolioProject[];
  applicants: Applicant[];
  regSettings: RegistrationSettings;
  landingData: LandingData;
  useFirebase: boolean;
  db: FirestoreLike | null;
}

function createInitialState(): AppStoreState {
  const blogArticles = normalizeArticlesMedia(
    loadLocalData<BlogArticle[]>('robotik_blog', INITIAL_BLOG_ARTICLES)
  );
  const portfolioProjects = normalizeProjectsMedia(
    loadLocalData<PortfolioProject[]>('robotik_portfolio', INITIAL_PORTFOLIO_PROJECTS)
  );
  const landingData = migrateLegacyLandingData(
    loadLocalData<LandingData>('robotik_landing', INITIAL_LANDING_DATA),
    INITIAL_LANDING_DATA
  );
  const regSettings = normalizeRegSettings(
    loadLocalData<RegistrationSettings>('robotik_reg_settings', INITIAL_REG_SETTINGS),
    INITIAL_REG_SETTINGS
  );
  const applicants = loadLocalData<Applicant[]>('robotik_applicants', INITIAL_APPLICANTS);

  return {
    blogArticles,
    portfolioProjects,
    applicants,
    regSettings,
    landingData,
    useFirebase: false,
    db: null,
  };
}

export const appState: AppStoreState = createInitialState();

export function checkFormRateLimit(): { allowed: boolean; remainingMs: number } {
  try {
    const last = parseInt(localStorage.getItem(FORM_RATE_LIMIT_KEY) || '0', 10);
    const elapsed = Date.now() - last;
    if (last && elapsed < FORM_COOLDOWN_MS) {
      return { allowed: false, remainingMs: FORM_COOLDOWN_MS - elapsed };
    }
    return { allowed: true, remainingMs: 0 };
  } catch {
    return { allowed: true, remainingMs: 0 };
  }
}

export function recordFormSubmission(): void {
  try {
    localStorage.setItem(FORM_RATE_LIMIT_KEY, String(Date.now()));
  } catch {
    // Ignore storage errors
  }
}

export async function saveApplicantRecord(applicant: Applicant): Promise<void> {
  appState.applicants = [applicant, ...appState.applicants.filter((a) => a.id !== applicant.id)];
  saveLocalData('robotik_applicants', appState.applicants);

  if (appState.useFirebase && appState.db) {
    try {
      await appState.db.collection('applicants').doc(applicant.id).set(applicant);
    } catch {
      // Local persistence already succeeded; avoid surfacing network errors to user
    }
  }
}

export async function findApplicantById(normalizedId: string): Promise<Applicant | null> {
  // Always check Firestore first when online & connected, then gracefully fall back to localStorage
  if (appState.useFirebase && appState.db) {
    try {
      const snap = await appState.db.collection('applicants').doc(normalizedId).get();
      if (snap.exists) {
        return snap.data() as unknown as Applicant;
      }
    } catch {
      // Fallback to local records
    }
  }

  const localList = loadLocalData<Applicant[]>('robotik_applicants', appState.applicants);
  const found =
    localList.find((a) => a.id.toUpperCase() === normalizedId) ||
    appState.applicants.find((a) => a.id.toUpperCase() === normalizedId) ||
    INITIAL_APPLICANTS.find((a) => a.id.toUpperCase() === normalizedId) ||
    null;
  return found;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

let cloudSyncInitialized = false;

export async function initOptionalCloudSync(callbacks: {
  onLandingChange: () => void;
  onSettingsChange: () => void;
  onBlogChange: () => void;
  onPortfolioChange: () => void;
}): Promise<void> {
  if (cloudSyncInitialized) return;
  cloudSyncInitialized = true;

  try {
    if (!window.firebase) {
      await loadScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js');
    }
    if (!window.firebase) return;

    if (!window.firebase.apps || window.firebase.apps.length === 0) {
      window.firebase.initializeApp(FIREBASE_CONFIG);
    }
    const db = window.firebase.firestore();
    appState.db = db;
    appState.useFirebase = true;

    // Read-only real-time listeners: faithfully mirror all live Firestore records without mutating them
    db.collection('settings')
      .doc('registration')
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            appState.regSettings = normalizeRegSettings(
              doc.data() as Partial<RegistrationSettings>,
              INITIAL_REG_SETTINGS
            );
            saveLocalData('robotik_reg_settings', appState.regSettings);
            callbacks.onSettingsChange();
          }
        },
        () => {
          // Silently ignore offline/permission errors
        }
      );

    db.collection('landing')
      .doc('content')
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            appState.landingData = migrateLegacyLandingData(
              doc.data() as Partial<LandingData>,
              INITIAL_LANDING_DATA
            );
            saveLocalData('robotik_landing', appState.landingData);
            callbacks.onLandingChange();
          }
        },
        () => {}
      );

    db.collection('blog')
      .doc('articles')
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const raw = (doc.data().articles as BlogArticle[]) || [];
            appState.blogArticles = normalizeArticlesMedia(raw);
            saveLocalData('robotik_blog', appState.blogArticles);
            callbacks.onBlogChange();
          }
        },
        () => {}
      );

    db.collection('portfolio')
      .doc('projects')
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const raw = (doc.data().projects as PortfolioProject[]) || [];
            appState.portfolioProjects = normalizeProjectsMedia(raw);
            saveLocalData('robotik_portfolio', appState.portfolioProjects);
            callbacks.onPortfolioChange();
          }
        },
        () => {}
      );
  } catch {
    // Graceful offline fallback using local data
    appState.useFirebase = false;
    appState.db = null;
  }
}

export function showToast(message: string, type: 'success' | 'error' = 'success'): void {
  let container = document.getElementById('motechart-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'motechart-toast-container';
    container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.setAttribute('role', 'status');
  toast.className = `pointer-events-auto flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur-md transition-all duration-200 ${
    type === 'error'
      ? 'border-rose-500/40 bg-slate-950/95 text-rose-100'
      : 'border-amber-400/35 bg-slate-950/95 text-slate-100'
  }`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => {
      toast.remove();
      if (container && container.children.length === 0) container.remove();
    }, 220);
  }, 3200);
}
