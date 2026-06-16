# Append Missing Functions Script for app.js

$filePath = "c:\Users\Rayyan\Documents\robotik-website-main\app.js"

$codeToAppend = @"


// ==========================================================================
// CENTRAL COUNTDOWN STATE & PUBLIC HELPER FUNCTIONS
// ==========================================================================

let countdownInterval = null;

function generateStudentCardHtml(nama, kelas, regId) {
  return `
    <div class="robot-student-card" style="margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div class="card-header">
        <span class="card-title">MOTECHART ROBOTIK MEMBER</span>
        <svg class="card-logo" width="24" height="24" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="stroke: currentColor;">
          <defs>
            <linearGradient id="gold-grad-card-dyn" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFEFA6" />
              <stop offset="30%" stop-color="#E5C158" />
              <stop offset="70%" stop-color="#B28C32" />
              <stop offset="100%" stop-color="#805C15" />
            </linearGradient>
            <linearGradient id="silver-grad-card-dyn" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="25%" stop-color="#E5E5EA" />
              <stop offset="50%" stop-color="#AEAEB2" />
              <stop offset="75%" stop-color="#636366" />
              <stop offset="100%" stop-color="#3A3A3C" />
            </linearGradient>
            <radialGradient id="cyan-glow-card-dyn" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#00F0FF" />
              <stop offset="70%" stop-color="#06B6D4" />
              <stop offset="100%" stop-color="#083344" />
            </radialGradient>
          </defs>
          <g transform="translate(64, 108)">
            <circle cx="0" cy="0" r="14" fill="url(#silver-grad-card-dyn)" stroke="#1E293B" stroke-width="0.5" />
            <circle cx="0" cy="0" r="8" fill="url(#cyan-glow-card-dyn)" />
            <circle cx="0" cy="0" r="4" fill="#000" />
          </g>
          <g transform="translate(136, 108)">
            <circle cx="0" cy="0" r="14" fill="url(#silver-grad-card-dyn)" stroke="#1E293B" stroke-width="0.5" />
            <circle cx="0" cy="0" r="8" fill="url(#cyan-glow-card-dyn)" />
            <circle cx="0" cy="0" r="4" fill="#000" />
          </g>
          <g transform="translate(100, 150)">
            <circle cx="0" cy="0" r="19" fill="url(#silver-grad-card-dyn)" stroke="#1E293B" stroke-width="0.5" />
          </g>
          <g fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M 100,45 L 35,45 L 35,125 L 48,155 L 76,108 L 82,90 L 100,90 L 118,90 L 124,108 L 152,155 L 165,125 L 165,45 Z" stroke="url(#gold-grad-card-dyn)" stroke-width="5" fill="none" />
            <path d="M 100,53 L 43,53 L 43,121 L 53,144 L 75,107 L 80,98 L 100,98 L 120,98 L 125,107 L 147,144 L 157,121 L 157,53 Z" stroke="url(#gold-grad-card-dyn)" stroke-width="3" fill="none" />
          </g>
          <circle cx="100" cy="150" r="6" fill="url(#gold-grad-card-dyn)" />
        </svg>
      </div>
      <div class="card-body">
        <div class="card-avatar" aria-label="Avatar robotik">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div class="card-info">
          <div class="card-name">\${escapeHtml(nama)}</div>
          <div class="card-class">KELAS \${escapeHtml(kelas)}</div>
          <div class="card-id-row">NIM/ID: <span>\${escapeHtml(regId)}</span></div>
        </div>
      </div>
      <div class="card-footer-barcode" aria-label="Barcode keamanan">
        <svg width="150" height="30" viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="2" width="2" height="16" fill="var(--accent-cyan)" />
          <rect x="4" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="7" y="2" width="3" height="16" fill="var(--accent-cyan)" />
          <rect x="12" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="15" y="2" width="2" height="16" fill="var(--accent-cyan)" />
          <rect x="19" y="2" width="4" height="16" fill="var(--accent-cyan)" />
          <rect x="25" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="28" y="2" width="2" height="16" fill="var(--accent-cyan)" />
          <rect x="32" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="35" y="2" width="3" height="16" fill="var(--accent-cyan)" />
          <rect x="40" y="2" width="2" height="16" fill="var(--accent-cyan)" />
          <rect x="44" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="47" y="2" width="4" height="16" fill="var(--accent-cyan)" />
          <rect x="53" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="56" y="2" width="2" height="16" fill="var(--accent-cyan)" />
          <rect x="60" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="63" y="2" width="3" height="16" fill="var(--accent-cyan)" />
          <rect x="68" y="2" width="2" height="16" fill="var(--accent-cyan)" />
          <rect x="72" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="75" y="2" width="4" height="16" fill="var(--accent-cyan)" />
          <rect x="81" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="84" y="2" width="2" height="16" fill="var(--accent-cyan)" />
          <rect x="88" y="2" width="3" height="16" fill="var(--accent-cyan)" />
          <rect x="93" y="2" width="1" height="16" fill="var(--accent-cyan)" />
          <rect x="96" y="2" width="4" height="16" fill="var(--accent-cyan)" />
        </svg>
      </div>
    </div>
  `;
}

function renderCustomQuestionsInForm() {
  const container = document.getElementById('custom-questions-injected-container');
  if (!container) return;

  container.innerHTML = '';
  
  if (!regSettings.customQuestions || regSettings.customQuestions.length === 0) {
    return;
  }

  regSettings.customQuestions.forEach(q => {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    formGroup.style.marginBottom = '1.5rem';

    const label = document.createElement('label');
    label.className = 'form-label';
    if (q.type !== 'radio') {
      label.htmlFor = q.id;
    }
    label.innerHTML = `\${escapeHtml(q.label)} \${q.required ? '<span>*</span>' : ''}`;
    formGroup.appendChild(label);

    if (q.type === 'text') {
      const input = document.createElement('input');
      input.type = 'text';
      input.id = q.id;
      input.className = 'input-control';
      input.placeholder = 'Masukkan jawaban Anda';
      if (q.required) input.required = true;

      input.addEventListener('blur', () => {
        if (q.required && !input.value.trim()) {
          showCustomFieldError(input, 'Pertanyaan wajib diisi.');
        } else {
          clearCustomFieldError(input);
        }
      });
      input.addEventListener('input', () => {
        clearCustomFieldError(input);
      });

      formGroup.appendChild(input);
    } else if (q.type === 'select') {
      const select = document.createElement('select');
      select.id = q.id;
      select.className = 'input-control';
      if (q.required) select.required = true;

      const defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = '-- Pilih salah satu --';
      select.appendChild(defaultOpt);

      if (q.options) {
        q.options.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          select.appendChild(option);
        });
      }

      select.addEventListener('change', () => {
        if (q.required && !select.value) {
          showCustomFieldError(select, 'Pilihan wajib dipilih.');
        } else {
          clearCustomFieldError(select);
        }
      });

      formGroup.appendChild(select);
    } else if (q.type === 'radio') {
      const radioContainer = document.createElement('div');
      radioContainer.style.display = 'flex';
      radioContainer.style.flexDirection = 'column';
      radioContainer.style.gap = '0.5rem';
      radioContainer.style.marginTop = '0.5rem';

      if (q.options) {
        q.options.forEach((opt, oIdx) => {
          const labelWrapper = document.createElement('label');
          labelWrapper.style.display = 'flex';
          labelWrapper.style.alignItems = 'center';
          labelWrapper.style.gap = '0.75rem';
          labelWrapper.style.cursor = 'pointer';
          labelWrapper.style.color = 'var(--text-white)';

          const radioInput = document.createElement('input');
          radioInput.type = 'radio';
          radioInput.name = q.id;
          radioInput.id = `\${q.id}-\${oIdx}`;
          radioInput.value = opt;
          radioInput.style.width = 'auto';
          radioInput.style.cursor = 'pointer';
          if (q.required && oIdx === 0) radioInput.required = true;

          radioInput.addEventListener('change', () => {
            clearCustomFieldError(radioInput);
          });

          const span = document.createElement('span');
          span.textContent = opt;

          labelWrapper.appendChild(radioInput);
          labelWrapper.appendChild(span);
          radioContainer.appendChild(labelWrapper);
        });
      }
      formGroup.appendChild(radioContainer);
    }

    container.appendChild(formGroup);
  });
}

function showCustomFieldError(input, message) {
  const group = input.closest('.form-group');
  if (!group) return;
  group.classList.add('has-error');
  
  let errorSpan = group.querySelector('.error-message');
  if (!errorSpan) {
    errorSpan = document.createElement('span');
    errorSpan.className = 'error-message';
    group.appendChild(errorSpan);
  }
  errorSpan.textContent = message;
  errorSpan.setAttribute('aria-live', 'assertive');
}

function clearCustomFieldError(input) {
  const group = input.closest('.form-group');
  if (!group) return;
  group.classList.remove('has-error');
  const errorSpan = group.querySelector('.error-message');
  if (errorSpan) {
    group.removeChild(errorSpan);
  }
}

function updateCountdownTimer() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  const closedContainer = document.getElementById('reg-closed-container');
  const regLayout = document.querySelector('.reg-layout');
  if (!closedContainer || !regLayout) return;

  const progressBar = document.querySelector('.progress-bar-container');
  const formContainer = document.getElementById('reg-form-container');
  const successCard = document.getElementById('reg-success-card');

  if (regSettings.isOpen) {
    closedContainer.style.display = 'none';
    regLayout.style.display = '';
    
    // When open, restore form container and progress bar if success card is NOT displayed
    if (successCard && successCard.style.display === 'block') {
      if (progressBar) progressBar.style.display = 'none';
      if (formContainer) formContainer.style.display = 'none';
    } else {
      if (progressBar) progressBar.style.display = '';
      if (formContainer) formContainer.style.display = '';
    }
  } else {
    closedContainer.style.display = 'block';
    regLayout.style.display = ''; // Keep reg-layout visible so status checker is displayed
    if (progressBar) progressBar.style.display = 'none';
    if (formContainer) formContainer.style.display = 'none';
    if (successCard) successCard.style.display = 'none';

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    function tick() {
      const targetTime = new Date(regSettings.countdownTarget).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (isNaN(targetTime) || diff <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minutesEl) minutesEl.textContent = '00';
        if (secondsEl) secondsEl.textContent = '00';

        regSettings.isOpen = true;
        saveData('robotik_reg_settings', regSettings);
        clearInterval(countdownInterval);
        countdownInterval = null;
        closedContainer.style.display = 'none';
        regLayout.style.display = '';
        if (progressBar) progressBar.style.display = '';
        if (formContainer) formContainer.style.display = '';
        
        const statusToggle = document.getElementById('reg-status-toggle');
        if (statusToggle) statusToggle.value = 'open';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (num) => String(num).padStart(2, '0');

      if (daysEl) daysEl.textContent = pad(days);
      if (hoursEl) hoursEl.textContent = pad(hours);
      if (minutesEl) minutesEl.textContent = pad(minutes);
      if (secondsEl) secondsEl.textContent = pad(seconds);
    }

    tick();
    countdownInterval = setInterval(tick, 1000);
  }
}

function checkApplicantStatus(id) {
  const applicant = applicants.find(a => a.id.toUpperCase() === id.trim().toUpperCase());
  const contentContainer = document.getElementById('student-status-content-container');
  if (!contentContainer) return;

  if (!applicant) {
    playRoboticSound('error');
    contentContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 3rem; color: #FB7185; margin-bottom: 1rem;">⚠️</div>
        <h3 style="color: var(--text-white); margin-bottom: 0.5rem;">ID Tidak Ditemukan</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          ID pendaftaran <strong>"\${escapeHtml(id)}"</strong> tidak terdaftar di database kami. Silakan periksa kembali penulisan ID Anda atau hubungi admin.
        </p>
      </div>
    `;
  } else if (applicant.status === 'Pending') {
    playRoboticSound('success');
    contentContainer.innerHTML = `
      <div style="padding: 1.5rem; text-align: center;">
        <div class="pulsing-radar-icon" aria-hidden="true" style="margin: 0 auto 1.5rem auto; border-color: var(--accent-yellow); background: rgba(245, 158, 11, 0.1); width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-yellow)" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <h3 style="color: var(--accent-yellow); font-size: 1.5rem; margin-bottom: 0.5rem;">Menunggu Persetujuan ⏳</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem;">
          Halo <strong>\${escapeHtml(applicant.nama)}</strong>, pendaftaran Anda untuk kelas <strong>\${escapeHtml(applicant.kelas)}</strong> sedang diproses oleh pengurus ekskul Motechart Robotik.
        </p>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 8px; padding: 1rem; text-align: left; margin-bottom: 1.5rem;">
          <div style="display: grid; grid-template-columns: 100px 1fr; gap: 0.5rem; font-size: 0.9rem;">
            <span style="color: var(--text-muted);">ID Unik:</span><span style="color: var(--text-white); font-weight: bold;">\${escapeHtml(applicant.id)}</span>
            <span style="color: var(--text-muted);">Divisi:</span><span style="color: var(--text-white);">\${escapeHtml(Array.isArray(applicant.divisi) ? applicant.divisi.join(', ') : applicant.divisi)}</span>
            <span style="color: var(--text-muted);">Tanggal:</span><span style="color: var(--text-white);">\${escapeHtml(applicant.tanggalDaftar)}</span>
          </div>
        </div>
        <p style="color: var(--text-white); font-size: 0.95rem; margin-bottom: 1rem;">
          \${escapeHtml(regSettings.waDesc || 'Harap bergabung ke grup koordinasi calon anggota baru di bawah ini untuk mendapatkan info jadwal wawancara, tes masuk, dan demonstrasi alat robotika:')}
        </p>
        <a href="\${escapeHtml(regSettings.waLink || 'https://chat.whatsapp.com/mock-motechart-robotik')}" target="_blank" class="btn btn-yellow" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; justify-content: center; width: 100%;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 2C6.51 2 2.03 6.48 2.03 12c0 2.159.57 4.259 1.66 6.13l-1.77 6.47 6.63-1.74c1.88 1.02 4 1.56 6.13 1.56 5.52 0 10-4.48 10-10S17.551 2 12.031 2zm6.39 14.19c-.27.76-1.55 1.48-2.15 1.56-.54.07-1.24.1-3.64-.89-3.07-1.26-5.05-4.38-5.2-4.58-.15-.2-1.2-1.6-1.2-3.06 0-1.46.76-2.17 1.03-2.46.27-.3.59-.37.79-.37.2 0 .4.01.57.02.18.01.41-.07.65.5.24.58.82 2.02.9 2.17.08.16.14.35.03.56-.11.22-.26.47-.38.61-.13.14-.26.3-.11.56.15.26.68 1.12 1.46 1.82.99.9 1.83 1.18 2.09 1.31.26.13.41.11.56-.06.15-.18.66-.76.84-.96.18-.2.37-.16.63-.07.26.09 1.66.78 1.95.92.29.14.48.22.56.35.07.13.07.76-.2 1.52z"/>
          </svg>
          Gabung Grup WhatsApp 💬
        </a>
      </div>
    `;
  } else if (applicant.status === 'Diterima') {
    playRoboticSound('success');
    contentContainer.innerHTML = `
      <div style="padding: 0.5rem; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎉</div>
        <h3 style="color: var(--accent-cyan); font-size: 1.5rem; margin-bottom: 0.5rem;">Selamat, Anda Diterima!</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.5rem;">
          Selamat bergabung di <strong>Motechart Robotik</strong>, <strong>\${escapeHtml(applicant.nama)}</strong>! Berikut adalah Kartu Anggota Digital resmi Anda. Silakan simpan / screenshot kartu ini.
        </p>
        
        <div style="display: flex; justify-content: center; margin-bottom: 1rem; overflow-x: auto; padding: 0.5rem;">
          \${generateStudentCardHtml(applicant.nama, applicant.kelas, applicant.id)}
        </div>
      </div>
    `;
  } else if (applicant.status === 'Ditolak') {
    playRoboticSound('error');
    contentContainer.innerHTML = `
      <div style="padding: 1.5rem; text-align: center;">
        <div class="pulsing-radar-icon" aria-hidden="true" style="margin: 0 auto 1.5rem auto; border-color: #FB7185; background: rgba(244, 63, 94, 0.1); width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FB7185" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3 style="color: #FB7185; font-size: 1.5rem; margin-bottom: 0.5rem;">Pendaftaran Ditolak 🔴</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6;">
          Halo <strong>\${escapeHtml(applicant.nama)}</strong>, mohon maaf saat ini pendaftaran Anda belum dapat kami setujui karena kuota divisi penuh atau alasan administratif lainnya.
        </p>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 1rem;">
          Terima kasih atas minat besar Anda untuk bergabung dengan Motechart Robotik. Tetap semangat belajar robotika!
        </p>
      </div>
    `;
  }

  const dialog = document.getElementById('student-status-dialog');
  if (dialog) {
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }
}

function setupStatusChecker() {
  const btnCheckStatus = document.getElementById('btn-check-status');
  const inputCheckStatus = document.getElementById('check-reg-id');
  const studentStatusDialog = document.getElementById('student-status-dialog');
  const closeStudentStatusBtn = document.getElementById('close-status-dialog-btn');

  if (btnCheckStatus && inputCheckStatus) {
    const handleCheck = () => {
      const id = inputCheckStatus.value.trim();
      if (!id) {
        alert('Silakan masukkan ID Pendaftaran Anda terlebih dahulu.');
        playRoboticSound('error');
        return;
      }
      playRoboticSound('click');
      checkApplicantStatus(id);
    };

    btnCheckStatus.addEventListener('click', handleCheck);
    inputCheckStatus.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleCheck();
      }
    });
  }

  if (closeStudentStatusBtn && studentStatusDialog) {
    closeStudentStatusBtn.addEventListener('click', () => {
      playRoboticSound('click');
      studentStatusDialog.close();
    });
    studentStatusDialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
    });
  }
}
"@

[System.IO.File]::AppendAllText($filePath, $codeToAppend, [System.Text.Encoding]::UTF8)
Write-Host "Success: Appended all missing helper functions to app.js!"
