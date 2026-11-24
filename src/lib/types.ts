export type DivisionKey = 'mechanics' | 'electronics' | 'programming';

export interface BlogArticle {
  id: number | string;
  title: string;
  category: 'arduino' | 'tutorial' | 'iot' | 'kompetisi' | string;
  date: string;
  author: string;
  readTime?: string;
  excerpt: string;
  headerImage: string;
  content: string;
}

export interface PortfolioProject {
  id: number | string;
  title: string;
  category: 'mekanik & elektronik' | 'iot' | 'pemrograman' | string;
  divisionKey?: DivisionKey;
  status: 'Selesai' | 'Pengembangan' | string;
  year?: string;
  creators: string;
  components: string;
  specs: string;
  description: string;
  headerImage: string;
  content: string;
  code: string;
  schematic: string;
  showCode: boolean;
  isWinner: boolean;
  awardName: string;
}

export interface CustomQuestion {
  id: string;
  label: string;
  type: 'text' | 'select' | 'radio';
  options?: string[];
  required: boolean;
}

export interface RegistrationSettings {
  isOpen: boolean;
  status: 'open' | 'closed' | 'closed_permanently';
  showHeaderCountdown: boolean;
  countdownTarget: string;
  customQuestions: CustomQuestion[];
  waTitle: string;
  waDesc: string;
  waLink: string;
}

export interface Applicant {
  id: string;
  nama: string;
  kelas: 'X' | 'XI' | 'XII' | string;
  email: string;
  noHp: string;
  divisi?: string;
  laptop: string;
  motivasi: string;
  tanggalDaftar: string;
  timestamp: string;
  status: 'Pending' | 'Diterima' | 'Ditolak';
  customAnswers: Record<string, string>;
}

export interface Achievement {
  juara: string;
  organizer: string;
  year: string;
  level?: string;
}

export interface LandingData {
  heroTag: string;
  heroTitle: string;
  heroDesc: string;
  visiText: string;
  misiList: string[];
  divMechDesc: string;
  divElecDesc: string;
  divProgDesc: string;
  achievements: Achievement[];
  footerTagline: string;
  footerLocation: string;
  footerEmail: string;
  footerInstagram: string;
  footerYoutube: string;
}

export interface DivisionCatalogItem {
  id: DivisionKey;
  index: string;
  label: string;
  subtitle: string;
  portfolioCategory: string;
  tools: string[];
  focusPoints: string[];
  sampleLabel: string;
  sampleCode?: string;
  sampleSpecs?: Array<{ label: string; value: string }>;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export interface CountdownParts {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
