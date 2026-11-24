import { getBrandLogoSvg } from '../lib/brand';
import {
  escapeHtml,
  extractProjectImages,
  extractProjectShortDesc,
  parseMarkdownToSafeHtml,
  sanitizeUrl,
} from '../lib/logic';
import { resolveMediaAsset } from '../lib/media';
import { showToast } from '../lib/store';
import type { Applicant, BlogArticle, PortfolioProject, RegistrationSettings } from '../lib/types';

function bindDialogBackdropClose(dialog: HTMLDialogElement): void {
  if (dialog.dataset.backdropBound === 'true') return;
  dialog.dataset.backdropBound = 'true';
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('overflow-hidden');
  });
}

async function copyTextWithFeedback(text: string, button: HTMLButtonElement, defaultLabel: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = 'Tersalin';
    showToast('Berhasil disalin ke clipboard.');
    setTimeout(() => {
      button.textContent = defaultLabel;
    }, 1800);
  } catch {
    showToast('Gagal menyalin otomatis. Silakan salin manual.', 'error');
  }
}

export function openArticleModal(article: BlogArticle): void {
  const dialog = document.getElementById('article-detail-dialog') as HTMLDialogElement | null;
  if (!dialog) return;
  bindDialogBackdropClose(dialog);

  const coverUrl = resolveMediaAsset(article.headerImage, 'arduinoWorkshop');
  const categoryLabels: Record<string, string> = {
    arduino: 'Arduino',
    tutorial: 'Tutorial Perakitan',
    iot: 'Internet of Things',
    kompetisi: 'Strategi Kompetisi',
  };
  const catLabel = categoryLabels[article.category] || article.category;

  dialog.innerHTML = `
    <div class="relative max-h-[90vh] overflow-y-auto bg-[#0D1320] text-slate-100">
      <div class="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/10 bg-[#0D1320]/95 px-6 py-4 backdrop-blur-md">
        <div class="text-xs text-slate-400 truncate">
          <span>${escapeHtml(catLabel)}</span>
          <span aria-hidden="true" class="mx-2">·</span>
          <span>${escapeHtml(article.date)}</span>
          ${article.readTime ? `<span aria-hidden="true" class="mx-2">·</span><span>${escapeHtml(article.readTime)}</span>` : ''}
        </div>
        <button
          type="button"
          data-close-dialog
          aria-label="Tutup artikel"
          class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white transition-colors shrink-0 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="relative aspect-[21/9] w-full overflow-hidden bg-slate-900">
        <img
          src="${escapeHtml(coverUrl)}"
          alt="${escapeHtml(article.title)}"
          referrerpolicy="no-referrer"
          class="h-full w-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#0D1320] via-[#0D1320]/55 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <h2 class="font-display text-2xl sm:text-3xl font-bold text-white leading-tight max-w-3xl text-balance">
            ${escapeHtml(article.title)}
          </h2>
          <p class="mt-2 text-sm text-slate-300">Ditulis oleh ${escapeHtml(article.author)}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
        <aside id="article-toc-aside" class="lg:col-span-4 hidden lg:block">
          <div class="sticky top-20 rounded-xl border border-white/8 bg-[#111827] p-5">
            <h3 class="text-xs font-semibold text-amber-300 mb-3">Daftar Isi</h3>
            <ul id="article-toc-list" class="space-y-2 text-sm"></ul>
          </div>
        </aside>

        <div class="lg:col-span-8">
          <div class="article-prose space-y-4 text-slate-300 leading-relaxed">
            ${parseMarkdownToSafeHtml(article.content)}
          </div>
        </div>
      </div>
    </div>
  `;

  // Populate interactive TOC
  const prose = dialog.querySelector('.article-prose');
  const tocAside = dialog.querySelector('#article-toc-aside') as HTMLElement | null;
  const tocList = dialog.querySelector('#article-toc-list');
  if (prose && tocList && tocAside) {
    const headings = prose.querySelectorAll('h2, h3');
    if (headings.length === 0) {
      tocAside.classList.add('!hidden');
    } else {
      headings.forEach((heading, idx) => {
        const headingId = `article-sec-${idx}`;
        heading.id = headingId;
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${headingId}`;
        link.textContent = heading.textContent || '';
        link.className = 'block text-slate-400 hover:text-amber-300 transition-colors leading-snug';
        link.addEventListener('click', (e) => {
          e.preventDefault();
          heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        li.appendChild(link);
        tocList.appendChild(li);
      });
    }
  }

  // Bind code block copy buttons
  dialog.querySelectorAll<HTMLButtonElement>('[data-copy-code]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const codeEl = btn.closest('.md-code-block')?.querySelector('code');
      if (codeEl) {
        copyTextWithFeedback(codeEl.textContent || '', btn, 'Salin Kode');
      }
    });
  });

  dialog.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
  document.body.classList.add('overflow-hidden');
  dialog.setAttribute('tabindex', '-1');
  dialog.showModal();
  dialog.focus({ preventScroll: true });
}

export function openProjectModal(project: PortfolioProject): void {
  const dialog = document.getElementById('project-detail-dialog') as HTMLDialogElement | null;
  if (!dialog) return;
  bindDialogBackdropClose(dialog);

  const fallbackImg = resolveMediaAsset(project.headerImage, 'soccerBot');
  const gallery = extractProjectImages(project);
  const images = gallery.length > 0 ? gallery : [fallbackImg];
  let currentSlide = 0;

  const componentList = (project.components || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const hasCode = Boolean(project.showCode && project.code && project.code.trim().length >= 15);

  dialog.innerHTML = `
    <div class="relative max-h-[90vh] overflow-y-auto bg-[#0D1320] text-slate-100">
      <div class="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/10 bg-[#0D1320]/95 px-6 py-4 backdrop-blur-md">
        <div class="text-xs text-slate-400 truncate">
          <span class="${project.status === 'Selesai' ? 'text-emerald-300' : 'text-amber-300'} font-medium">${escapeHtml(project.status)}</span>
          <span aria-hidden="true" class="mx-2">·</span>
          <span>${escapeHtml(project.category)}</span>
          ${project.year ? `<span aria-hidden="true" class="mx-2">·</span><span class="font-mono tabular-nums">${escapeHtml(project.year)}</span>` : ''}
        </div>
        <button
          type="button"
          data-close-dialog
          aria-label="Tutup detail proyek"
          class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white transition-colors shrink-0 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 items-start">
        <div class="lg:col-span-5 space-y-4">
          <div class="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900">
            <img
              id="project-modal-image"
              src="${escapeHtml(images[0])}"
              alt="${escapeHtml(project.title)}"
              referrerpolicy="no-referrer"
              class="h-full w-full object-cover"
            />
            ${
              images.length > 1
                ? `
                  <button type="button" id="proj-prev-img" aria-label="Foto sebelumnya" class="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg bg-slate-950/80 border border-white/15 text-white flex items-center justify-center hover:bg-slate-900 cursor-pointer">&lsaquo;</button>
                  <button type="button" id="proj-next-img" aria-label="Foto berikutnya" class="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg bg-slate-950/80 border border-white/15 text-white flex items-center justify-center hover:bg-slate-900 cursor-pointer">&rsaquo;</button>
                `
                : ''
            }
          </div>

          <div class="rounded-xl border border-white/8 bg-[#111827] p-4 space-y-2.5 text-sm">
            <div>
              <span class="text-xs text-slate-400 block">Tim Pengembang</span>
              <span class="text-slate-100 font-medium">${escapeHtml(project.creators)}</span>
            </div>
            <div class="pt-2.5 border-t border-white/8">
              <span class="text-xs text-slate-400 block">Ringkasan Spesifikasi</span>
              <span class="text-slate-200 leading-relaxed">${escapeHtml(project.specs || extractProjectShortDesc(project))}</span>
            </div>
            ${
              project.isWinner && project.awardName
                ? `
                  <div class="pt-2.5 border-t border-white/8">
                    <span class="text-xs text-amber-300 block font-medium">Penghargaan Kompetisi</span>
                    <span class="text-white font-semibold">${escapeHtml(project.awardName)}</span>
                  </div>
                `
                : ''
            }
          </div>
        </div>

        <div class="lg:col-span-7 flex flex-col gap-5">
          <div>
            <h2 class="font-display text-2xl sm:text-3xl font-bold text-white leading-tight text-balance">
              ${escapeHtml(project.title)}
            </h2>
            <p class="mt-2 text-sm text-slate-300 leading-relaxed">${escapeHtml(extractProjectShortDesc(project))}</p>
          </div>

          <div role="tablist" aria-label="Detail Teknis Proyek" class="flex flex-wrap gap-1.5 rounded-lg bg-white/5 p-1 border border-white/8">
            <button type="button" role="tab" aria-selected="true" data-proj-tab="overview" class="proj-tab-btn is-active px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer">
              Ringkasan & Arsitektur
            </button>
            <button type="button" role="tab" aria-selected="false" data-proj-tab="hardware" class="proj-tab-btn px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer">
              Komponen & Pinout
            </button>
            ${
              hasCode
                ? `
                  <button type="button" role="tab" aria-selected="false" data-proj-tab="code" class="proj-tab-btn px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer">
                    Kode Program
                  </button>
                `
                : ''
            }
          </div>

          <div data-proj-panel="overview" class="article-prose space-y-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            ${parseMarkdownToSafeHtml(project.content || project.description)}
          </div>

          <div data-proj-panel="hardware" class="hidden space-y-5">
            <div>
              <h3 class="text-sm font-semibold text-white mb-2.5">Daftar Komponen Utama</h3>
              <ul class="space-y-2">
                ${
                  componentList.length > 0
                    ? componentList
                        .map(
                          (item) => `
                          <li class="flex items-start gap-2.5 text-sm text-slate-300">
                            <span class="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" aria-hidden="true"></span>
                            <span>${escapeHtml(item)}</span>
                          </li>
                        `
                        )
                        .join('')
                    : `<li class="text-sm text-slate-400">Daftar komponen belum dirinci.</li>`
                }
              </ul>
            </div>
            <div class="rounded-xl border border-white/8 bg-[#111827] p-5 article-prose text-sm text-slate-300">
              ${parseMarkdownToSafeHtml(project.schematic || 'Skematik pinout belum tersedia untuk proyek ini.')}
            </div>
          </div>

          ${
            hasCode
              ? `
                <div data-proj-panel="code" class="hidden">
                  <div class="rounded-xl border border-white/10 bg-[#070B12] overflow-hidden">
                    <div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
                      <span class="font-mono text-xs text-cyan-300">firmware_sketch.ino</span>
                      <button
                        type="button"
                        id="btn-copy-project-code"
                        class="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Salin Kode
                      </button>
                    </div>
                    <pre class="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-200 max-h-[380px]"><code>${escapeHtml(project.code)}</code></pre>
                  </div>
                </div>
              `
              : ''
          }
        </div>
      </div>
    </div>
  `;

  // Wire tab switching
  const tabBtns = dialog.querySelectorAll<HTMLButtonElement>('[data-proj-tab]');
  const tabPanels = dialog.querySelectorAll<HTMLElement>('[data-proj-panel]');
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.projTab;
      tabBtns.forEach((b) => {
        const active = b.dataset.projTab === target;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      tabPanels.forEach((panel) => {
        panel.classList.toggle('hidden', panel.dataset.projPanel !== target);
      });
    });
  });

  // Wire image gallery arrows if multiple
  if (images.length > 1) {
    const imgEl = dialog.querySelector<HTMLImageElement>('#project-modal-image');
    const updateImg = (nextIdx: number) => {
      currentSlide = (nextIdx + images.length) % images.length;
      if (imgEl) imgEl.src = images[currentSlide];
    };
    dialog.querySelector('#proj-prev-img')?.addEventListener('click', () => updateImg(currentSlide - 1));
    dialog.querySelector('#proj-next-img')?.addEventListener('click', () => updateImg(currentSlide + 1));
  }

  // Wire code copy button
  const copyBtn = dialog.querySelector<HTMLButtonElement>('#btn-copy-project-code');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      copyTextWithFeedback(project.code, copyBtn, 'Salin Kode');
    });
  }

  dialog.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
  document.body.classList.add('overflow-hidden');
  dialog.setAttribute('tabindex', '-1');
  dialog.showModal();
  dialog.focus({ preventScroll: true });
}

export function renderDigitalMemberCardHtml(applicant: Pick<Applicant, 'nama' | 'kelas' | 'id' | 'divisi'>): string {
  return `
    <div class="mx-auto max-w-md rounded-2xl border border-amber-400/35 bg-gradient-to-br from-[#131C2E] via-[#0E1525] to-[#090D16] p-6 text-left shadow-2xl">
      <div class="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
        <div class="flex items-center gap-2.5">
          ${getBrandLogoSvg(28, 'card')}
          <div>
            <p class="font-display text-sm font-bold tracking-tight text-white">Motechart Robotik</p>
            <p class="text-[11px] text-amber-300">Kartu Anggota Resmi · MAN 1 Bogor</p>
          </div>
        </div>
        <span class="font-mono text-xs text-emerald-300">AKTIF</span>
      </div>

      <div class="space-y-3">
        <div>
          <p class="text-xs text-slate-400">Nama Anggota</p>
          <p class="font-display text-lg font-semibold text-white">${escapeHtml(applicant.nama)}</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-slate-400">Tingkat Kelas</p>
            <p class="text-sm font-medium text-slate-100">Kelas ${escapeHtml(applicant.kelas)}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400">Divisi Minat</p>
            <p class="text-sm font-medium text-slate-100">${escapeHtml(applicant.divisi || 'Robotika Umum')}</p>
          </div>
        </div>
      </div>

      <div class="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
        <div>
          <p class="text-[11px] text-slate-400">Nomor Registrasi</p>
          <p class="font-mono text-sm font-semibold text-cyan-300 tabular-nums">${escapeHtml(applicant.id)}</p>
        </div>
        <svg width="110" height="26" viewBox="0 0 110 26" aria-hidden="true" class="opacity-80">
          <rect x="0" y="3" width="2" height="20" fill="#22D3EE" />
          <rect x="4" y="3" width="1" height="20" fill="#22D3EE" />
          <rect x="8" y="3" width="3" height="20" fill="#22D3EE" />
          <rect x="14" y="3" width="1" height="20" fill="#22D3EE" />
          <rect x="18" y="3" width="2" height="20" fill="#22D3EE" />
          <rect x="23" y="3" width="4" height="20" fill="#22D3EE" />
          <rect x="30" y="3" width="1" height="20" fill="#22D3EE" />
          <rect x="34" y="3" width="3" height="20" fill="#22D3EE" />
          <rect x="40" y="3" width="2" height="20" fill="#22D3EE" />
          <rect x="45" y="3" width="1" height="20" fill="#22D3EE" />
          <rect x="49" y="3" width="4" height="20" fill="#22D3EE" />
          <rect x="56" y="3" width="2" height="20" fill="#22D3EE" />
          <rect x="61" y="3" width="1" height="20" fill="#22D3EE" />
          <rect x="65" y="3" width="3" height="20" fill="#22D3EE" />
          <rect x="71" y="3" width="2" height="20" fill="#22D3EE" />
          <rect x="76" y="3" width="4" height="20" fill="#22D3EE" />
          <rect x="83" y="3" width="1" height="20" fill="#22D3EE" />
          <rect x="87" y="3" width="3" height="20" fill="#22D3EE" />
          <rect x="93" y="3" width="2" height="20" fill="#22D3EE" />
          <rect x="98" y="3" width="4" height="20" fill="#22D3EE" />
          <rect x="105" y="3" width="2" height="20" fill="#22D3EE" />
        </svg>
      </div>
    </div>
  `;
}

export function openStatusModal(
  applicant: Applicant | null,
  queriedId: string,
  regSettings: RegistrationSettings
): void {
  const dialog = document.getElementById('status-result-dialog') as HTMLDialogElement | null;
  if (!dialog) return;
  bindDialogBackdropClose(dialog);

  let bodyHtml = '';

  if (!applicant) {
    bodyHtml = `
      <div class="text-center space-y-4">
        <p class="font-mono text-xs font-semibold text-rose-400 uppercase">Tidak Ditemukan</p>
        <h3 class="font-display text-2xl font-bold text-white">ID Pendaftaran Belum Terdaftar</h3>
        <p class="text-sm text-slate-300 leading-relaxed">
          Nomor <span class="font-mono text-white font-semibold">${escapeHtml(queriedId)}</span> belum ada di catatan kami. Cek lagi penulisan ID-mu atau hubungi pengurus lab.
        </p>
      </div>
    `;
  } else if (applicant.status === 'Pending') {
    const safeWa = sanitizeUrl(regSettings.waLink) || 'https://chat.whatsapp.com/mock-motechart-robotik';
    bodyHtml = `
      <div class="space-y-5">
        <div>
          <p class="font-mono text-xs font-semibold text-amber-300 uppercase">Menunggu Persetujuan</p>
          <h3 class="font-display text-2xl font-bold text-white mt-1">Datamu Sedang Dicek Pengurus</h3>
          <p class="text-sm text-slate-300 mt-2 leading-relaxed">
            Halo <strong class="text-white">${escapeHtml(applicant.nama)}</strong>, pendaftaranmu sudah masuk. Gabung ke grup WhatsApp untuk info seleksi dan wawancara singkat.
          </p>
        </div>

        <dl class="grid grid-cols-2 gap-4 rounded-xl border border-white/8 bg-[#111827] p-4 text-sm">
          <div>
            <dt class="text-xs text-slate-400">ID Pendaftaran</dt>
            <dd class="font-mono text-cyan-300 font-semibold mt-0.5 tabular-nums">${escapeHtml(applicant.id)}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-400">Tanggal Daftar</dt>
            <dd class="font-mono text-slate-100 mt-0.5 tabular-nums">${escapeHtml(applicant.tanggalDaftar || '-')}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-400">Tingkat Kelas</dt>
            <dd class="text-slate-100 mt-0.5">Kelas ${escapeHtml(applicant.kelas)}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-400">Divisi Pilihan</dt>
            <dd class="text-slate-100 mt-0.5">${escapeHtml(applicant.divisi || 'Robotika Umum')}</dd>
          </div>
        </dl>

        <a
          href="${escapeHtml(safeWa)}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition-colors"
        >
          Masuk Grup WhatsApp Calon Anggota
        </a>
      </div>
    `;
  } else if (applicant.status === 'Diterima') {
    bodyHtml = `
      <div class="space-y-5 text-center">
        <div>
          <p class="font-mono text-xs font-semibold text-emerald-300 uppercase">Diterima Resmi</p>
          <h3 class="font-display text-2xl font-bold text-white mt-1">Kamu Resmi Bergabung!</h3>
          <p class="text-sm text-slate-300 mt-2 leading-relaxed">
            Pendaftaran <strong class="text-white">${escapeHtml(applicant.nama)}</strong> sudah disetujui. Simpan Kartu Anggota Digital ini untuk sesi latihan pertamamu.
          </p>
        </div>
        ${renderDigitalMemberCardHtml(applicant)}
      </div>
    `;
  } else {
    bodyHtml = `
      <div class="text-center space-y-4">
        <p class="font-mono text-xs font-semibold text-rose-400 uppercase">Belum Diterima</p>
        <h3 class="font-display text-2xl font-bold text-white">Belum Bisa Bergabung Periode Ini</h3>
        <p class="text-sm text-slate-300 leading-relaxed">
          Halo <strong class="text-white">${escapeHtml(applicant.nama)}</strong>, kuota lab gelombang ini sudah penuh. Kamu tetap bisa daftar lagi di pembukaan berikutnya.
        </p>
      </div>
    `;
  }

  dialog.innerHTML = `
    <div class="bg-[#0D1320] text-slate-100 p-6 sm:p-8">
      <div class="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <h2 class="font-display text-lg font-semibold text-white">Status Pendaftaran Anggota</h2>
        <button
          type="button"
          data-close-dialog
          aria-label="Tutup jendela status"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      ${bodyHtml}
    </div>
  `;

  dialog.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
  document.body.classList.add('overflow-hidden');
  dialog.setAttribute('tabindex', '-1');
  dialog.showModal();
  dialog.focus({ preventScroll: true });
}
