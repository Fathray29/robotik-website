import {
  computeCountdown,
  escapeHtml,
  generateRegistrationId,
  normalizePhoneNumber,
  normalizeRegistrationId,
  sanitizePlainText,
  sanitizeUrl,
  validateCustomQuestionAnswer,
  validateRegistrationField,
} from '../lib/logic';
import {
  appState,
  checkFormRateLimit,
  findApplicantById,
  recordFormSubmission,
  saveApplicantRecord,
  showToast,
} from '../lib/store';
import type { Applicant } from '../lib/types';
import { openStatusModal } from './modals';

const DRAFT_STORAGE_KEY = 'robotics_reg_draft_v2';
let currentStep = 1;
let countdownTimerId: number | null = null;
let lastSubmittedId = '';
let initialized = false;

function getFieldValue(id: string): string {
  const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  return el ? el.value : '';
}

function getCheckedRadioValue(name: string): string {
  const checked = document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  return checked ? checked.value : '';
}

function setFieldError(fieldId: string, message: string): void {
  const errorEl = document.getElementById(`err-${fieldId}`);
  const inputEl = document.getElementById(fieldId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.toggle('hidden', !message);
  }
  if (inputEl) {
    inputEl.setAttribute('aria-invalid', message ? 'true' : 'false');
    inputEl.classList.toggle('border-rose-500/70', Boolean(message));
  }
}

export function renderCustomQuestions(): void {
  const container = document.getElementById('custom-questions-container');
  if (!container) return;

  const questions = appState.regSettings.customQuestions || [];
  if (questions.length === 0) {
    container.innerHTML = '';
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  container.innerHTML = questions
    .map((q) => {
      const reqMark = q.required ? '<span class="text-rose-400" aria-hidden="true">*</span>' : '';
      let controlHtml = '';

      if (q.type === 'text') {
        controlHtml = `
          <input
            type="text"
            id="${escapeHtml(q.id)}"
            name="${escapeHtml(q.id)}"
            placeholder="Tulis jawabanmu di sini"
            class="field-input"
            ${q.required ? 'required' : ''}
          />
        `;
      } else if (q.type === 'select') {
        controlHtml = `
          <select id="${escapeHtml(q.id)}" name="${escapeHtml(q.id)}" class="field-input" ${q.required ? 'required' : ''}>
            <option value="">Pilih salah satu...</option>
            ${(q.options || [])
              .map((opt) => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`)
              .join('')}
          </select>
        `;
      } else if (q.type === 'radio') {
        controlHtml = `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
            ${(q.options || [])
              .map(
                (opt, idx) => `
                <label for="${escapeHtml(q.id)}-${idx}" class="radio-card">
                  <input type="radio" id="${escapeHtml(q.id)}-${idx}" name="${escapeHtml(q.id)}" value="${escapeHtml(opt)}" class="accent-amber-400" />
                  <span>${escapeHtml(opt)}</span>
                </label>
              `
              )
              .join('')}
          </div>
        `;
      }

      return `
        <div class="space-y-1.5">
          <label ${q.type !== 'radio' ? `for="${escapeHtml(q.id)}"` : ''} class="block text-sm font-medium text-slate-200">
            ${escapeHtml(q.label)} ${reqMark}
          </label>
          ${controlHtml}
          <p id="err-${escapeHtml(q.id)}" class="hidden text-xs text-rose-400" role="alert"></p>
        </div>
      `;
    })
    .join('');

  // Clear errors as user types/changes custom question inputs
  questions.forEach((q) => {
    if (q.type === 'radio') {
      container.querySelectorAll<HTMLInputElement>(`input[name="${q.id}"]`).forEach((rad) => {
        rad.addEventListener('change', () => setFieldError(q.id, ''));
      });
    } else {
      const inp = document.getElementById(q.id);
      inp?.addEventListener('input', () => setFieldError(q.id, ''));
      inp?.addEventListener('change', () => setFieldError(q.id, ''));
    }
  });
}

function validateStep(step: number): boolean {
  let valid = true;

  if (step === 1) {
    const namaRes = validateRegistrationField('nama_lengkap', getFieldValue('nama_lengkap'));
    setFieldError('nama_lengkap', namaRes.message);
    const emailRes = validateRegistrationField('email', getFieldValue('email'));
    setFieldError('email', emailRes.message);
    const hpRes = validateRegistrationField('no_hp', getFieldValue('no_hp'));
    setFieldError('no_hp', hpRes.message);
    valid = namaRes.valid && emailRes.valid && hpRes.valid;
  } else if (step === 2) {
    const divRes = validateRegistrationField('divisi', getCheckedRadioValue('divisi'));
    setFieldError('divisi', divRes.message);
    const motRes = validateRegistrationField('motivasi', getFieldValue('motivasi'));
    setFieldError('motivasi', motRes.message);
    valid = divRes.valid && motRes.valid;

    (appState.regSettings.customQuestions || []).forEach((q) => {
      const val = q.type === 'radio' ? getCheckedRadioValue(q.id) : getFieldValue(q.id);
      const qRes = validateCustomQuestionAnswer(q, val);
      setFieldError(q.id, qRes.message);
      if (!qRes.valid) valid = false;
    });
  } else if (step === 3) {
    const consent = document.getElementById('privacy_consent') as HTMLInputElement | null;
    if (consent && !consent.checked) {
      setFieldError('privacy_consent', 'Centang persetujuan kebijakan privasi dulu sebelum mengirim.');
      valid = false;
    } else {
      setFieldError('privacy_consent', '');
    }
  }

  return valid;
}

function populateConfirmationSummary(): void {
  const summaryEl = document.getElementById('confirmation-summary');
  if (!summaryEl) return;

  const nama = getFieldValue('nama_lengkap').trim();
  const kelas = getCheckedRadioValue('kelas') || 'X';
  const email = getFieldValue('email').trim();
  const noHp = normalizePhoneNumber(getFieldValue('no_hp'));
  const divisi = getCheckedRadioValue('divisi') || '-';
  const laptop = getCheckedRadioValue('laptop') || 'Ya, Siap Digunakan';
  const motivasi = getFieldValue('motivasi').trim();

  const customRows = (appState.regSettings.customQuestions || [])
    .map((q) => {
      const ans = (q.type === 'radio' ? getCheckedRadioValue(q.id) : getFieldValue(q.id)).trim() || '-';
      return `
        <div class="sm:col-span-2 border-t border-white/8 pt-3">
          <dt class="text-xs text-slate-400">${escapeHtml(q.label)}</dt>
          <dd class="text-sm text-slate-100 mt-1">${escapeHtml(ans)}</dd>
        </div>
      `;
    })
    .join('');

  summaryEl.innerHTML = `
    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <dt class="text-xs text-slate-400">Nama Lengkap</dt>
        <dd class="text-sm font-semibold text-white mt-0.5">${escapeHtml(nama)}</dd>
      </div>
      <div>
        <dt class="text-xs text-slate-400">Tingkat Kelas</dt>
        <dd class="text-sm font-medium text-slate-100 mt-0.5">Kelas ${escapeHtml(kelas)}</dd>
      </div>
      <div>
        <dt class="text-xs text-slate-400">Email Aktif</dt>
        <dd class="text-sm text-slate-100 mt-0.5 break-all">${escapeHtml(email)}</dd>
      </div>
      <div>
        <dt class="text-xs text-slate-400">Nomor WhatsApp</dt>
        <dd class="font-mono text-sm text-slate-100 mt-0.5 tabular-nums">${escapeHtml(noHp)}</dd>
      </div>
      <div>
        <dt class="text-xs text-slate-400">Divisi Pilihan</dt>
        <dd class="text-sm font-medium text-amber-300 mt-0.5">${escapeHtml(divisi)}</dd>
      </div>
      <div>
        <dt class="text-xs text-slate-400">Ketersediaan Laptop</dt>
        <dd class="text-sm text-slate-100 mt-0.5">${escapeHtml(laptop)}</dd>
      </div>
      <div class="sm:col-span-2 border-t border-white/8 pt-3">
        <dt class="text-xs text-slate-400">Motivasi Bergabung</dt>
        <dd class="text-sm text-slate-200 mt-1 leading-relaxed">${escapeHtml(motivasi)}</dd>
      </div>
      ${customRows}
    </dl>
  `;
}

function goToStep(step: number): void {
  currentStep = step;
  for (let i = 1; i <= 3; i++) {
    const panel = document.getElementById(`form-step-${i}`);
    const track = document.querySelector<HTMLElement>(`[data-step-track="${i}"]`);
    if (panel) panel.classList.toggle('hidden', i !== step);
    if (track) {
      track.classList.toggle('is-active', i === step);
      track.classList.toggle('is-completed', i < step);
      if (i === step) track.setAttribute('aria-current', 'step');
      else track.removeAttribute('aria-current');
    }
  }
  if (step === 3) {
    populateConfirmationSummary();
  }
}

function saveDraft(): void {
  const form = document.getElementById('robotics-reg-form') as HTMLFormElement | null;
  if (!form) return;
  const draft: Record<string, string> = {};
  form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input[type="text"], input[type="email"], input[type="tel"], textarea, select'
  ).forEach((el) => {
    if (el.id) draft[el.id] = el.value;
  });
  form.querySelectorAll<HTMLInputElement>('input[type="radio"]:checked').forEach((rad) => {
    if (rad.name) draft[`radio:${rad.name}`] = rad.value;
  });
  try {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage errors
  }
}

function loadDraft(): void {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw) as Record<string, string>;
    Object.entries(draft).forEach(([key, val]) => {
      if (key.startsWith('radio:')) {
        const name = key.slice(6);
        const rad = document.querySelector<HTMLInputElement>(`input[name="${name}"][value="${CSS.escape(val)}"]`);
        if (rad) rad.checked = true;
      } else {
        const el = document.getElementById(key) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
        if (el) el.value = val;
      }
    });
    updateMotivationCounter();
  } catch {
    // Ignore corrupt draft
  }
}

function updateMotivationCounter(): void {
  const textarea = document.getElementById('motivasi') as HTMLTextAreaElement | null;
  const counter = document.getElementById('motivasi-counter');
  if (!textarea || !counter) return;
  const len = textarea.value.trim().length;
  if (len >= 20) {
    counter.textContent = `${len} karakter ✓`;
    counter.className = 'text-[11px] sm:text-xs font-mono tabular-nums text-emerald-300 whitespace-nowrap shrink-0';
  } else {
    counter.textContent = `${len}/20 min`;
    counter.className = 'text-[11px] sm:text-xs font-mono tabular-nums text-slate-400 whitespace-nowrap shrink-0';
  }
}

export function resetRegistrationWizard(): void {
  const form = document.getElementById('robotics-reg-form') as HTMLFormElement | null;
  const formCard = document.getElementById('reg-form-card');
  const progress = document.getElementById('reg-step-progress');
  const successCard = document.getElementById('reg-success-card');

  form?.reset();
  sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  ['nama_lengkap', 'email', 'no_hp', 'divisi', 'motivasi', 'privacy_consent'].forEach((id) =>
    setFieldError(id, '')
  );
  updateMotivationCounter();
  goToStep(1);

  if (successCard) successCard.classList.add('hidden');
  if (appState.regSettings.status === 'open') {
    if (formCard) formCard.classList.remove('hidden');
    if (progress) progress.classList.remove('hidden');
  }
}

export function updateRegistrationAvailabilityUI(): void {
  if (countdownTimerId !== null) {
    window.clearInterval(countdownTimerId);
    countdownTimerId = null;
  }

  const settings = appState.regSettings;
  const closedCard = document.getElementById('reg-closed-card');
  const closedTitle = document.getElementById('reg-closed-title');
  const closedDesc = document.getElementById('reg-closed-desc');
  const closedCountdownWrap = document.getElementById('reg-closed-countdown');
  const formCard = document.getElementById('reg-form-card');
  const progress = document.getElementById('reg-step-progress');
  const successCard = document.getElementById('reg-success-card');
  const heroNotice = document.getElementById('hero-reg-window');
  const heroCta = document.getElementById('hero-btn-daftar') as HTMLButtonElement | null;
  const headerCta = document.getElementById('header-cta-daftar') as HTMLButtonElement | null;

  const successVisible = Boolean(successCard && !successCard.classList.contains('hidden'));
  const pad = (n: number) => String(n).padStart(2, '0');

  if (settings.status === 'open') {
    closedCard?.classList.add('hidden');
    if (!successVisible) {
      formCard?.classList.remove('hidden');
      progress?.classList.remove('hidden');
    }
    if (heroCta) {
      heroCta.disabled = false;
      heroCta.textContent = 'Daftar Sekarang';
    }
    if (headerCta) {
      headerCta.textContent = 'Daftar Sekarang';
    }

    const tickOpen = () => {
      const cd = computeCountdown(settings.countdownTarget, Date.now());
      if (!heroNotice) return;
      if (settings.showHeaderCountdown && !cd.expired) {
        heroNotice.classList.remove('hidden');
        heroNotice.innerHTML = `<span class="inline-flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1"><span>Pendaftaran aktif · ditutup dalam</span><span class="font-mono font-semibold text-amber-300 tabular-nums tracking-wide">${pad(cd.days)}h&nbsp;&nbsp;${pad(cd.hours)}j&nbsp;&nbsp;${pad(cd.minutes)}m&nbsp;&nbsp;${pad(cd.seconds)}d</span></span>`;
      } else {
        heroNotice.classList.remove('hidden');
        heroNotice.textContent = 'Pendaftaran anggota baru tahun ajaran 2026/2027 sedang dibuka.';
      }
    };

    tickOpen();
    countdownTimerId = window.setInterval(tickOpen, 1000);
  } else {
    formCard?.classList.add('hidden');
    progress?.classList.add('hidden');
    closedCard?.classList.remove('hidden');

    if (settings.status === 'closed_permanently') {
      if (closedTitle) closedTitle.textContent = 'Pendaftaran Periode Ini Sudah Selesai';
      if (closedDesc) {
        closedDesc.textContent =
          'Penerimaan anggota baru periode ini sudah ditutup. Kalau kamu sudah daftar, cek statusmu di kolom sebelah kanan.';
      }
      closedCountdownWrap?.classList.add('hidden');
      if (heroNotice) heroNotice.textContent = 'Pendaftaran anggota baru sedang ditutup.';
      if (heroCta) {
        heroCta.disabled = false;
        heroCta.textContent = 'Cek Status Pendaftaran';
      }
      if (headerCta) {
        headerCta.textContent = 'Cek Status';
      }
    } else {
      if (closedTitle) closedTitle.textContent = 'Pendaftaran Segera Dibuka';
      if (closedDesc) {
        closedDesc.textContent =
          'Pengurus lab sedang menyiapkan gelombang pendaftaran baru. Pantau hitung mundur pembukaan di bawah:';
      }
      if (heroCta) {
        heroCta.disabled = false;
        heroCta.textContent = 'Lihat Jadwal Pembukaan';
      }
      if (headerCta) {
        headerCta.textContent = 'Jadwal Buka';
      }

      const tickClosed = () => {
        const cd = computeCountdown(settings.countdownTarget, Date.now());
        if (cd.expired) {
          closedCountdownWrap?.classList.add('hidden');
          if (heroNotice) heroNotice.textContent = 'Pendaftaran sedang ditutup sementara.';
          return;
        }
        closedCountdownWrap?.classList.remove('hidden');
        const setTxt = (id: string, v: string) => {
          const el = document.getElementById(id);
          if (el) el.textContent = v;
        };
        setTxt('cd-days', pad(cd.days));
        setTxt('cd-hours', pad(cd.hours));
        setTxt('cd-minutes', pad(cd.minutes));
        setTxt('cd-seconds', pad(cd.seconds));
        if (heroNotice) {
          heroNotice.innerHTML = `<span class="inline-flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1"><span>Pendaftaran dibuka dalam</span><span class="font-mono font-semibold text-amber-300 tabular-nums tracking-wide">${pad(cd.days)}h&nbsp;&nbsp;${pad(cd.hours)}j&nbsp;&nbsp;${pad(cd.minutes)}m</span></span>`;
        }
      };

      tickClosed();
      countdownTimerId = window.setInterval(tickClosed, 1000);
    }
  }
}

export function initRegistrationModule(onNavigateHome: () => void): void {
  renderCustomQuestions();
  loadDraft();
  updateRegistrationAvailabilityUI();

  if (initialized) return;
  initialized = true;

  const form = document.getElementById('robotics-reg-form') as HTMLFormElement | null;
  if (!form) return;

  // Live blur/input validation
  (['nama_lengkap', 'email', 'no_hp', 'motivasi'] as const).forEach((fieldId) => {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.addEventListener('blur', () => {
      const res = validateRegistrationField(fieldId, getFieldValue(fieldId));
      setFieldError(fieldId, res.message);
    });
    el.addEventListener('input', () => {
      setFieldError(fieldId, '');
      if (fieldId === 'motivasi') updateMotivationCounter();
    });
  });

  form.querySelectorAll<HTMLInputElement>('input[name="divisi"]').forEach((rad) => {
    rad.addEventListener('change', () => setFieldError('divisi', ''));
  });
  document.getElementById('privacy_consent')?.addEventListener('change', () => setFieldError('privacy_consent', ''));

  form.addEventListener('input', saveDraft);
  form.addEventListener('change', saveDraft);

  document.getElementById('btn-step1-next')?.addEventListener('click', () => {
    if (validateStep(1)) goToStep(2);
  });
  document.getElementById('btn-step2-prev')?.addEventListener('click', () => goToStep(1));
  document.getElementById('btn-step2-next')?.addEventListener('click', () => {
    if (validateStep(2)) goToStep(3);
  });
  document.getElementById('btn-step3-prev')?.addEventListener('click', () => goToStep(2));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (appState.regSettings.status !== 'open') {
      showToast('Pendaftaran saat ini sedang ditutup.', 'error');
      return;
    }
    if (currentStep < 3) {
      if (validateStep(currentStep)) goToStep(currentStep + 1);
      return;
    }
    if (!validateStep(1)) {
      goToStep(1);
      return;
    }
    if (!validateStep(2)) {
      goToStep(2);
      return;
    }
    if (!validateStep(3)) return;

    const rate = checkFormRateLimit();
    if (!rate.allowed) {
      showToast(`Mohon tunggu ${Math.ceil(rate.remainingMs / 1000)} detik sebelum mengirim ulang.`, 'error');
      return;
    }

    const submitBtn = document.getElementById('btn-submit-reg') as HTMLButtonElement | null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Menyimpan pendaftaran...';
    }

    try {
      recordFormSubmission();
      const regId = generateRegistrationId();
      lastSubmittedId = regId;

      const customAnswers: Record<string, string> = {};
      (appState.regSettings.customQuestions || []).forEach((q) => {
        const rawVal = q.type === 'radio' ? getCheckedRadioValue(q.id) : getFieldValue(q.id);
        customAnswers[q.id] = sanitizePlainText(rawVal);
      });

      const applicant: Applicant = {
        id: regId,
        nama: sanitizePlainText(getFieldValue('nama_lengkap')),
        kelas: sanitizePlainText(getCheckedRadioValue('kelas') || 'X'),
        email: sanitizePlainText(getFieldValue('email')),
        noHp: normalizePhoneNumber(sanitizePlainText(getFieldValue('no_hp'))),
        divisi: sanitizePlainText(getCheckedRadioValue('divisi') || 'Pemrograman'),
        laptop: sanitizePlainText(getCheckedRadioValue('laptop') || 'Ya, Siap Digunakan'),
        motivasi: sanitizePlainText(getFieldValue('motivasi')),
        tanggalDaftar: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        status: 'Pending',
        customAnswers,
      };

      await saveApplicantRecord(applicant);
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);

      // Populate success panel
      const nameEl = document.getElementById('success-student-name');
      const idEl = document.getElementById('success-student-id');
      const waTitleEl = document.getElementById('success-wa-title');
      const waDescEl = document.getElementById('success-wa-desc');
      const waLinkEl = document.getElementById('success-wa-link') as HTMLAnchorElement | null;

      if (nameEl) nameEl.textContent = applicant.nama;
      if (idEl) idEl.textContent = regId;
      if (waTitleEl) waTitleEl.textContent = appState.regSettings.waTitle;
      if (waDescEl) waDescEl.textContent = appState.regSettings.waDesc;
      if (waLinkEl) {
        waLinkEl.href = sanitizeUrl(appState.regSettings.waLink) || 'https://chat.whatsapp.com/mock-motechart-robotik';
      }

      // Pre-fill status checker input for effortless verification
      const checkerInput = document.getElementById('status-check-input') as HTMLInputElement | null;
      if (checkerInput) checkerInput.value = regId;

      document.getElementById('reg-step-progress')?.classList.add('hidden');
      document.getElementById('reg-form-card')?.classList.add('hidden');
      document.getElementById('reg-success-card')?.classList.remove('hidden');

      showToast(`Pendaftaran berhasil! Simpan ID ${regId}.`);
      document.getElementById('reg-success-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirim Pendaftaran';
      }
    }
  });

  // Success screen actions
  document.getElementById('btn-copy-reg-id')?.addEventListener('click', async () => {
    const idText = document.getElementById('success-student-id')?.textContent || lastSubmittedId;
    if (!idText) return;
    try {
      await navigator.clipboard.writeText(idText);
      showToast(`ID ${idText} disalin ke clipboard.`);
    } catch {
      showToast('Salin ID secara manual dari kotak di atas.', 'error');
    }
  });

  document.getElementById('btn-check-my-status')?.addEventListener('click', async () => {
    const idText = document.getElementById('success-student-id')?.textContent || lastSubmittedId;
    if (!idText) return;
    const found = await findApplicantById(normalizeRegistrationId(idText));
    openStatusModal(found, idText, appState.regSettings);
  });

  document.getElementById('btn-reg-back-home')?.addEventListener('click', () => {
    resetRegistrationWizard();
    onNavigateHome();
  });

  // Status checker form
  const statusForm = document.getElementById('status-checker-form') as HTMLFormElement | null;
  const statusInput = document.getElementById('status-check-input') as HTMLInputElement | null;
  const statusBtn = document.getElementById('btn-check-status') as HTMLButtonElement | null;

  statusForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!statusInput) return;
    const normalized = normalizeRegistrationId(statusInput.value);
    if (!normalized) {
      setFieldError('status-check-input', 'Masukkan ID pendaftaran terlebih dahulu (contoh: ROBO-2026A001).');
      return;
    }
    setFieldError('status-check-input', '');
    statusInput.value = normalized;

    if (statusBtn) {
      statusBtn.disabled = true;
      statusBtn.textContent = 'Memeriksa...';
    }
    try {
      const applicant = await findApplicantById(normalized);
      openStatusModal(applicant, normalized, appState.regSettings);
    } finally {
      if (statusBtn) {
        statusBtn.disabled = false;
        statusBtn.textContent = 'Periksa Status';
      }
    }
  });

  statusInput?.addEventListener('input', () => setFieldError('status-check-input', ''));

  // Quick demo ID helper buttons inside status checker
  document.querySelectorAll<HTMLButtonElement>('[data-demo-status-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const demoId = btn.dataset.demoStatusId || '';
      if (!demoId || !statusInput) return;
      statusInput.value = demoId;
      setFieldError('status-check-input', '');
      const applicant = await findApplicantById(demoId);
      openStatusModal(applicant, demoId, appState.regSettings);
    });
  });
}
