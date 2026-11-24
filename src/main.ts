import './styles/main.css';
import { getBrandLogoSvg } from './lib/brand';
import { LEARNING_TRACK } from './lib/content';
import {
  escapeHtml,
  extractPrimarySkillTag,
  extractProjectShortDesc,
  filterArticles,
  filterProjects,
  sanitizeHeroHtml,
  sanitizeUrl,
} from './lib/logic';
import { resolveMediaAsset } from './lib/media';
import { appState, initOptionalCloudSync } from './lib/store';
import type { DivisionKey } from './lib/types';
import { renderDivisionWorkbench, selectDivision } from './components/divisions';
import { initHeroBlueprintWorkbench } from './components/heroBlueprint';
import { openArticleModal, openProjectModal } from './components/modals';
import {
  initRegistrationModule,
  renderCustomQuestions,
  updateRegistrationAvailabilityUI,
} from './components/registration';

type ViewId = 'view-home' | 'view-blog' | 'view-portfolio' | 'view-pendaftaran';

let activeView: ViewId = 'view-home';
let blogCategory = 'all';
let blogSearch = '';
let portfolioCategory = 'all';
let revealObserver: IntersectionObserver | null = null;
let featuredBentoRevealed = false;

function initScrollReveal(): void {
  if (typeof window === 'undefined') return;
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll<HTMLElement>('.reveal-on-scroll').forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  document.documentElement.classList.add('js-scroll-reveal');

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          el.classList.add('is-revealed');
          if (el.closest('#home-featured-projects')) {
            featuredBentoRevealed = true;
          }
          observer.unobserve(el);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -36px 0px',
      }
    );
  }

  observeRevealElements(document);
}

function observeRevealElements(root: ParentNode = document): void {
  const targets = root.querySelectorAll<HTMLElement>('.reveal-on-scroll:not(.is-revealed)');
  if (!targets.length) return;

  if (!revealObserver) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  targets.forEach((el) => {
    const rect = el.getBoundingClientRect();
    // If element is already above or well inside the current viewport (e.g., after live cloud re-render), reveal cleanly
    if (rect.height > 0 && rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      el.classList.add('is-revealed');
      if (el.closest('#home-featured-projects')) {
        featuredBentoRevealed = true;
      }
      return;
    }
    revealObserver?.observe(el);
  });
}

function setMobileMenuOpen(open: boolean): void {
  const drawer = document.getElementById('mobile-nav-drawer');
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  if (!drawer || !toggleBtn) return;
  drawer.classList.toggle('hidden', !open);
  toggleBtn.setAttribute('aria-expanded', String(open));
}

export function navigateTo(target: ViewId, options?: { scrollTop?: boolean; updateHash?: boolean }): void {
  const scrollTop = options?.scrollTop !== false;
  const updateHash = options?.updateHash !== false;

  activeView = target;
  setMobileMenuOpen(false);

  document.querySelectorAll<HTMLElement>('[data-view]').forEach((section) => {
    section.classList.toggle('hidden', section.id !== target);
  });

  document.querySelectorAll<HTMLAnchorElement>('[data-nav-target]').forEach((link) => {
    const isCurrent = link.dataset.navTarget === target;
    link.classList.toggle('is-active', isCurrent);
    if (isCurrent) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  if (updateHash) {
    const slug = target.replace('view-', '');
    if (window.location.hash !== `#${slug}`) {
      window.history.pushState(null, '', `#${slug}`);
    }
  }

  if (scrollTop) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (target === 'view-home') {
    requestAnimationFrame(() => observeRevealElements(document));
  }
}

function renderBrandMarks(): void {
  const hdrLogo = document.getElementById('header-brand-logo');
  if (hdrLogo) hdrLogo.innerHTML = getBrandLogoSvg(32, 'header');
  const ftrLogo = document.getElementById('footer-brand-logo');
  if (ftrLogo) ftrLogo.innerHTML = getBrandLogoSvg(30, 'footer');
}

function initHeroAmbientSpotlight(): void {
  const stage = document.getElementById('hero-stage');
  if (!stage) return;
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
  if (prefersReduced || isCoarsePointer) return;

  let rafId = 0;
  let lastX = 0;
  let lastY = 0;

  stage.addEventListener('pointermove', (e) => {
    const rect = stage.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      stage.style.setProperty('--mx', `${Math.round(lastX)}px`);
      stage.style.setProperty('--my', `${Math.round(lastY)}px`);
      stage.classList.add('has-pointer');
    });
  });

  stage.addEventListener('pointerleave', () => {
    stage.classList.remove('has-pointer');
  });
}

function animateProofCount(el: HTMLElement | null, target: number): void {
  if (!el) return;
  const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(2, '0');
  const prevTarget = Number(el.dataset.countTarget ?? '-1');
  if (prevTarget === target) return;
  el.dataset.countTarget = String(target);

  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    el.textContent = pad(target);
    return;
  }

  const from = prevTarget >= 0 ? prevTarget : 0;
  const duration = 420;
  const start = performance.now();

  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = pad(from + (target - from) * eased);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      el.textContent = pad(target);
    }
  };

  window.requestAnimationFrame(step);
}

function updateHomeProofStats(): void {
  animateProofCount(document.getElementById('stat-projects-count'), appState.portfolioProjects.length);
  animateProofCount(document.getElementById('stat-achievements-count'), (appState.landingData.achievements || []).length);
  animateProofCount(document.getElementById('stat-articles-count'), appState.blogArticles.length);
}

function renderHomeLandingContent(): void {
  const data = appState.landingData;

  const setTxt = (id: string, val: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt('home-hero-kicker', data.heroTag);
  const heroTitleEl = document.getElementById('home-hero-title');
  if (heroTitleEl) {
    heroTitleEl.innerHTML = sanitizeHeroHtml(data.heroTitle);
  }
  setTxt('home-hero-desc', data.heroDesc);
  setTxt('home-visi-text', data.visiText);

  const misiListEl = document.getElementById('home-misi-list');
  if (misiListEl) {
    misiListEl.innerHTML = (data.misiList || [])
      .map(
        (item, idx) => `
        <li class="flex items-start gap-3.5 text-sm sm:text-base text-slate-300 leading-relaxed">
          <span class="font-mono text-xs font-semibold text-amber-300 mt-1 tabular-nums shrink-0">0${idx + 1}.</span>
          <span>${escapeHtml(item)}</span>
        </li>
      `
      )
      .join('');
  }

  // Learning Track (Fixed non-overlapping connectors + reveal-on-scroll)
  const trackEl = document.getElementById('home-learning-track');
  if (trackEl) {
    trackEl.innerHTML = LEARNING_TRACK.map((step, idx) => {
      const hasNext = idx < LEARNING_TRACK.length - 1;
      const delayClass = `reveal-delay-${Math.min(idx + 1, 3)}`;
      return `
        <div class="reveal-on-scroll ${delayClass} flex flex-col gap-4">
          <div class="flex items-center gap-3.5">
            <span class="roadmap-node-badge inline-flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/35 bg-[#111827] font-mono text-sm font-bold text-amber-300 tabular-nums shadow-lg shrink-0">
              0${idx + 1}
            </span>
            <span class="font-mono text-xs font-medium text-cyan-300 tabular-nums whitespace-nowrap shrink-0">${escapeHtml(step.phase)}</span>
            ${hasNext ? `<span class="roadmap-connector hidden md:block flex-1" aria-hidden="true"></span>` : ''}
          </div>
          <div class="interactive-card flex-1 rounded-xl border border-white/8 bg-[#111827] p-6 space-y-2.5">
            <h3 class="font-display text-lg font-semibold text-white leading-snug">${escapeHtml(step.title)}</h3>
            <p class="text-sm text-slate-300 leading-relaxed">${escapeHtml(step.detail)}</p>
          </div>
        </div>
      `;
    }).join('');
    observeRevealElements(trackEl);
  }

  // Achievements honor roll (adapts grid columns cleanly for 1, 2, 3, or 4+ items)
  const achEl = document.getElementById('home-achievements-grid');
  if (achEl) {
    const list = data.achievements || [];
    if (list.length === 0) {
      achEl.className = 'grid grid-cols-1 gap-5';
      achEl.innerHTML = `<div class="rounded-xl border border-white/8 bg-[#111827] p-8 text-center text-sm text-slate-400">Belum ada data prestasi yang ditampilkan.</div>`;
    } else {
      const colClass =
        list.length === 1
          ? 'grid grid-cols-1 max-w-xl gap-5'
          : list.length === 2
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-5'
            : list.length === 3
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5';
      achEl.className = colClass;

      achEl.innerHTML = list
        .map((ach, idx) => {
          const delayClass = `reveal-delay-${(idx % 4) + 1}`;
          return `
          <article class="reveal-on-scroll ${delayClass} interactive-card rounded-xl border border-white/8 bg-[#111827] p-6 flex flex-col justify-between gap-4">
            <div class="text-xs text-slate-400 flex items-center justify-between gap-2">
              <span class="font-mono text-amber-300 font-semibold tabular-nums">${escapeHtml(ach.year)}</span>
              <span class="font-mono text-[11px] text-slate-500 tabular-nums">#${String(idx + 1).padStart(2, '0')}</span>
            </div>
            <div>
              <h3 class="font-display text-lg font-semibold text-white leading-snug">${escapeHtml(ach.juara)}</h3>
              <p class="mt-1.5 text-sm text-slate-400">${escapeHtml(ach.organizer)}</p>
              ${ach.level ? `<p class="mt-2 font-mono text-[11px] text-cyan-300">${escapeHtml(ach.level)}</p>` : ''}
            </div>
          </article>
        `;
        })
        .join('');
      observeRevealElements(achEl);
    }
  }

  // Footer info (preserved verbatim from Firestore)
  setTxt('footer-tagline', data.footerTagline);
  setTxt('footer-location', data.footerLocation);
  setTxt('footer-email', data.footerEmail);
  const emailLink = document.getElementById('footer-email-link') as HTMLAnchorElement | null;
  if (emailLink) emailLink.href = `mailto:${data.footerEmail}`;
  const instaLink = document.getElementById('footer-instagram') as HTMLAnchorElement | null;
  if (instaLink) instaLink.href = sanitizeUrl(data.footerInstagram) || 'https://www.instagram.com/motechart_mansabo/';
  const ytLink = document.getElementById('footer-youtube') as HTMLAnchorElement | null;
  if (ytLink) ytLink.href = sanitizeUrl(data.footerYoutube) || 'https://www.youtube.com/@Motechart-RobotikMAN1Bogor';

  updateHomeProofStats();

  renderDivisionWorkbench((category) => {
    portfolioCategory = category;
    renderPortfolioGrid();
    updatePortfolioFilterButtons();
    navigateTo('view-portfolio');
  });
}

function renderHomeFeaturedProjects(): void {
  const container = document.getElementById('home-featured-projects');
  if (!container) return;

  const featured = appState.portfolioProjects.slice(0, 3);
  if (featured.length === 0) {
    container.innerHTML = `<div class="lg:col-span-12 rounded-xl border border-white/8 bg-[#111827] p-8 text-center text-sm text-slate-400">Belum ada proyek portofolio yang dipublikasikan.</div>`;
    return;
  }

  container.innerHTML = featured
    .map((proj, idx) => {
      const imgUrl = resolveMediaAsset(proj.headerImage, idx === 0 ? 'soccerBot' : idx === 1 ? 'smartAgri' : 'mazeSolver');
      const skillTag = extractPrimarySkillTag(proj);
      const delayClass = `reveal-delay-${Math.min(idx + 1, 3)}`;
      const revealStateClass = featuredBentoRevealed ? 'reveal-on-scroll is-revealed' : `reveal-on-scroll ${delayClass}`;
      const colSpanClass =
        featured.length === 1
          ? 'lg:col-span-12'
          : featured.length === 2
            ? 'lg:col-span-6'
            : idx === 0
              ? 'lg:col-span-7'
              : idx === 1
                ? 'lg:col-span-5'
                : 'lg:col-span-12';
      const isHorizontal = featured.length === 1 || (featured.length === 3 && idx === 2);

      return `
        <article class="${colSpanClass} ${revealStateClass} rounded-xl border border-white/8 bg-[#111827] overflow-hidden flex flex-col justify-between transition-colors hover:border-amber-400/35">
          <button
            type="button"
            data-open-project="${escapeHtml(String(proj.id))}"
            aria-label="Lihat detail proyek ${escapeHtml(proj.title)}"
            class="group text-left ${isHorizontal ? 'grid grid-cols-1 lg:grid-cols-12 items-stretch' : 'flex flex-col h-full'} w-full cursor-pointer"
          >
            <div class="relative ${isHorizontal ? 'aspect-[16/10] lg:aspect-auto lg:h-full lg:max-h-[320px] lg:col-span-5' : 'aspect-[16/10] w-full'} overflow-hidden bg-slate-900">
              <span
                class="skill-quick-tag skill-quick-tag--${skillTag.tone}"
                data-skill-tag="${escapeHtml(skillTag.label)}"
                aria-label="Keahlian utama: ${escapeHtml(skillTag.label)}"
              >${escapeHtml(skillTag.label)}</span>
              <img
                src="${escapeHtml(imgUrl)}"
                alt="${escapeHtml(proj.title)}"
                loading="lazy"
                referrerpolicy="no-referrer"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/25 to-transparent"></div>
            </div>
            <div class="${isHorizontal ? 'p-6 sm:p-8 lg:col-span-7' : 'p-6 flex-1'} flex flex-col justify-between gap-4">
              <div>
                <p class="text-xs text-slate-400 mb-2">
                  <span class="${proj.status === 'Selesai' ? 'text-emerald-300' : 'text-amber-300'} font-medium">${escapeHtml(proj.status)}</span>
                  <span aria-hidden="true" class="mx-1.5">·</span>
                  <span>${escapeHtml(proj.category)}</span>
                  ${proj.isWinner && proj.awardName ? `<span aria-hidden="true" class="mx-1.5">·</span><span class="text-amber-300">${escapeHtml(proj.awardName)}</span>` : ''}
                </p>
                <h3 class="font-display text-xl font-semibold text-white group-hover:text-amber-300 transition-colors leading-snug">
                  ${escapeHtml(proj.title)}
                </h3>
                <p class="mt-2 text-sm text-slate-300 leading-relaxed">${escapeHtml(extractProjectShortDesc(proj))}</p>
              </div>
              <div class="flex items-center justify-between pt-4 border-t border-white/8 text-xs text-slate-400">
                <span class="truncate pr-3">${escapeHtml(proj.creators)}</span>
                <span class="text-amber-300 font-medium whitespace-nowrap shrink-0">Lihat Detail &rarr;</span>
              </div>
            </div>
          </button>
        </article>
      `;
    })
    .join('');

  observeRevealElements(container);
  updateHomeProofStats();
}

function renderBlogGrid(): void {
  const container = document.getElementById('blog-grid');
  const countEl = document.getElementById('blog-results-count');
  if (!container) return;

  const filtered = filterArticles(appState.blogArticles, blogCategory, blogSearch);
  if (countEl) {
    countEl.textContent = `Menampilkan ${filtered.length} dari ${appState.blogArticles.length} artikel`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full rounded-xl border border-white/8 bg-[#111827] p-10 text-center space-y-3">
        <h3 class="font-display text-lg font-semibold text-white">Artikel tidak ditemukan</h3>
        <p class="text-sm text-slate-400 max-w-md mx-auto">Tidak ada artikel yang cocok dengan pencarianmu. Reset filter untuk menampilkan semua materi.</p>
        <button type="button" id="btn-reset-blog-filters" class="mt-2 inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors cursor-pointer">
          Reset Pencarian
        </button>
      </div>
    `;
    document.getElementById('btn-reset-blog-filters')?.addEventListener('click', () => {
      blogCategory = 'all';
      blogSearch = '';
      const searchInp = document.getElementById('blog-search') as HTMLInputElement | null;
      if (searchInp) searchInp.value = '';
      updateBlogFilterButtons();
      renderBlogGrid();
    });
    return;
  }

  const categoryLabels: Record<string, string> = {
    arduino: 'Arduino',
    tutorial: 'Tutorial Perakitan',
    iot: 'IoT',
    kompetisi: 'Kompetisi',
  };

  container.innerHTML = filtered
    .map((article, idx) => {
      const imgUrl = resolveMediaAsset(
        article.headerImage,
        idx % 2 === 0 ? 'arduinoWorkshop' : 'smartAgri'
      );
      const catLabel = categoryLabels[article.category] || article.category;
      return `
        <article class="rounded-xl border border-white/8 bg-[#111827] overflow-hidden flex flex-col justify-between transition-colors hover:border-white/20">
          <div class="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
            <img
              src="${escapeHtml(imgUrl)}"
              alt="${escapeHtml(article.title)}"
              loading="lazy"
              referrerpolicy="no-referrer"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="p-6 flex flex-col justify-between flex-1 gap-4">
            <div>
              <p class="text-xs text-slate-400 mb-2">
                <span class="text-amber-300 font-medium">${escapeHtml(catLabel)}</span>
                <span aria-hidden="true" class="mx-1.5">·</span>
                <span>${escapeHtml(article.date)}</span>
                ${article.readTime ? `<span aria-hidden="true" class="mx-1.5">·</span><span>${escapeHtml(article.readTime)}</span>` : ''}
              </p>
              <h3 class="font-display text-xl font-semibold text-white leading-snug">${escapeHtml(article.title)}</h3>
              <p class="mt-2.5 text-sm text-slate-300 leading-relaxed">${escapeHtml(article.excerpt)}</p>
            </div>
            <div class="pt-4 border-t border-white/8 flex items-center justify-between gap-3">
              <span class="text-xs text-slate-400 truncate">${escapeHtml(article.author)}</span>
              <button
                type="button"
                data-open-article="${escapeHtml(String(article.id))}"
                aria-label="Baca artikel ${escapeHtml(article.title)}"
                class="text-sm font-medium text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Baca Artikel &rarr;
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function updateBlogFilterButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-blog-category]').forEach((btn) => {
    const active = btn.dataset.blogCategory === blogCategory;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  });
}

function renderPortfolioGrid(): void {
  const container = document.getElementById('portfolio-grid');
  const countEl = document.getElementById('portfolio-results-count');
  if (!container) return;

  const filtered = filterProjects(appState.portfolioProjects, portfolioCategory);
  if (countEl) {
    countEl.textContent = `Menampilkan ${filtered.length} proyek siswa`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full rounded-xl border border-white/8 bg-[#111827] p-10 text-center space-y-3">
        <h3 class="font-display text-lg font-semibold text-white">Belum ada proyek pada kategori ini</h3>
        <button type="button" id="btn-reset-portfolio-filter" class="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors cursor-pointer">
          Tampilkan Semua Proyek
        </button>
      </div>
    `;
    document.getElementById('btn-reset-portfolio-filter')?.addEventListener('click', () => {
      portfolioCategory = 'all';
      updatePortfolioFilterButtons();
      renderPortfolioGrid();
    });
    return;
  }

  container.innerHTML = filtered
    .map((proj, idx) => {
      const imgUrl = resolveMediaAsset(
        proj.headerImage,
        idx % 3 === 0 ? 'soccerBot' : idx % 3 === 1 ? 'smartAgri' : 'mazeSolver'
      );
      return `
        <article class="rounded-xl border border-white/8 bg-[#111827] overflow-hidden flex flex-col justify-between transition-colors hover:border-white/20">
          <button
            type="button"
            data-open-project="${escapeHtml(String(proj.id))}"
            aria-label="Lihat detail proyek ${escapeHtml(proj.title)}"
            class="group text-left flex flex-col h-full w-full cursor-pointer"
          >
            <div class="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
              <img
                src="${escapeHtml(imgUrl)}"
                alt="${escapeHtml(proj.title)}"
                loading="lazy"
                referrerpolicy="no-referrer"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent"></div>
            </div>
            <div class="p-6 flex flex-col justify-between flex-1 gap-4">
              <div>
                <p class="text-xs text-slate-400 mb-2">
                  <span class="${proj.status === 'Selesai' ? 'text-emerald-300' : 'text-amber-300'} font-medium">${escapeHtml(proj.status)}</span>
                  <span aria-hidden="true" class="mx-1.5">·</span>
                  <span>${escapeHtml(proj.category)}</span>
                  ${proj.year ? `<span aria-hidden="true" class="mx-1.5">·</span><span class="font-mono tabular-nums">${escapeHtml(proj.year)}</span>` : ''}
                </p>
                <h3 class="font-display text-xl font-semibold text-white group-hover:text-amber-300 transition-colors leading-snug">
                  ${escapeHtml(proj.title)}
                </h3>
                ${
                  proj.isWinner && proj.awardName
                    ? `<p class="mt-1.5 text-xs font-medium text-amber-300">${escapeHtml(proj.awardName)}</p>`
                    : ''
                }
                <p class="mt-2 text-sm text-slate-300 leading-relaxed">${escapeHtml(extractProjectShortDesc(proj))}</p>
              </div>

              <div class="pt-4 border-t border-white/8 flex items-center justify-between gap-3 text-xs">
                <span class="text-slate-400 truncate">${escapeHtml(proj.creators)}</span>
                <span class="text-amber-300 font-medium whitespace-nowrap shrink-0">Detail &amp; Kode &rarr;</span>
              </div>
            </div>
          </button>
        </article>
      `;
    })
    .join('');
}

function updatePortfolioFilterButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-portfolio-category]').forEach((btn) => {
    const active = btn.dataset.portfolioCategory === portfolioCategory;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  });
}

function setupGlobalEventDelegation(): void {
  // Navigation clicks
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const navLink = target.closest<HTMLElement>('[data-nav-target]');
    if (navLink) {
      e.preventDefault();
      const dest = navLink.dataset.navTarget as ViewId;
      if (dest) navigateTo(dest);
      return;
    }

    const divLink = target.closest<HTMLElement>('[data-footer-div]');
    if (divLink) {
      e.preventDefault();
      const divKey = divLink.dataset.footerDiv as DivisionKey;
      navigateTo('view-home', { scrollTop: false });
      selectDivision(divKey, (cat) => {
        portfolioCategory = cat;
        renderPortfolioGrid();
        updatePortfolioFilterButtons();
        navigateTo('view-portfolio');
      });
      document.getElementById('section-divisions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const articleBtn = target.closest<HTMLElement>('[data-open-article]');
    if (articleBtn) {
      const id = articleBtn.dataset.openArticle;
      const art = appState.blogArticles.find((a) => String(a.id) === String(id));
      if (art) openArticleModal(art);
      return;
    }

    const projectBtn = target.closest<HTMLElement>('[data-open-project]');
    if (projectBtn) {
      const id = projectBtn.dataset.openProject;
      const proj = appState.portfolioProjects.find((p) => String(p.id) === String(id));
      if (proj) openProjectModal(proj);
    }
  });

  // Top bar CTA & Hero buttons
  document.getElementById('header-cta-daftar')?.addEventListener('click', () => navigateTo('view-pendaftaran'));
  document.getElementById('hero-btn-daftar')?.addEventListener('click', () => navigateTo('view-pendaftaran'));
  document.getElementById('hero-btn-galeri')?.addEventListener('click', () => navigateTo('view-portfolio'));
  document.getElementById('home-btn-all-projects')?.addEventListener('click', () => navigateTo('view-portfolio'));
  document.getElementById('cta-bottom-daftar')?.addEventListener('click', () => navigateTo('view-pendaftaran'));
  document.getElementById('cta-bottom-status')?.addEventListener('click', () => {
    navigateTo('view-pendaftaran', { scrollTop: false });
    setTimeout(() => {
      document.getElementById('status-checker-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  });

  // Mobile drawer toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  mobileToggle?.addEventListener('click', () => {
    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    setMobileMenuOpen(!isExpanded);
  });

  // Blog search & category tabs
  const blogSearchInput = document.getElementById('blog-search') as HTMLInputElement | null;
  blogSearchInput?.addEventListener('input', () => {
    blogSearch = blogSearchInput.value;
    renderBlogGrid();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-blog-category]').forEach((btn) => {
    btn.addEventListener('click', () => {
      blogCategory = btn.dataset.blogCategory || 'all';
      updateBlogFilterButtons();
      renderBlogGrid();
    });
  });

  // Portfolio category tabs
  document.querySelectorAll<HTMLButtonElement>('[data-portfolio-category]').forEach((btn) => {
    btn.addEventListener('click', () => {
      portfolioCategory = btn.dataset.portfolioCategory || 'all';
      updatePortfolioFilterButtons();
      renderPortfolioGrid();
    });
  });

  // Browser back/forward hash routing
  window.addEventListener('popstate', () => {
    syncViewFromHash();
  });
}

function syncViewFromHash(): void {
  const hash = window.location.hash.replace('#', '').trim();
  const map: Record<string, ViewId> = {
    home: 'view-home',
    blog: 'view-blog',
    portfolio: 'view-portfolio',
    pendaftaran: 'view-pendaftaran',
  };
  const target = map[hash] || 'view-home';
  navigateTo(target, { scrollTop: false, updateHash: false });
}

document.addEventListener('DOMContentLoaded', () => {
  renderBrandMarks();
  initHeroBlueprintWorkbench();
  initHeroAmbientSpotlight();
  renderHomeLandingContent();
  renderHomeFeaturedProjects();
  renderBlogGrid();
  renderPortfolioGrid();
  setupGlobalEventDelegation();
  initRegistrationModule(() => navigateTo('view-home'));
  syncViewFromHash();
  initScrollReveal();

  // Live non-blocking Firebase real-time sync (read-only on public site; falls back to local data if offline)
  void initOptionalCloudSync({
    onLandingChange: () => renderHomeLandingContent(),
    onSettingsChange: () => {
      renderCustomQuestions();
      updateRegistrationAvailabilityUI();
    },
    onBlogChange: () => {
      renderBlogGrid();
      updateHomeProofStats();
    },
    onPortfolioChange: () => {
      renderHomeFeaturedProjects();
      renderPortfolioGrid();
      updateHomeProofStats();
    },
  });
});

// Export current view helper for automated verification if needed
export function getActiveView(): ViewId {
  return activeView;
}
