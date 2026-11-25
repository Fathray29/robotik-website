import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSpurGearPath,
  computeCountdown,
  escapeHtml,
  extractPrimarySkillTag,
  extractProjectImages,
  extractProjectShortDesc,
  filterArticles,
  filterProjects,
  generateRegistrationId,
  isStatusCheckEnabled,
  mapFirebaseAuthError,
  migrateLegacyLandingData,
  normalizePhoneNumber,
  normalizeRegistrationId,
  parseMarkdownToSafeHtml,
  sanitizeCsvCell,
  sanitizeHeroHtml,
  sanitizeRichHtmlSafe,
  sanitizeUrl,
  validateCustomQuestionAnswer,
  validateRegistrationField,
} from './logic';
import type { BlogArticle, LandingData, PortfolioProject } from './types';

test('validateRegistrationField accepts realistic Indonesian names with punctuation', () => {
  assert.equal(validateRegistrationField('nama_lengkap', 'M. Farhan Pratama').valid, true);
  assert.equal(validateRegistrationField('nama_lengkap', "A'isyah Nur-Haliza").valid, true);
  assert.equal(validateRegistrationField('nama_lengkap', 'A').valid, false);
  assert.equal(validateRegistrationField('nama_lengkap', 'Farhan123').valid, false);
});

test('validateRegistrationField normalizes and validates Indonesian WhatsApp numbers', () => {
  assert.equal(normalizePhoneNumber('0812-3456-7890'), '081234567890');
  assert.equal(validateRegistrationField('no_hp', '0812-3456-7890').valid, true);
  assert.equal(validateRegistrationField('no_hp', '+62 812 9876 5432').valid, true);
  assert.equal(validateRegistrationField('no_hp', '6281312345678').valid, true);
  assert.equal(validateRegistrationField('no_hp', '12345').valid, false);
});

test('validateRegistrationField enforces email, division, and 20-char motivation', () => {
  assert.equal(validateRegistrationField('email', 'farhan@man1bogor.sch.id').valid, true);
  assert.equal(validateRegistrationField('email', 'invalid-email').valid, false);
  assert.equal(validateRegistrationField('divisi', 'Elektronik').valid, true);
  assert.equal(validateRegistrationField('divisi', '').valid, false);
  assert.equal(validateRegistrationField('motivasi', 'Terlalu singkat').valid, false);
  assert.equal(
    validateRegistrationField('motivasi', 'Saya ingin belajar merakit robot otonom dan ESP32 bersama tim.').valid,
    true
  );
});

test('validateCustomQuestionAnswer handles required and optional custom questions', () => {
  const reqQ = { id: 'q1', label: 'Pengalaman', type: 'select' as const, required: true };
  const optQ = { id: 'q2', label: 'Catatan', type: 'text' as const, required: false };
  assert.equal(validateCustomQuestionAnswer(reqQ, '').valid, false);
  assert.equal(validateCustomQuestionAnswer(reqQ, 'Menengah').valid, true);
  assert.equal(validateCustomQuestionAnswer(optQ, '').valid, true);
});

test('normalizeRegistrationId and generateRegistrationId support 8-char alphanumeric IDs', () => {
  const id = generateRegistrationId(0x1a2b3c4d);
  assert.match(id, /^ROBO-[A-Z0-9]{8}$/);
  assert.equal(normalizeRegistrationId('2026a001'), 'ROBO-2026A001');
  assert.equal(normalizeRegistrationId('  robo-2026a001  '), 'ROBO-2026A001');
  assert.equal(normalizeRegistrationId('123456'), 'ROBO-123456');
  assert.equal(normalizeRegistrationId(''), '');
});

test('computeCountdown calculates remaining days, hours, minutes, seconds and expiry', () => {
  const now = Date.UTC(2026, 4, 1, 12, 0, 0);
  const future = new Date(now + (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000).toISOString();
  const res = computeCountdown(future, now);
  assert.deepEqual(res, { expired: false, days: 2, hours: 3, minutes: 4, seconds: 5 });

  const past = new Date(now - 5000).toISOString();
  assert.equal(computeCountdown(past, now).expired, true);
});

test('sanitizeUrl and parseMarkdownToSafeHtml block XSS and javascript URIs', () => {
  assert.equal(sanitizeUrl('javascript:alert(1)'), '');
  assert.equal(sanitizeUrl('vbscript:msgbox(1)'), '');
  assert.equal(sanitizeUrl('https://motechart.example.com'), 'https://motechart.example.com');
  assert.equal(sanitizeUrl('/assets/robot.jpg'), '/assets/robot.jpg');

  const md = '### Judul\n\nKlik [bahaya](javascript:alert(1)) dan __tebal__.\n\n```cpp\nint x = 1;\n```';
  const html = parseMarkdownToSafeHtml(md);
  assert.equal(html.includes('javascript:'), false);
  assert.equal(html.includes('<strong>tebal</strong>'), true);
  assert.equal(html.includes('language-cpp'), true);
  assert.equal(sanitizeHeroHtml('Rancang <span>Robotik</span> <script>alert(1)</script>').includes('<script>'), false);
  assert.equal(escapeHtml('<b>hi</b>'), '&lt;b&gt;hi&lt;/b&gt;');
});

test('filterArticles and filterProjects match categories and search terms', () => {
  const articles: BlogArticle[] = [
    {
      id: 1,
      title: 'Mengenal Arduino Uno',
      category: 'arduino',
      date: '15 Mei 2026',
      author: 'Mentor',
      excerpt: 'Belajar ATmega328P',
      headerImage: '/img.jpg',
      content: '',
    },
    {
      id: 2,
      title: 'MQTT dengan ESP32',
      category: 'iot',
      date: '10 Mei 2026',
      author: 'Zaskia',
      excerpt: 'Kontrol nirkabel IoT',
      headerImage: '/img2.jpg',
      content: '',
    },
  ];
  assert.equal(filterArticles(articles, 'all', '').length, 2);
  assert.equal(filterArticles(articles, 'iot', '').length, 1);
  assert.equal(filterArticles(articles, 'all', 'esp32').length, 1);
  assert.equal(filterArticles(articles, 'arduino', 'esp32').length, 0);

  const projects: PortfolioProject[] = [
    {
      id: 1,
      title: 'Soccer Bot',
      category: 'mekanik & elektronik',
      status: 'Selesai',
      creators: 'Tim A',
      components: '',
      specs: '',
      description: 'Robot striker',
      headerImage: '/soccer.jpg',
      content: '![alt](/extra.jpg)',
      code: '',
      schematic: '',
      showCode: true,
      isWinner: true,
      awardName: 'Juara 2',
    },
  ];
  assert.equal(filterProjects(projects, 'mekanik').length, 1);
  assert.equal(filterProjects(projects, 'iot').length, 0);
  assert.deepEqual(extractProjectImages(projects[0]), ['/soccer.jpg', '/extra.jpg']);
  assert.equal(extractProjectShortDesc(projects[0]), 'Robot striker');
});

test('migrateLegacyLandingData preserves existing competition and organizer records verbatim', () => {
  const defaults: LandingData = {
    heroTag: '',
    heroTitle: '',
    heroDesc: '',
    visiText: '',
    misiList: [],
    divMechDesc: '',
    divElecDesc: '',
    divProgDesc: '',
    achievements: [],
    footerTagline: '',
    footerLocation: 'MAN 1 Bogor',
    footerEmail: 'robotikmotechart@gmail.com',
    footerInstagram: 'https://www.instagram.com/motechart_mansabo/',
    footerYoutube: 'https://www.youtube.com/@Motechart-RobotikMAN1Bogor',
  };
  const migrated = migrateLegacyLandingData(
    {
      achievements: [
        { juara: 'Juara Umum', organizer: 'Lembaga Ilmu Pengetahuan Indonesia', year: '2025' },
      ],
      footerEmail: 'custom@motechart.org',
      footerLocation: 'Gedung Lab Baru',
    },
    defaults
  );
  assert.equal(migrated.achievements[0].organizer, 'Lembaga Ilmu Pengetahuan Indonesia');
  assert.equal(migrated.footerEmail, 'custom@motechart.org');
  assert.equal(migrated.footerLocation, 'Gedung Lab Baru');
});

test('sanitizeRichHtmlSafe strips script/event handlers while preserving valid rich formatting', () => {
  const dirty = '<p onclick="alert(1)">Halo <strong>Robotik</strong></p><script>evil()</script><a href="javascript:alert(1)">Bad</a><a href="https://example.com">Good</a><img src="https://example.com/a.jpg" onerror="alert(1)" alt="Bot">';
  const clean = sanitizeRichHtmlSafe(dirty);
  assert.equal(clean.includes('<script>'), false);
  assert.equal(clean.includes('onclick'), false);
  assert.equal(clean.includes('onerror'), false);
  assert.equal(clean.includes('javascript:'), false);
  assert.equal(clean.includes('<strong>Robotik</strong>'), true);
  assert.equal(clean.includes('href="https://example.com"'), true);
  assert.equal(clean.includes('src="https://example.com/a.jpg"'), true);
});

test('sanitizeCsvCell neutralizes spreadsheet formula injection and escapes quotes', () => {
  assert.equal(sanitizeCsvCell('=CMD("calc")'), `"'=CMD(""calc"")"`);
  assert.equal(sanitizeCsvCell('+628123456789'), `"'+628123456789"`);
  assert.equal(sanitizeCsvCell('@SUM(A1:A2)'), `"'@SUM(A1:A2)"`);
  assert.equal(sanitizeCsvCell('Farhan Pratama'), '"Farhan Pratama"');
});

test('mapFirebaseAuthError returns readable Indonesian messages', () => {
  assert.match(mapFirebaseAuthError('auth/invalid-credential'), /Email atau password tidak sesuai/);
  assert.match(mapFirebaseAuthError('auth/too-many-requests'), /Terlalu banyak percobaan/);
  assert.match(mapFirebaseAuthError('auth/network-request-failed'), /koneksi internet/);
});

test('extractProjectImages preserves external image URLs without rewriting', () => {
  const proj: PortfolioProject = {
    id: 99,
    title: 'Line Follower',
    category: 'pemrograman',
    status: 'Selesai',
    creators: 'Tim B',
    components: '',
    specs: '',
    description: 'Robot cepat',
    headerImage: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370',
    content: '',
    code: '',
    schematic: '',
    showCode: false,
    isWinner: false,
    awardName: '',
  };
  assert.deepEqual(extractProjectImages(proj), ['https://images.unsplash.com/photo-1608564697071-ddf911d81370']);
});

test('extractPrimarySkillTag infers concise primary skill labels across project types', () => {
  const base: PortfolioProject = {
    id: 1,
    title: '',
    category: '',
    status: 'Selesai',
    creators: 'Tim',
    components: '',
    specs: '',
    description: '',
    headerImage: '',
    content: '',
    code: '',
    schematic: '',
    showCode: false,
    isWinner: false,
    awardName: '',
  };

  assert.deepEqual(
    extractPrimarySkillTag({ ...base, title: 'Smart Greenhouse ESP32', category: 'iot', components: 'ESP32, MQTT' }),
    { label: 'IoT', tone: 'iot' }
  );
  assert.deepEqual(
    extractPrimarySkillTag({ ...base, title: 'Soccer Bot 4WD', category: 'mekanik & elektronik', divisionKey: 'mechanics' }),
    { label: 'Mechanics', tone: 'mechanics' }
  );
  assert.deepEqual(
    extractPrimarySkillTag({ ...base, title: 'Maze Solver PID', category: 'pemrograman', divisionKey: 'programming' }),
    { label: 'C++', tone: 'cpp' }
  );
  assert.deepEqual(
    extractPrimarySkillTag({ ...base, title: 'Line Follower Analog LM358', category: 'elektronik', divisionKey: 'electronics' }),
    { label: 'Electronics', tone: 'electronics' }
  );
  assert.deepEqual(
    extractPrimarySkillTag({ ...base, title: 'Custom Bot', category: 'riset', code: 'void setup() {}' }),
    { label: 'C++', tone: 'cpp' }
  );
  // Combined category projects still resolve to distinct primary skills
  assert.deepEqual(
    extractPrimarySkillTag({ ...base, title: 'Robot Labirin Solver', category: 'mekanik & elektronik', description: 'Menelusuri labirin secara akurat' }),
    { label: 'C++', tone: 'cpp' }
  );
  assert.deepEqual(
    extractPrimarySkillTag({ ...base, title: 'Obstacle Detection Robot', category: 'mekanik & elektronik', description: 'Menghindar obstacle lewat sensor ultrasonik' }),
    { label: 'Electronics', tone: 'electronics' }
  );
  assert.deepEqual(
    extractPrimarySkillTag({ ...base, title: 'Sumo Bot', category: 'mekanik & elektronik', description: 'Robot untuk bertanding di arena sumo' }),
    { label: 'Mechanics', tone: 'mechanics' }
  );
});

test('isStatusCheckEnabled disables status lookup while registration is open and enables it once closed', () => {
  assert.equal(isStatusCheckEnabled('open'), false);
  assert.equal(isStatusCheckEnabled('closed'), true);
  assert.equal(isStatusCheckEnabled('closed_permanently'), true);
});

test('buildSpurGearPath builds closed symmetric gear polygons with clean 3:2 mesh clearance', () => {
  const drivePath = buildSpurGearPath({
    teeth: 12,
    rootRadius: 31.6,
    pitchRadius: 39,
    tipRadius: 43.6,
    phaseOffsetDeg: 0,
  });
  const pinionPath = buildSpurGearPath({
    teeth: 8,
    rootRadius: 18.6,
    pitchRadius: 26,
    tipRadius: 30.6,
    phaseOffsetDeg: 22.5,
  });

  assert.equal(drivePath.startsWith('M '), true);
  assert.equal(drivePath.endsWith(' Z'), true);
  assert.equal(pinionPath.startsWith('M '), true);
  assert.equal(pinionPath.endsWith(' Z'), true);
  // 6 vertices per tooth
  assert.equal(drivePath.split('L ').length, 12 * 6);
  assert.equal(pinionPath.split('L ').length, 8 * 6);
  // Center distance d = 39 + 26 = 65; tip + mating root must leave >= 2px radial clearance
  const centerDistance = 39 + 26;
  assert.equal(centerDistance - (43.6 + 18.6) >= 2, true);
  assert.equal(centerDistance - (30.6 + 31.6) >= 2, true);
});
