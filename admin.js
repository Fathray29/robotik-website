import { 
  state, 
  saveData, 
  playRoboticSound, 
  sanitizeInput, 
  escapeHtml, 
  parseMarkdownToHtml,
  sanitizeRichHtml,
  setupRealTimeApplicantsSync,
  unsubscribeRealTimeApplicants,
  customAlert,
  customConfirm,
  showToast,
  setupRealTimeRegSettingsSync,
  setupRealTimeLandingDataSync,
  initializeCloudDataSync,
  setupRealTimeBlogSync,
  setupRealTimePortfolioSync,
  ensureFirebaseInitialized,

  getLoginRateLimit,
  recordFailedLogin,
  resetLoginRateLimit,
  INITIAL_BLOG_ARTICLES,
  INITIAL_PORTFOLIO_PROJECTS,
  INITIAL_APPLICANTS,
  INITIAL_REG_SETTINGS,
  INITIAL_LANDING_DATA
} from './shared.js';

// --- FIREBASE ADMIN AUTH ---

// --- CMS AUTHENTICATION ---
let lockoutTimerInterval = null;

// --- CMS TABLE SORTING STATE ---
let currentSortField = 'timestamp';
let currentSortOrder = 'asc';

function setupCmsAuthentication() {
  const loginForm = document.getElementById('cms-login-form');
  const logoutBtn = document.getElementById('btn-admin-logout');
  const toggleEye = document.getElementById('toggle-admin-password');
  const passwordInput = document.getElementById('admin_password');
  
  const loginSection = document.getElementById('admin-login-section');
  const panelSection = document.getElementById('admin-panel-section');
  const btnResetDb = document.getElementById('btn-reset-db');

  if (toggleEye && passwordInput) {
    toggleEye.addEventListener('click', () => {
      const isVisible = passwordInput.getAttribute('type') === 'text';
      const newType = isVisible ? 'password' : 'text';
      passwordInput.setAttribute('type', newType);
      
      toggleEye.setAttribute('aria-pressed', !isVisible);
      
      if (!isVisible) {
        // Show eye-off (slashed) SVG
        toggleEye.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        `;
        toggleEye.setAttribute('aria-label', 'Sembunyikan Password');
      } else {
        // Show standard eye SVG
        toggleEye.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        `;
        toggleEye.setAttribute('aria-label', 'Tampilkan Password');
      }
      playRoboticSound('hover');
    });
  }

  if (btnResetDb) {
    btnResetDb.addEventListener('click', async () => {
      if (await customConfirm('PERINGATAN: Apakah Anda yakin ingin mengosongkan seluruh database? Semua data pendaftaran, artikel, proyek portofolio, pertanyaan kustom, dan prestasi akan dihapus secara permanen.')) {
        playRoboticSound('success');
        
        state.blogArticles = [];
        state.portfolioProjects = [];
        state.applicants = [];
        
        state.regSettings = {
          isOpen: true,
          status: 'open',
          countdownTarget: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          customQuestions: [],
          waTitle: 'Grup WhatsApp Resmi Calon Anggota',
          waDesc: 'Harap bergabung ke grup koordinasi calon anggota baru di bawah ini.',
          waLink: 'https://chat.whatsapp.com/mock-motechart-robotik'
        };

        state.landingData = {
          heroTag: 'Ekstrakurikuler Unggulan',
          heroTitle: 'Rancang Masa Depanmu Bersama <span>Robotik</span>!',
          heroDesc: 'Deskripsi ekskul robotik.',
          visiText: 'Visi kami.',
          misiList: ['Misi 1', 'Misi 2', 'Misi 3', 'Misi 4'],
          divMechDesc: 'Mekanik.',
          divElecDesc: 'Elektronika.',
          divProgDesc: 'Pemrograman.',
          achievements: [],
          footerTagline: 'Footer tagline.',
          footerLocation: 'Lab Robotika',
          footerEmail: 'robotikmotechart@gmail.com',
          footerInstagram: '',
          footerYoutube: ''
        };
        
        saveData('robotik_blog', state.blogArticles);
        saveData('robotik_portfolio', state.portfolioProjects);
        saveData('robotik_applicants', state.applicants);
        saveData('robotik_reg_settings', state.regSettings);
        saveData('robotik_landing', state.landingData);

        if (state.useFirebase) {
          state.db.collection('applicants').get()
            .then(snapshot => {
              const batch = state.db.batch();
              snapshot.forEach(doc => {
                batch.delete(doc.ref);
              });
              return batch.commit();
            })
            .then(() => console.log("Cloud Reset: Applicants database successfully cleared!"))
            .catch(err => console.error("Cloud Reset Error: Firestore applicants clear failed:", err));
        }
        
        renderAdminBlogTable();
        renderAdminPortfolioTable();
        renderAdminApplicantsTable();
        populateLandingCmsInputs();
        populateRegSettingsCmsInputs();
        renderAdminQuestionsTable();
        
        showToast('Database telah dikosongkan secara permanen!');
      } else {
        playRoboticSound('error');
      }
    });
  }

  // --- LOGIN RATE LIMIT: Show lockout state on page load ---
  updateLockoutDisplay();

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errMsg = document.getElementById('login-error-msg');
      if (errMsg) errMsg.style.display = 'none';

      // Check rate limit BEFORE processing login
      const rateLimit = getLoginRateLimit();
      if (rateLimit.isLocked) {
        playRoboticSound('error');
        const secs = Math.ceil(rateLimit.remainingMs / 1000);
        if (errMsg) {
          errMsg.textContent = `⚠️ Terlalu banyak percobaan gagal. Coba lagi dalam ${secs} detik.`;
          errMsg.style.display = 'block';
        }
        return;
      }

      const user = document.getElementById('admin_username').value.trim();
      const pass = document.getElementById('admin_password').value.trim();

      if (!state.auth) {
        playRoboticSound('error');
        if (errMsg) {
          errMsg.textContent = '❌ Firebase Authentication tidak aktif atau gagal diinisialisasi.';
          errMsg.style.display = 'block';
        }
        return;
      }

      try {
        await state.auth.signInWithEmailAndPassword(user, pass);
        playRoboticSound('success');
        resetLoginRateLimit();
        clearLockoutTimer();
        // UI transition handled by onAuthStateChanged
      } catch (err) {
        playRoboticSound('error');
        const result = recordFailedLogin();
        if (errMsg) {
          if (result.isLocked) {
            const secs = Math.ceil(result.lockoutMs / 1000);
            errMsg.textContent = `🔒 Akun terkunci selama ${secs} detik setelah ${result.attempts} percobaan gagal.`;
            startLockoutCountdown();
          } else {
            const remaining = 5 - result.attempts;
            if (remaining > 0) {
              errMsg.textContent = `Login gagal: ${err.message}. (${remaining} percobaan tersisa sebelum lockout)`;
            } else {
              errMsg.textContent = `Login gagal: ${err.message}`;
            }
          }
          errMsg.style.display = 'block';
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      playRoboticSound('click');
      if (state.auth) {
        await state.auth.signOut();
      }
      window.location.href = './index.html';
    });
  }
}

// --- LOCKOUT TIMER DISPLAY HELPERS ---
function updateLockoutDisplay() {
  const rateLimit = getLoginRateLimit();
  if (rateLimit.isLocked) {
    startLockoutCountdown();
  }
}

function startLockoutCountdown() {
  clearLockoutTimer();
  const errMsg = document.getElementById('login-error-msg');
  const submitBtn = document.querySelector('#cms-login-form button[type="submit"]');

  lockoutTimerInterval = setInterval(() => {
    const rl = getLoginRateLimit();
    if (!rl.isLocked) {
      clearLockoutTimer();
      if (errMsg) {
        errMsg.textContent = 'Lockout berakhir. Silakan coba lagi.';
        errMsg.style.display = 'block';
      }
      if (submitBtn) submitBtn.disabled = false;
      return;
    }
    const secs = Math.ceil(rl.remainingMs / 1000);
    if (errMsg) {
      errMsg.textContent = `🔒 Akun terkunci. Coba lagi dalam ${secs} detik...`;
      errMsg.style.display = 'block';
    }
    if (submitBtn) submitBtn.disabled = true;
  }, 1000);
}

function clearLockoutTimer() {
  if (lockoutTimerInterval) {
    clearInterval(lockoutTimerInterval);
    lockoutTimerInterval = null;
  }
  const submitBtn = document.querySelector('#cms-login-form button[type="submit"]');
  if (submitBtn) submitBtn.disabled = false;
}

// --- SECURE LOGIN STATE CHECK (Firebase Auth) ---
function setupAuthStateListener() {
  const loginSection = document.getElementById('admin-login-section');
  const panelSection = document.getElementById('admin-panel-section');

  if (state.auth) {
    state.auth.onAuthStateChanged(async (user) => {
      if (user) {
        loginSection.style.display = 'none';
        panelSection.style.display = 'block';
        
        // Fetch fresh cloud data first
        if (state.useFirebase) {
          try {
            await initializeCloudDataSync();
            // Setup real-time sync for applicants now that we are authenticated
            setupRealTimeApplicantsSync((updatedApplicants) => {
              renderAdminApplicantsTable();
              renderDashboardOverview();
            });
          } catch (e) {
            console.error("Failed to sync cloud data on auth change:", e);
          }
        }

        renderAdminBlogTable();
        renderAdminPortfolioTable();
        renderAdminApplicantsTable();
        populateRegSettingsCmsInputs();
        renderAdminQuestionsTable();
        populateLandingCmsInputs();
        renderDashboardOverview();
      } else {
        loginSection.style.display = 'flex';
        panelSection.style.display = 'none';
        unsubscribeRealTimeApplicants();
      }
    });
  } else {
    console.error("Firebase Auth is not initialized.");
  }
}

function showAdminPanel() {
  const loginSection = document.getElementById('admin-login-section');
  const panelSection = document.getElementById('admin-panel-section');

  const performLoginTransition = () => {
    loginSection.style.display = 'none';
    panelSection.style.display = 'block';
    document.getElementById('admin_password').value = '';
    
    renderAdminBlogTable();
    renderAdminPortfolioTable();
    renderAdminApplicantsTable();
    populateRegSettingsCmsInputs();
    renderAdminQuestionsTable();
    populateLandingCmsInputs();
    renderDashboardOverview();
  };

  if (document.startViewTransition) {
    document.startViewTransition(performLoginTransition);
  } else {
    performLoginTransition();
  }
}

// --- CMS SUB-TAB SYSTEM ---
function setupSubTabs() {
  const tabContainers = document.querySelectorAll('.sub-tab-container');
  tabContainers.forEach(container => {
    const tabButtons = container.querySelectorAll('.sub-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-sub-target');
        if (!targetId) return;

        if (typeof playRoboticSound === 'function') {
          playRoboticSound('click');
        }

        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const cmsView = targetElement.closest('.cms-view');
          if (cmsView) {
            const allSubContents = cmsView.querySelectorAll('.sub-tab-content');
            allSubContents.forEach(content => content.classList.remove('active'));
          }
          targetElement.classList.add('active');
        }
      });
      btn.addEventListener('mouseenter', () => {
        if (typeof playRoboticSound === 'function') {
          playRoboticSound('hover');
        }
      });
    });
  });
}

// --- CMS TAB SYSTEM ---
function setupCmsTabs() {
  const tabs = document.querySelectorAll('.nav-item');
  const topbarTitle = document.getElementById('topbar-title');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playRoboticSound('click');
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-cms-target');
      document.querySelectorAll('.cms-view').forEach(view => {
        view.classList.remove('active');
      });
      document.getElementById(target).classList.add('active');
      
      if (topbarTitle) {
        topbarTitle.textContent = tab.textContent.trim();
      }
      
      if (window.innerWidth <= 768) {
        document.getElementById('admin-sidebar').classList.remove('show');
      }
    });
    tab.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });
  
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      document.getElementById('admin-sidebar').classList.toggle('show');
    });
  }

  const btnAddBlog = document.getElementById('btn-add-blog');
  const btnAddPortfolio = document.getElementById('btn-add-portfolio');
  
  if (btnAddBlog) {
    btnAddBlog.addEventListener('click', () => openCmsEditor('blog', 'add'));
  }
  if (btnAddPortfolio) {
    btnAddPortfolio.addEventListener('click', () => openCmsEditor('portfolio', 'add'));
  }

  const btnOverviewViewAll = document.getElementById('btn-overview-view-all');
  if (btnOverviewViewAll) {
    btnOverviewViewAll.addEventListener('click', () => {
      const tab = document.querySelector('[data-cms-target="cms-applicants-view"]');
      if (tab) tab.click();
    });
  }

  const closeEditorBtn = document.getElementById('close-editor-dialog-btn');
  const cancelEditorBtn = document.getElementById('cms-editor-cancel');
  const editorDialog = document.getElementById('cms-editor-dialog');

  if (closeEditorBtn) closeEditorBtn.addEventListener('click', closeCmsEditor);
  if (cancelEditorBtn) cancelEditorBtn.addEventListener('click', closeCmsEditor);
  
  if (editorDialog) {
    editorDialog.addEventListener('cancel', () => {
      document.body.classList.remove('dialog-open');
    });
  }

  const editorForm = document.getElementById('cms-editor-form');
  if (editorForm) {
    editorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const type = editorForm.getAttribute('data-type');
      const mode = editorForm.getAttribute('data-mode');
      
      playRoboticSound('success');
      
      if (type === 'blog') {
        const titleVal = document.getElementById('edit-title').value.trim();
        const catVal = document.getElementById('edit-category').value;
        const authVal = document.getElementById('edit-author').value.trim();
        const excVal = document.getElementById('edit-excerpt').value.trim();
        const conVal = document.getElementById('edit-content').value.trim();
        const headerImgVal = document.getElementById('edit-header-image').value.trim();

        if (mode === 'add') {
          const newId = state.blogArticles.length > 0 ? Math.max(...state.blogArticles.map(a => a.id)) + 1 : 1;
          const today = new Date();
          const formatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
          const dateStr = today.toLocaleDateString('id-ID', formatOptions);

          state.blogArticles.push({
            id: newId,
            title: titleVal,
            category: catVal,
            author: authVal,
            date: dateStr,
            excerpt: excVal,
            content: conVal,
            headerImage: headerImgVal
          });
        } else if (mode === 'edit') {
          const id = editorForm.getAttribute('data-id');
          const article = state.blogArticles.find(a => String(a.id) === String(id));
          if (article) {
            article.title = titleVal;
            article.category = catVal;
            article.author = authVal;
            article.excerpt = excVal;
            article.content = conVal;
            article.headerImage = headerImgVal;
          }
        }
        saveData('robotik_blog', state.blogArticles);
        renderAdminBlogTable();
        
      } else if (type === 'portfolio') {
        const titleVal = document.getElementById('edit-title').value.trim();
        const catVal = document.getElementById('edit-category').value;
        const statVal = document.getElementById('edit-status').value;
        const creatVal = document.getElementById('edit-creators').value.trim();
        const descVal = document.getElementById('edit-description').value.trim();
        const headerImgVal = document.getElementById('edit-header-image').value.trim();
        const isWinnerVal = document.getElementById('edit-is-winner').checked;
        const awardNameVal = isWinnerVal ? document.getElementById('edit-award-name').value.trim() : '';

        if (mode === 'add') {
          const newId = state.portfolioProjects.length > 0 ? Math.max(...state.portfolioProjects.map(p => p.id)) + 1 : 1;
          state.portfolioProjects.push({
            id: newId,
            title: titleVal,
            category: catVal,
            status: statVal,
            creators: creatVal,
            description: descVal,
            headerImage: headerImgVal,
            isWinner: isWinnerVal,
            awardName: awardNameVal
          });
        } else if (mode === 'edit') {
          const id = editorForm.getAttribute('data-id');
          const proj = state.portfolioProjects.find(p => String(p.id) === String(id));
          if (proj) {
            proj.title = titleVal;
            proj.category = catVal;
            proj.status = statVal;
            proj.creators = creatVal;
            proj.description = descVal;
            proj.headerImage = headerImgVal;
            proj.isWinner = isWinnerVal;
            proj.awardName = awardNameVal;
          }
        }

        saveData('robotik_portfolio', state.portfolioProjects);
        renderAdminPortfolioTable();
      }

      closeCmsEditor();
    });
  }
}

function formatRegistrationDate(applicant) {
  if (applicant && applicant.timestamp) {
    const dateObj = new Date(applicant.timestamp);
    if (!isNaN(dateObj.getTime())) {
      const pad = (n) => String(n).padStart(2, '0');
      const yyyy = dateObj.getFullYear();
      const mm = pad(dateObj.getMonth() + 1);
      const dd = pad(dateObj.getDate());
      const hh = pad(dateObj.getHours());
      const min = pad(dateObj.getMinutes());
      const ss = pad(dateObj.getSeconds());
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    }
  }
  return (applicant && applicant.tanggalDaftar) ? applicant.tanggalDaftar : '-';
}

// --- DASHBOARD OVERVIEW ---
function renderDashboardOverview() {
  const totalApps = document.getElementById('stat-total-applicants');
  const pendApps = document.getElementById('stat-pending-applicants');
  const totalArt = document.getElementById('stat-total-articles');
  const totalProj = document.getElementById('stat-total-projects');
  
  if (totalApps) totalApps.textContent = state.applicants.length;
  if (pendApps) pendApps.textContent = state.applicants.filter(a => a.status === 'Pending').length;
  if (totalArt) totalArt.textContent = state.blogArticles.length;
  if (totalProj) totalProj.textContent = state.portfolioProjects.length;
  
  const recentTable = document.getElementById('overview-recent-applicants-table');
  if (recentTable) {
    const recent = state.applicants
      .filter(a => a.status === 'Pending')
      .sort((a, b) => {
        const dateA = new Date(a.timestamp || a.tanggalDaftar || 0).getTime();
        const dateB = new Date(b.timestamp || b.tanggalDaftar || 0).getTime();
        return dateB - dateA; // descending: pendaftar terbaru di atas
      });
    if (recent.length === 0) {
      recentTable.innerHTML = '<tr><td colspan="3" style="text-align:center; color: var(--text-muted); padding:1rem;">Tidak ada pendaftar baru yang menunggu persetujuan.</td></tr>';
    } else {
      recentTable.innerHTML = recent.map(app => `
        <tr>
          <td style="font-weight:600;">${escapeHtml(app.nama)}</td>
          <td>${escapeHtml(app.kelas)}</td>
          <td><span class="status-badge status-pending">Menunggu Persetujuan</span></td>
        </tr>
      `).join('');
    }
  }
}

// --- RENDER TABLES ---
function renderAdminBlogTable() {
  const tableBody = document.getElementById('admin-blog-table-body');
  if (!tableBody) return;

  if (state.blogArticles.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Tidak ada artikel blog. Silakan tambah baru.</td></tr>`;
    return;
  }

  tableBody.innerHTML = state.blogArticles.map((article, index) => `
    <tr>
      <td>${index + 1}</td>
      <td style="font-weight: 600; color: var(--text-white);">${escapeHtml(article.title)}</td>
      <td><span class="table-badge">${escapeHtml(article.category.toUpperCase())}</span></td>
      <td>${escapeHtml(article.date || '-')}</td>
      <td>
        <div class="action-buttons-group">
          <button class="btn btn-outline-cyan btn-sm edit-blog-btn" data-id="${article.id}" aria-label="Ubah Artikel" title="Ubah Artikel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn btn-delete-action btn-sm delete-blog-btn" data-id="${article.id}" aria-label="Hapus Artikel" title="Hapus Artikel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.edit-blog-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openCmsEditor('blog', 'edit', id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  document.querySelectorAll('.delete-blog-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (await customConfirm('Apakah Anda yakin ingin menghapus artikel blog ini?')) {
        playRoboticSound('click');
        state.blogArticles = state.blogArticles.filter(a => String(a.id) !== String(id));
        saveData('robotik_blog', state.blogArticles);
        renderAdminBlogTable();
      } else {
        playRoboticSound('error');
      }
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });
}

function renderAdminPortfolioTable() {
  const tableBody = document.getElementById('admin-portfolio-table-body');
  if (!tableBody) return;

  if (state.portfolioProjects.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Tidak ada proyek portfolio. Silakan tambah baru.</td></tr>`;
    return;
  }

  tableBody.innerHTML = state.portfolioProjects.map((proj, index) => `
    <tr>
      <td>${index + 1}</td>
      <td style="font-weight: 600; color: var(--text-white);">
        ${proj.isWinner ? '<span style="color: #fbbf24; margin-right: 4px;" title="Pemenang Lomba">🏆</span>' : ''}
        ${escapeHtml(proj.title)}
      </td>
      <td><span class="table-badge">${escapeHtml(proj.category.toUpperCase())}</span></td>
      <td><span class="portfolio-badge badge-${proj.status === 'Selesai' ? 'success' : 'progress'}">${escapeHtml(proj.status)}</span></td>
      <td>
        <div class="action-buttons-group">
          <button class="btn btn-outline-cyan btn-sm edit-portfolio-btn" data-id="${proj.id}" aria-label="Ubah Proyek" title="Ubah Proyek">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn btn-delete-action btn-sm delete-portfolio-btn" data-id="${proj.id}" aria-label="Hapus Proyek" title="Hapus Proyek">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.edit-portfolio-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openCmsEditor('portfolio', 'edit', id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  document.querySelectorAll('.delete-portfolio-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (await customConfirm('Apakah Anda yakin ingin menghapus proyek portfolio ini?')) {
        playRoboticSound('click');
        state.portfolioProjects = state.portfolioProjects.filter(p => String(p.id) !== String(id));
        saveData('robotik_portfolio', state.portfolioProjects);
        renderAdminPortfolioTable();
      } else {
        playRoboticSound('error');
      }
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });
}

function renderAdminApplicantsTable() {
  const tableBody = document.getElementById('admin-applicants-table-body');
  if (!tableBody) return;

  const searchInput = document.getElementById('search-applicants');
  const statusSelect = document.getElementById('filter-applicant-status');
  
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const statusFilter = statusSelect ? statusSelect.value : 'ALL';

  // Update sort icons dynamically
  const fields = ['nama', 'kelas', 'timestamp', 'status'];
  fields.forEach(field => {
    const iconEl = document.getElementById(`sort-icon-${field}`);
    if (iconEl) {
      if (currentSortField === field) {
        iconEl.innerHTML = currentSortOrder === 'asc' 
          ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="3.5" style="vertical-align: middle; margin-left: 4px; display: inline-block;"><polyline points="18 15 12 9 6 15"></polyline></svg>`
          : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="3.5" style="vertical-align: middle; margin-left: 4px; display: inline-block;"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
      } else {
        iconEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="vertical-align: middle; margin-left: 4px; opacity: 0.3; display: inline-block;"><polyline points="7 15 12 20 17 15"></polyline><polyline points="7 9 12 4 17 9"></polyline></svg>`;
      }
    }
  });

  const filtered = state.applicants.filter(app => {
    const matchesSearch = (app.nama || '').toLowerCase().includes(query) || (app.id || '').toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let comparison = 0;
    if (currentSortField === 'nama') {
      const valA = (a.nama || '').toString().toLowerCase();
      const valB = (b.nama || '').toString().toLowerCase();
      comparison = valA.localeCompare(valB);
    } else if (currentSortField === 'kelas') {
      const valA = (a.kelas || '').toString().toLowerCase();
      const valB = (b.kelas || '').toString().toLowerCase();
      comparison = valA.localeCompare(valB);
    } else if (currentSortField === 'status') {
      const valA = (a.status || '').toString().toLowerCase();
      const valB = (b.status || '').toString().toLowerCase();
      comparison = valA.localeCompare(valB);
    } else { // default or 'timestamp'
      const dateA = new Date(a.timestamp || a.tanggalDaftar || 0).getTime();
      const dateB = new Date(b.timestamp || b.tanggalDaftar || 0).getTime();
      comparison = dateA - dateB;
    }
    return currentSortOrder === 'asc' ? comparison : -comparison;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Tidak ada pendaftar yang cocok dengan filter.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map((applicant, index) => {
    let statusClass = 'status-pending';
    let statusLabel = 'Menunggu Persetujuan';
    
    if (applicant.status === 'Diterima') {
      statusClass = 'status-approved';
      statusLabel = 'Diterima';
    } else if (applicant.status === 'Ditolak') {
      statusClass = 'status-rejected';
      statusLabel = 'Ditolak';
    }

    const showLihatKartu = applicant.status === 'Diterima' 
      ? `<button class="btn btn-outline-cyan btn-sm btn-view-card" data-id="${applicant.id}" title="Lihat Kartu">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="7" y1="8" x2="17" y2="8"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="7" y1="16" x2="13" y2="16"></line></svg>
         </button>`
      : '';

    const showActions = applicant.status === 'Pending'
      ? `<button class="btn btn-green btn-sm btn-approve" data-id="${applicant.id}" title="Setujui">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
         </button>
         <button class="btn btn-reject btn-sm btn-reject" data-id="${applicant.id}" title="Tolak">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
         </button>`
      : '';

    return `
      <tr>
        <td>${index + 1}</td>
        <td style="font-weight: 600; color: var(--text-white);">${escapeHtml(applicant.nama)}</td>
        <td>${escapeHtml(applicant.kelas)}</td>
        <td>${escapeHtml(applicant.noHp)}</td>
        <td>${escapeHtml(formatRegistrationDate(applicant))}</td>
        <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
        <td style="width: 1%; white-space: nowrap;">
          <div class="action-buttons-group">
            <button class="btn btn-outline-cyan btn-sm btn-view-detail" data-id="${applicant.id}" title="Detail">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            ${showActions}
            ${showLihatKartu}
            <button class="btn btn-delete-action btn-sm btn-delete" data-id="${applicant.id}" aria-label="Hapus Pendaftar" title="Hapus">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  tableBody.querySelectorAll('.btn-approve').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      approveApplicant(id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  tableBody.querySelectorAll('.btn-reject').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      rejectApplicant(id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  tableBody.querySelectorAll('.btn-view-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      viewApplicantCard(id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  tableBody.querySelectorAll('.btn-view-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      viewApplicantDetail(id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  tableBody.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      deleteApplicant(id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });
}

async function approveApplicant(id) {
  const applicant = state.applicants.find(a => a.id === id);
  if (!applicant) return;

  if (await customConfirm(`Apakah Anda yakin ingin menyetujui pendaftaran ${applicant.nama}?`)) {
    const idx = state.applicants.findIndex(a => a.id === id);
    if (idx !== -1) {
      const originalStatus = state.applicants[idx].status;
      playRoboticSound('success');
      state.applicants[idx].status = 'Diterima';
      saveData('robotik_applicants', state.applicants);
      renderAdminApplicantsTable();
      renderDashboardOverview();

      if (state.useFirebase) {
        state.db.collection('applicants').doc(id).update({ status: 'Diterima' })
          .then(() => console.log("Applicant approval successfully synced to Cloud Firestore!"))
          .catch(async (err) => {
            console.error("Firestore approval sync failed:", err);
            state.applicants[idx].status = originalStatus;
            saveData('robotik_applicants', state.applicants);
            renderAdminApplicantsTable();
            renderDashboardOverview();
            await customAlert('⚠️ Gagal menyetujui di Cloud Database: ' + err.message);
          });
      }
    }
  } else {
    playRoboticSound('error');
  }
}

async function rejectApplicant(id) {
  const applicant = state.applicants.find(a => a.id === id);
  if (!applicant) return;

  if (await customConfirm(`Apakah Anda yakin ingin menolak pendaftaran ${applicant.nama}?`)) {
    const idx = state.applicants.findIndex(a => a.id === id);
    if (idx !== -1) {
      const originalStatus = state.applicants[idx].status;
      playRoboticSound('error');
      state.applicants[idx].status = 'Ditolak';
      saveData('robotik_applicants', state.applicants);
      renderAdminApplicantsTable();
      renderDashboardOverview();

      if (state.useFirebase) {
        state.db.collection('applicants').doc(id).update({ status: 'Ditolak' })
          .then(() => console.log("Applicant rejection successfully synced to Cloud Firestore!"))
          .catch(async (err) => {
            console.error("Firestore rejection sync failed:", err);
            state.applicants[idx].status = originalStatus;
            saveData('robotik_applicants', state.applicants);
            renderAdminApplicantsTable();
            renderDashboardOverview();
            await customAlert('⚠️ Gagal menolak di Cloud Database: ' + err.message);
          });
      }
    }
  } else {
    playRoboticSound('error');
  }
}

async function deleteApplicant(id) {
  const idx = state.applicants.findIndex(a => a.id === id);
  if (idx !== -1) {
    if (await customConfirm(`Apakah Anda yakin ingin menghapus data pendaftar ${state.applicants[idx].nama}?`)) {
      const originalApplicant = { ...state.applicants[idx] };
      playRoboticSound('click');
      state.applicants.splice(idx, 1);
      saveData('robotik_applicants', state.applicants);
      renderAdminApplicantsTable();
      renderDashboardOverview();

      if (state.useFirebase) {
        state.db.collection('applicants').doc(id).delete()
          .then(() => console.log("Applicant deletion successfully synced to Cloud Firestore!"))
          .catch(async (err) => {
            console.error("Firestore deletion sync failed:", err);
            state.applicants.splice(idx, 0, originalApplicant);
            saveData('robotik_applicants', state.applicants);
            renderAdminApplicantsTable();
            renderDashboardOverview();
            await customAlert('⚠️ Gagal menghapus di Cloud Database: ' + err.message);
          });
      }
    } else {
      playRoboticSound('error');
    }
  }
}

function viewApplicantCard(id) {
  const applicant = state.applicants.find(a => a.id === id);
  if (!applicant) return;

  const container = document.getElementById('admin-card-preview-container');
  if (!container) return;

  container.innerHTML = generateStudentCardHtml(applicant.nama, applicant.kelas, applicant.id);

  const dialog = document.getElementById('admin-card-preview-dialog');
  if (dialog) {
    playRoboticSound('success');
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }
}

function viewApplicantDetail(id) {
  const applicant = state.applicants.find(a => a.id === id);
  if (!applicant) return;

  const container = document.getElementById('admin-applicant-detail-container');
  const footer = document.getElementById('admin-detail-dialog-footer');
  if (!container || !footer) return;

  let statusClass = 'status-pending';
  let statusLabel = 'Menunggu Persetujuan';
  if (applicant.status === 'Diterima') {
    statusClass = 'status-approved';
    statusLabel = 'Diterima';
  } else if (applicant.status === 'Ditolak') {
    statusClass = 'status-rejected';
    statusLabel = 'Ditolak';
  }

  let customQuestionsHtml = '';
  if (state.regSettings.customQuestions && state.regSettings.customQuestions.length > 0) {
    customQuestionsHtml = `<h4 style="color: var(--accent-cyan); margin-top: 1.5rem; margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.25rem;">Jawaban Pertanyaan Kustom</h4>`;
    state.regSettings.customQuestions.forEach(q => {
      const ans = applicant.customAnswers && applicant.customAnswers[q.id] 
        ? applicant.customAnswers[q.id] 
        : '-';
      customQuestionsHtml += `
        <div style="margin-bottom: 0.75rem;">
          <strong style="color: var(--text-muted); font-size: 0.85rem; display: block;">${escapeHtml(q.label)}</strong>
          <span style="color: var(--text-white); font-size: 0.95rem;">${escapeHtml(ans)}</span>
        </div>
      `;
    });
  }

  container.innerHTML = `
    <div class="applicant-detail-grid">
      <span style="color: var(--text-muted);">ID Pendaftaran:</span>
      <strong style="color: var(--accent-cyan); font-family: monospace;">${escapeHtml(applicant.id)}</strong>

      <span style="color: var(--text-muted);">Nama Lengkap:</span>
      <span style="color: var(--text-white); font-weight: 600;">${escapeHtml(applicant.nama)}</span>

      <span style="color: var(--text-muted);">Kelas:</span>
      <span style="color: var(--text-white);">Kelas ${escapeHtml(applicant.kelas)}</span>

      <span style="color: var(--text-muted);">Email:</span>
      <span style="color: var(--text-white);">${escapeHtml(applicant.email)}</span>

      <span style="color: var(--text-muted);">No. WhatsApp:</span>
      <span style="color: var(--text-white);">${escapeHtml(applicant.noHp)}</span>

      <span style="color: var(--text-muted);">Punya Laptop:</span>
      <span style="color: var(--text-white);">${escapeHtml(applicant.laptop || 'Tidak')}</span>

      <span style="color: var(--text-muted);">Tanggal Daftar:</span>
      <span style="color: var(--text-white);">${escapeHtml(formatRegistrationDate(applicant))}</span>

      <span style="color: var(--text-muted);">Status:</span>
      <span><span class="status-badge ${statusClass}">${statusLabel}</span></span>
    </div>

    <div style="margin-top: 1rem;">
      <strong style="color: var(--text-muted); font-size: 0.85rem; display: block; margin-bottom: 0.25rem;">Motivasi Bergabung:</strong>
      <p style="color: var(--text-white); font-size: 0.95rem; line-height: 1.6; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 6px; white-space: pre-wrap; margin: 0;">${escapeHtml(applicant.motivasi)}</p>
    </div>

    ${customQuestionsHtml}
  `;

  // Render footer actions dynamically based on applicant status
  let actionButtonsHtml = '';
  if (applicant.status === 'Pending') {
    actionButtonsHtml = `
      <button type="button" class="btn btn-green dialog-approve-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>Setujui</span>
      </button>
      <button type="button" class="btn btn-reject dialog-reject-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        <span>Tolak</span>
      </button>
    `;
  }

  footer.innerHTML = `
    ${actionButtonsHtml}
    <button type="button" class="btn btn-cyan dialog-close-btn">Tutup</button>
  `;

  const dialog = document.getElementById('admin-applicant-detail-dialog');
  if (dialog) {
    // Add event listeners for dynamic buttons inside footer
    const closeBtn = footer.querySelector('.dialog-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        playRoboticSound('click');
        dialog.close();
      };
    }

    const approveBtn = footer.querySelector('.dialog-approve-btn');
    if (approveBtn) {
      approveBtn.onclick = async () => {
        dialog.close();
        await approveApplicant(id);
      };
    }

    const rejectBtn = footer.querySelector('.dialog-reject-btn');
    if (rejectBtn) {
      rejectBtn.onclick = async () => {
        dialog.close();
        await rejectApplicant(id);
      };
    }

    playRoboticSound('click');
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }
}

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
          <div class="card-name">${escapeHtml(nama)}</div>
          <div class="card-class">KELAS ${escapeHtml(kelas)}</div>
          <div class="card-id-row">NIM/ID: <span>${escapeHtml(regId)}</span></div>
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

// --- CMS EDITORS (BLOG & PORTFOLIO) ---
function openCmsEditor(type, mode, id = null) {
  playRoboticSound('click');
  const dialog = document.getElementById('cms-editor-dialog');
  const form = document.getElementById('cms-editor-form');
  const title = document.getElementById('cms-dialog-title');
  const container = document.getElementById('cms-form-fields-container');

  form.setAttribute('data-type', type);
  form.setAttribute('data-mode', mode);
  if (id) form.setAttribute('data-id', id);

  let currentItem = {};

  if (type === 'blog') {
    title.textContent = mode === 'add' ? 'Tambah Artikel Blog Baru' : 'Ubah Artikel Blog';
    const article = mode === 'edit' ? (state.blogArticles.find(a => String(a.id) === String(id)) || {}) : {};
    currentItem = article;
    
    container.innerHTML = `
      <div class="form-group">
        <label class="form-label" for="edit-title">Judul Artikel <span>*</span></label>
        <input type="text" id="edit-title" class="input-control" required value="${article.title || ''}" placeholder="Masukkan judul menarik...">
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-category">Kategori <span>*</span></label>
        <select id="edit-category" class="input-control" required style="appearance: auto;">
          <option value="arduino" ${article.category === 'arduino' ? 'selected' : ''}>Arduino</option>
          <option value="tutorial" ${article.category === 'tutorial' ? 'selected' : ''}>Tutorial Perakitan</option>
          <option value="iot" ${article.category === 'iot' ? 'selected' : ''}>IoT (Internet of Things)</option>
          <option value="kompetisi" ${article.category === 'kompetisi' ? 'selected' : ''}>Tips Kompetisi</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-author">Penulis <span>*</span></label>
        <input type="text" id="edit-author" class="input-control" required value="${article.author || 'Tim Mentor Robotik'}" placeholder="Nama penulis atau mentor...">
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-header-image">URL Gambar Header (Foto Sampul)</label>
        <div style="display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.5rem;">
          <input type="text" id="edit-header-image" class="input-control" value="${article.headerImage || ''}" placeholder="Tautan foto Unsplash, Imgur, atau URL gambar..." style="flex: 1; margin-bottom: 0;">
          <button type="button" id="btn-upload-local" class="btn btn-secondary" style="white-space: nowrap; height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem; padding: 0.5rem 0.75rem; font-size: 0.85rem;">
            Pilih File
          </button>
        </div>
        <input type="file" id="edit-image-file" accept="image/*" style="display: none;">
        <div id="upload-preview-container" style="display: flex; gap: 1rem; align-items: center; margin-top: 0.5rem;">
          <div class="img-upload-preview" id="edit-image-preview"></div>
          <span id="upload-status" style="font-size: 0.8rem; color: var(--text-muted);"></span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-excerpt">Ringkasan Singkat (Excerpt) <span>*</span></label>
        <textarea id="edit-excerpt" class="input-control" required placeholder="Tulis deskripsi 1-2 baris untuk kartu list artikel...">${article.excerpt || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Konten Lengkap <span>*</span></label>
        <div class="rich-editor-container" style="border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-md); overflow: hidden; background: rgba(15, 23, 42, 0.3);">
          <div class="rich-toolbar" style="display: flex; gap: 0.35rem; background: rgba(2, 6, 23, 0.6); border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding: 0.5rem; flex-wrap: wrap; align-items: center;">
            <button type="button" class="btn btn-secondary btn-sm rich-btn" data-cmd="bold" title="Tebal" style="padding: 0.35rem 0.6rem; min-height: auto; font-size: 0.8rem; font-weight: bold;">B</button>
            <button type="button" class="btn btn-secondary btn-sm rich-btn" data-cmd="italic" title="Miring" style="padding: 0.35rem 0.6rem; min-height: auto; font-size: 0.8rem; font-style: italic;">I</button>
            <button type="button" class="btn btn-secondary btn-sm rich-btn" data-cmd="underline" title="Garis Bawah" style="padding: 0.35rem 0.6rem; min-height: auto; font-size: 0.8rem; text-decoration: underline;">U</button>
            <span style="width: 1px; height: 18px; background: rgba(255,255,255,0.15); margin: 0 0.2rem;"></span>
            <button type="button" class="btn btn-secondary btn-sm rich-btn" data-cmd="formatBlock" data-val="h3" title="Heading H3" style="padding: 0.35rem 0.5rem; min-height: auto; font-size: 0.8rem;">H3</button>
            <button type="button" class="btn btn-secondary btn-sm rich-btn" data-cmd="formatBlock" data-val="h4" title="Heading H4" style="padding: 0.35rem 0.5rem; min-height: auto; font-size: 0.8rem;">H4</button>
            <button type="button" class="btn btn-secondary btn-sm rich-btn" data-cmd="formatBlock" data-val="p" title="Paragraf Biasa" style="padding: 0.35rem 0.5rem; min-height: auto; font-size: 0.8rem;">P</button>
            <span style="width: 1px; height: 18px; background: rgba(255,255,255,0.15); margin: 0 0.2rem;"></span>
            <button type="button" class="btn btn-secondary btn-sm rich-btn" data-cmd="insertUnorderedList" title="Daftar Bulatan" style="padding: 0.35rem 0.5rem; min-height: auto; font-size: 0.8rem;">• List</button>
            <button type="button" class="btn btn-secondary btn-sm rich-btn" data-cmd="insertOrderedList" title="Daftar Angka" style="padding: 0.35rem 0.5rem; min-height: auto; font-size: 0.8rem;">1. List</button>
            <span style="width: 1px; height: 18px; background: rgba(255,255,255,0.15); margin: 0 0.2rem;"></span>
            <button type="button" class="btn btn-secondary btn-sm rich-btn" data-cmd="createLink" title="Tautan Link" style="padding: 0.35rem 0.5rem; min-height: auto; font-size: 0.8rem;">🔗 Tautan</button>
            <button type="button" class="btn btn-secondary btn-sm rich-btn" data-cmd="insertImage" title="Sisipkan Gambar" style="padding: 0.35rem 0.5rem; min-height: auto; font-size: 0.8rem;">📷 Foto</button>
            <button type="button" class="btn btn-secondary btn-sm rich-btn" data-cmd="removeFormat" title="Hapus Format" style="padding: 0.35rem 0.5rem; min-height: auto; font-size: 0.8rem;">🧹 Bersih</button>
          </div>
          <div id="edit-content-rich" contenteditable="true" class="input-control" style="height: 250px; overflow-y: auto; background: transparent; border: none; outline: none; padding: 1rem; color: var(--text-light); margin-bottom: 0; min-height: 200px;">
            ${parseMarkdownToHtml(article.content || '')}
          </div>
          <input type="hidden" id="edit-content" value="${escapeHtml(article.content || '')}">
        </div>
      </div>
    `;

  } else if (type === 'portfolio') {
    title.textContent = mode === 'add' ? 'Tambah Proyek Portfolio Baru' : 'Ubah Proyek Portfolio';
    const proj = mode === 'edit' ? (state.portfolioProjects.find(p => String(p.id) === String(id)) || {}) : {};
    currentItem = proj;

    container.innerHTML = `
      <div class="form-group">
        <label class="form-label" for="edit-title">Judul Proyek <span>*</span></label>
        <input type="text" id="edit-title" class="input-control" required value="${proj.title || ''}" placeholder="Contoh: Lengan Robot 4 DOF...">
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-category">Kategori Fokus <span>*</span></label>
        <select id="edit-category" class="input-control" required style="appearance: auto;">
          <option value="mekanik & elektronik" ${proj.category === 'mekanik & elektronik' ? 'selected' : ''}>Mekanik & Elektronik</option>
          <option value="iot" ${proj.category === 'iot' ? 'selected' : ''}>Internet of Things (IoT)</option>
          <option value="pemrograman" ${proj.category === 'pemrograman' ? 'selected' : ''}>Pemrograman Robot</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-status">Status Proyek <span>*</span></label>
        <select id="edit-status" class="input-control" required style="appearance: auto;">
          <option value="Selesai" ${proj.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
          <option value="Pengembangan" ${proj.status === 'Pengembangan' ? 'selected' : ''}>Pengembangan</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-creators">Pembuat Proyek Siswa <span>*</span></label>
        <input type="text" id="edit-creators" class="input-control" required value="${proj.creators || ''}" placeholder="Masukkan nama pembuat (Kelas)...">
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-header-image">URL Gambar Header (Foto Sampul)</label>
        <div style="display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.5rem;">
          <input type="text" id="edit-header-image" class="input-control" value="${proj.headerImage || ''}" placeholder="Tautan foto Unsplash, Imgur, atau URL gambar..." style="flex: 1; margin-bottom: 0;">
          <button type="button" id="btn-upload-local" class="btn btn-secondary" style="white-space: nowrap; height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem; padding: 0.5rem 0.75rem; font-size: 0.85rem;">
            Pilih File
          </button>
        </div>
        <input type="file" id="edit-image-file" accept="image/*" style="display: none;">
        <div id="upload-preview-container" style="display: flex; gap: 1rem; align-items: center; margin-top: 0.5rem;">
          <div class="img-upload-preview" id="edit-image-preview"></div>
          <span id="upload-status" style="font-size: 0.8rem; color: var(--text-muted);"></span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-description">Deskripsi Singkat Proyek <span>*</span></label>
        <textarea id="edit-description" class="input-control" required placeholder="Tulis ringkasan singkat 1-2 kalimat untuk kartu galeri..." style="height: 60px;">${proj.description || ''}</textarea>
      </div>
      <div class="form-group" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; margin-bottom: 0.5rem;">
        <input type="checkbox" id="edit-is-winner" style="width: 18px; height: 18px; cursor: pointer;" ${proj.isWinner ? 'checked' : ''}>
        <label class="form-label" for="edit-is-winner" style="margin-bottom: 0; cursor: pointer; font-weight: 600; color: var(--accent-cyan);">Pernah Menang Lomba / Prestasi?</label>
      </div>
      <div class="form-group" id="award-name-container" style="display: ${proj.isWinner ? 'block' : 'none'};">
        <label class="form-label" for="edit-award-name">Nama Penghargaan / Juara <span>*</span></label>
        <input type="text" id="edit-award-name" class="input-control" value="${proj.awardName || ''}" placeholder="Contoh: Juara 2 Robot Sepak Bola Regional...">
      </div>
    `;
  }

  // Toggle award name input visibility based on winner checkbox
  const isWinnerCheckbox = document.getElementById('edit-is-winner');
  const awardNameContainer = document.getElementById('award-name-container');
  const awardNameInput = document.getElementById('edit-award-name');
  if (isWinnerCheckbox && awardNameContainer && awardNameInput) {
    isWinnerCheckbox.addEventListener('change', () => {
      if (isWinnerCheckbox.checked) {
        awardNameContainer.style.display = 'block';
        awardNameInput.setAttribute('required', '');
      } else {
        awardNameContainer.style.display = 'none';
        awardNameInput.removeAttribute('required');
      }
    });
    // Ensure initial required status matches checked state
    if (isWinnerCheckbox.checked) {
      awardNameInput.setAttribute('required', '');
    } else {
      awardNameInput.removeAttribute('required');
    }
  }

  setupRichTextEditor();
  setupLocalImageUploader(currentItem);
  setupCmsHistory();

  dialog.showModal();
  document.body.classList.add('dialog-open');
}

function closeCmsEditor() {
  playRoboticSound('click');
  const dialog = document.getElementById('cms-editor-dialog');
  dialog.close();
  document.body.classList.remove('dialog-open');
}

// --- NATIVE RICH TEXT EDITOR ---
function setupRichTextEditor() {
  const richDiv = document.getElementById('edit-content-rich');
  const hiddenInput = document.getElementById('edit-content');
  if (!richDiv || !hiddenInput) return;

  // Sync contenteditable div content to hidden input (sanitized to prevent Stored XSS)
  richDiv.addEventListener('input', () => {
    hiddenInput.value = sanitizeRichHtml(richDiv.innerHTML);
    hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // Handle formatted command buttons
  const richButtons = document.querySelectorAll('.rich-btn');
  richButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (saveHistoryDebounceTimer) {
        captureCmsState(true);
      }
      
      playRoboticSound('click');
      const cmd = btn.getAttribute('data-cmd');
      const val = btn.getAttribute('data-val') || null;

      if (cmd === 'createLink') {
        const url = prompt('Masukkan URL Tautan:', 'https://');
        if (url) {
          document.execCommand(cmd, false, url);
        }
      } else if (cmd === 'insertImage') {
        const url = prompt('Masukkan URL Gambar:', 'https://');
        if (url) {
          document.execCommand(cmd, false, url);
          const images = richDiv.querySelectorAll('img');
          images.forEach(img => {
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';
            img.style.margin = '0.5rem 0';
          });
        }
      } else {
        document.execCommand(cmd, false, val);
      }

      // Sync and trigger event for CMS undo/redo stack
      hiddenInput.value = sanitizeRichHtml(richDiv.innerHTML);
      hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
      richDiv.focus();
      
      captureCmsState(true);
    });
  });
}

// --- CMS EDITOR STATE HISTORY MANAGER (UNDO/REDO) ---
let cmsHistoryStack = [];
let cmsRedoStack = [];
let lastSavedState = null;
let saveHistoryDebounceTimer = null;
let isRestoringCmsState = false;

function getCmsEditorState() {
  const stateObj = {};
  const inputs = document.querySelectorAll('#cms-editor-form [id^="edit-"]');
  inputs.forEach(input => {
    stateObj[input.id] = input.value;
  });
  return stateObj;
}

function restoreCmsEditorState(stateObj) {
  if (!stateObj) return;
  isRestoringCmsState = true;
  Object.keys(stateObj).forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.value = stateObj[id];
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Sync the rich text editor's visual editable area
      if (id === 'edit-content') {
        const richDiv = document.getElementById('edit-content-rich');
        if (richDiv) {
          richDiv.innerHTML = stateObj[id];
        }
      }
    }
  });
  isRestoringCmsState = false;
}

function captureCmsState(force = false) {
  const currentState = getCmsEditorState();
  const currentStateStr = JSON.stringify(currentState);
  
  if (lastSavedState && lastSavedState === currentStateStr) {
    return;
  }
  
  if (force) {
    if (saveHistoryDebounceTimer) {
      clearTimeout(saveHistoryDebounceTimer);
      saveHistoryDebounceTimer = null;
    }
    pushStateToHistory(currentState);
  } else {
    if (saveHistoryDebounceTimer) clearTimeout(saveHistoryDebounceTimer);
    saveHistoryDebounceTimer = setTimeout(() => {
      pushStateToHistory(currentState);
      saveHistoryDebounceTimer = null;
    }, 800);
    updateUndoRedoButtons();
  }
}

function pushStateToHistory(stateObj) {
  const stateStr = JSON.stringify(stateObj);
  if (lastSavedState === stateStr) return;

  cmsHistoryStack.push(stateObj);
  if (cmsHistoryStack.length > 50) {
    cmsHistoryStack.shift();
  }
  cmsRedoStack = [];
  lastSavedState = stateStr;
  
  updateUndoRedoButtons();
}

function undoCms() {
  if (saveHistoryDebounceTimer) {
    captureCmsState(true);
  }

  if (cmsHistoryStack.length <= 1) return;
  
  const poppedState = cmsHistoryStack.pop();
  cmsRedoStack.push(poppedState);
  
  const targetState = cmsHistoryStack[cmsHistoryStack.length - 1];
  restoreCmsEditorState(targetState);
  
  lastSavedState = JSON.stringify(targetState);
  updateUndoRedoButtons();
  playRoboticSound('click');
}

function redoCms() {
  if (cmsRedoStack.length === 0) return;
  
  const targetState = cmsRedoStack.pop();
  cmsHistoryStack.push(targetState);
  
  restoreCmsEditorState(targetState);
  lastSavedState = JSON.stringify(targetState);
  
  updateUndoRedoButtons();
  playRoboticSound('click');
}

function updateUndoRedoButtons() {
  const btnUndo = document.getElementById('btn-cms-undo');
  const btnRedo = document.getElementById('btn-cms-redo');

  if (btnUndo) {
    const canUndo = cmsHistoryStack.length > 1 || saveHistoryDebounceTimer !== null;
    btnUndo.disabled = !canUndo;
    btnUndo.style.opacity = canUndo ? '1' : '0.4';
    btnUndo.style.cursor = canUndo ? 'pointer' : 'not-allowed';
  }

  if (btnRedo) {
    const canRedo = cmsRedoStack.length > 0;
    btnRedo.disabled = !canRedo;
    btnRedo.style.opacity = canRedo ? '1' : '0.4';
    btnRedo.style.cursor = canRedo ? 'pointer' : 'not-allowed';
  }
}

function setupCmsHistory() {
  cmsHistoryStack = [];
  cmsRedoStack = [];
  lastSavedState = null;
  if (saveHistoryDebounceTimer) {
    clearTimeout(saveHistoryDebounceTimer);
    saveHistoryDebounceTimer = null;
  }

  const form = document.getElementById('cms-editor-form');
  if (!form) return;

  const initialState = getCmsEditorState();
  cmsHistoryStack.push(initialState);
  lastSavedState = JSON.stringify(initialState);

  if (!form.dataset.listenerAttached) {
    form.addEventListener('input', (e) => {
      if (isRestoringCmsState) return;
      if (e.target && e.target.id && e.target.id.startsWith('edit-')) {
        captureCmsState(false);
      }
    });
    form.dataset.listenerAttached = 'true';
  }

  const btnUndo = document.getElementById('btn-cms-undo');
  const btnRedo = document.getElementById('btn-cms-redo');

  if (btnUndo && !btnUndo.dataset.listenerAttached) {
    btnUndo.addEventListener('click', undoCms);
    btnUndo.dataset.listenerAttached = 'true';
  }
  if (btnRedo && !btnRedo.dataset.listenerAttached) {
    btnRedo.addEventListener('click', redoCms);
    btnRedo.dataset.listenerAttached = 'true';
  }

  updateUndoRedoButtons();
}

window.addEventListener('keydown', (e) => {
  const dialog = document.getElementById('cms-editor-dialog');
  if (!dialog || !dialog.open) return;

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

  if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    if (e.shiftKey) {
      redoCms();
    } else {
      undoCms();
    }
  } else if ((isCmdOrCtrl && e.key.toLowerCase() === 'y') || (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z')) {
    e.preventDefault();
    redoCms();
  }
});

// --- IMAGE COMPRESSOR & UPLOADER ---
function compressImage(file, callback) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      const maxBound = 800;
      if (width > maxBound) {
        height = Math.round((height * maxBound) / width);
        width = maxBound;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      callback(compressedDataUrl);
    };
  };
}

function setupLocalImageUploader(item) {
  const btnUploadLocal = document.getElementById('btn-upload-local');
  const editImageFile = document.getElementById('edit-image-file');
  const editHeaderImage = document.getElementById('edit-header-image');
  const editImagePreview = document.getElementById('edit-image-preview');
  const uploadStatus = document.getElementById('upload-status');

  if (item && editImagePreview && item.headerImage) {
    editImagePreview.style.backgroundImage = `url('${item.headerImage}')`;
    editImagePreview.style.display = 'block';
  }

  if (btnUploadLocal && editImageFile) {
    btnUploadLocal.addEventListener('click', () => {
      playRoboticSound('click');
      editImageFile.click();
    });

    editImageFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (uploadStatus) {
        uploadStatus.textContent = 'Mengompres gambar...';
        uploadStatus.style.color = 'var(--accent-cyan)';
      }

      compressImage(file, (base64Url) => {
        if (editHeaderImage) {
          editHeaderImage.value = base64Url;
          editHeaderImage.dispatchEvent(new Event('input'));
        }
        if (editImagePreview) {
          editImagePreview.style.backgroundImage = `url('${base64Url}')`;
          editImagePreview.style.display = 'block';
        }
        if (uploadStatus) {
          const sizeInKb = Math.round((base64Url.length * 3) / 4 / 1024);
          uploadStatus.textContent = `Sukses dikompres! (${sizeInKb} KB)`;
          uploadStatus.style.color = '#34D399';
        }
        playRoboticSound('success');
      });
    });
  }

  if (editHeaderImage && editImagePreview) {
    editHeaderImage.addEventListener('input', () => {
      const urlVal = editHeaderImage.value.trim();
      if (urlVal) {
        editImagePreview.style.backgroundImage = `url('${urlVal}')`;
        editImagePreview.style.display = 'block';
      } else {
        editImagePreview.style.backgroundImage = 'none';
        editImagePreview.style.display = 'none';
      }
    });
  }
}

// --- APPLICANTS FILTER & EXPORTER ---
function setupApplicantsFilterAndExport() {
  const searchInput = document.getElementById('search-applicants');
  const statusSelect = document.getElementById('filter-applicant-status');
  const btnExportCsv = document.getElementById('btn-export-applicants-csv');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderAdminApplicantsTable();
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      playRoboticSound('click');
      renderAdminApplicantsTable();
    });
  }

  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', async () => {
      playRoboticSound('click');
      await exportApplicantsToCsv();
    });
  }

  // Set up sorting header click event listeners
  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.getAttribute('data-sort');
      if (currentSortField === field) {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        currentSortField = field;
        currentSortOrder = 'asc';
      }
      playRoboticSound('click');
      renderAdminApplicantsTable();
    });
    th.addEventListener('mouseenter', () => {
      playRoboticSound('hover');
    });
  });
}

async function exportApplicantsToCsv() {
  if (state.applicants.length === 0) {
    await customAlert('Tidak ada data pendaftar untuk diekspor.');
    playRoboticSound('error');
    return;
  }

  const headers = ['No', 'ID Pendaftaran', 'Nama Lengkap', 'Kelas', 'Email', 'No. WhatsApp', 'Motivasi', 'Tanggal Daftar', 'Status'];
  const rows = state.applicants.map((app, index) => {
    return [
      index + 1,
      app.id || '',
      app.nama || '',
      app.kelas || '',
      app.email || '',
      app.noHp || '',
      (app.motivasi || '').replace(/\r?\n/g, ' '),
      app.tanggalDaftar || '',
      app.status || ''
    ];
  });

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(val => {
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join(';'))
  ].join('\r\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `pendaftar-robotik-${new Date().getFullYear()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  playRoboticSound('success');
}

// --- REGISTRATION SETTINGS CMS ---
function setupAdminRegSettings() {
  const statusToggle = document.getElementById('reg-status-toggle');
  const dateInput = document.getElementById('reg-countdown-date');
  const hourSelect = document.getElementById('reg-countdown-hour');
  const minuteSelect = document.getElementById('reg-countdown-minute');
  const regSettingsForm = document.getElementById('cms-reg-settings-form');

  if (regSettingsForm) {
    // Populate hour options (00 to 23)
    if (hourSelect && hourSelect.children.length === 0) {
      for (let i = 0; i < 24; i++) {
        const val = String(i).padStart(2, '0');
        hourSelect.add(new Option(val, val));
      }
    }

    // Populate minute options (00 to 59)
    if (minuteSelect && minuteSelect.children.length === 0) {
      for (let i = 0; i < 60; i++) {
        const val = String(i).padStart(2, '0');
        minuteSelect.add(new Option(val, val));
      }
    }

    if (statusToggle && dateInput) {
      const toggleCountdownTargetVisibility = () => {
        const targetGroup = dateInput.closest('.form-group');
        const targetLabel = document.getElementById('reg-countdown-label');
        const inputs = [dateInput, hourSelect, minuteSelect];

        if (statusToggle.value === 'closed') {
          if (targetGroup) targetGroup.style.display = 'block';
          if (targetLabel) targetLabel.textContent = 'Target Waktu Pembukaan';
          inputs.forEach(inp => {
            if (inp) {
              inp.disabled = false;
              inp.required = true;
            }
          });
        } else if (statusToggle.value === 'open') {
          if (targetGroup) targetGroup.style.display = 'block';
          if (targetLabel) targetLabel.textContent = 'Target Waktu Penutupan (Opsional)';
          inputs.forEach(inp => {
            if (inp) {
              inp.disabled = false;
              inp.required = false;
            }
          });
        } else {
          if (targetGroup) targetGroup.style.display = 'none';
          inputs.forEach(inp => {
            if (inp) {
              inp.disabled = true;
              inp.required = false;
            }
          });
        }
      };
      statusToggle.addEventListener('change', toggleCountdownTargetVisibility);
    }

    regSettingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      state.regSettings.isOpen = (statusToggle.value === 'open');
      state.regSettings.status = statusToggle.value;

      if (dateInput && hourSelect && minuteSelect) {
        if (dateInput.value) {
          state.regSettings.countdownTarget = `${dateInput.value}T${hourSelect.value}:${minuteSelect.value}`;
        } else {
          state.regSettings.countdownTarget = '';
        }
      }

      const headerCountdownToggle = document.getElementById('reg-header-countdown-toggle');
      if (headerCountdownToggle) {
        state.regSettings.showHeaderCountdown = headerCountdownToggle.checked;
      }

      const waTitleInput = document.getElementById('reg-wa-title');
      const waDescInput = document.getElementById('reg-wa-desc');
      const waLinkInput = document.getElementById('reg-wa-link');

      if (waTitleInput) state.regSettings.waTitle = waTitleInput.value.trim();
      if (waDescInput) state.regSettings.waDesc = waDescInput.value.trim();
      if (waLinkInput) state.regSettings.waLink = waLinkInput.value.trim();

      saveData('robotik_reg_settings', state.regSettings);

      if (state.useFirebase) {
        state.db.collection('settings').doc('registration').set(state.regSettings)
          .then(() => console.log("Registration settings successfully synced to Cloud Firestore!"))
          .catch(err => console.error("Firestore settings sync failed:", err));
      }

      playRoboticSound('success');
      showToast('Konfigurasi pendaftaran berhasil disimpan!');
    });
  }

  const btnAddQuestion = document.getElementById('btn-add-custom-question');
  const questionDialog = document.getElementById('custom-question-dialog');
  const questionForm = document.getElementById('custom-question-form');
  const questionTypeSelect = document.getElementById('question-type');
  const optionsGroup = document.getElementById('question-options-group');
  const btnCancelQuestion = document.getElementById('btn-cancel-question-dialog');
  const btnCloseQuestion = document.getElementById('close-question-dialog-btn');

  if (btnAddQuestion && questionDialog) {
    btnAddQuestion.addEventListener('click', () => {
      playRoboticSound('click');
      questionForm.reset();
      document.getElementById('edit-question-id').value = '';
      document.getElementById('question-dialog-title').textContent = 'Tambah Pertanyaan Baru';
      if (optionsGroup) optionsGroup.style.display = 'none';
      
      const optionsInput = document.getElementById('question-options');
      if (optionsInput) optionsInput.removeAttribute('required');

      questionDialog.showModal();
      document.body.classList.add('dialog-open');
    });
  }

  if (questionTypeSelect && optionsGroup) {
    questionTypeSelect.addEventListener('change', () => {
      const type = questionTypeSelect.value;
      const optionsInput = document.getElementById('question-options');
      
      if (type === 'radio' || type === 'select') {
        optionsGroup.style.display = 'block';
        if (optionsInput) optionsInput.setAttribute('required', 'required');
      } else {
        optionsGroup.style.display = 'none';
        if (optionsInput) optionsInput.removeAttribute('required');
      }
    });
  }

  const closeQuestionDialog = () => {
    playRoboticSound('click');
    if (questionDialog) questionDialog.close();
  };

  if (btnCancelQuestion) btnCancelQuestion.addEventListener('click', closeQuestionDialog);
  if (btnCloseQuestion) btnCloseQuestion.addEventListener('click', closeQuestionDialog);
  if (questionDialog) {
    questionDialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
    });
  }

  if (questionForm && questionDialog) {
    questionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const qIdInput = document.getElementById('edit-question-id');
      const labelInput = document.getElementById('question-label');
      const typeSelect = document.getElementById('question-type');
      const optionsInput = document.getElementById('question-options');
      const requiredCheckbox = document.getElementById('question-required');

      const label = labelInput.value.trim();
      const type = typeSelect.value;
      const required = requiredCheckbox.checked;
      let options = null;

      if (type === 'radio' || type === 'select') {
        options = optionsInput.value.split(',')
          .map(opt => opt.trim())
          .filter(opt => opt.length > 0);
        
        if (options.length === 0) {
          playRoboticSound('error');
          await customAlert('Silakan masukkan opsi pilihan yang valid (koma-dipisahkan) untuk tipe pertanyaan pilihan!');
          optionsInput.focus();
          return;
        }
      }

      const qId = qIdInput.value;
      if (!qId) {
        const newQuestion = {
          id: 'q-' + Date.now(),
          label: label,
          type: type,
          options: options,
          required: required
        };
        if (!state.regSettings.customQuestions) state.regSettings.customQuestions = [];
        state.regSettings.customQuestions.push(newQuestion);
      } else {
        const idx = state.regSettings.customQuestions.findIndex(q => q.id === qId);
        if (idx !== -1) {
          state.regSettings.customQuestions[idx] = {
            id: qId,
            label: label,
            type: type,
            options: options,
            required: required
          };
        }
      }

      saveData('robotik_reg_settings', state.regSettings);
      
      playRoboticSound('success');
      questionDialog.close();

      renderAdminQuestionsTable();
      showToast('Pertanyaan kustom berhasil disimpan!');
    });
  }
}

function populateRegSettingsCmsInputs() {
  const statusToggle = document.getElementById('reg-status-toggle');
  const dateInput = document.getElementById('reg-countdown-date');
  const hourSelect = document.getElementById('reg-countdown-hour');
  const minuteSelect = document.getElementById('reg-countdown-minute');

  if (statusToggle && dateInput && hourSelect && minuteSelect) {
    statusToggle.value = state.regSettings.status || (state.regSettings.isOpen ? 'open' : 'closed');
    let targetVal = state.regSettings.countdownTarget || '';
    if (targetVal.includes('T')) {
      const parts = targetVal.split('T');
      dateInput.value = parts[0];
      const timeParts = parts[1].split(':');
      if (timeParts.length >= 2) {
        hourSelect.value = timeParts[0];
        minuteSelect.value = timeParts[1];
      }
    } else {
      dateInput.value = '';
      hourSelect.value = '00';
      minuteSelect.value = '00';
    }

    // Initial visibility check
    const targetGroup = dateInput.closest('.form-group');
    const targetLabel = document.getElementById('reg-countdown-label');
    const inputs = [dateInput, hourSelect, minuteSelect];

    if (statusToggle.value === 'closed') {
      if (targetGroup) targetGroup.style.display = 'block';
      if (targetLabel) targetLabel.textContent = 'Target Waktu Pembukaan';
      inputs.forEach(inp => {
        if (inp) {
          inp.disabled = false;
          inp.required = true;
        }
      });
    } else if (statusToggle.value === 'open') {
      if (targetGroup) targetGroup.style.display = 'block';
      if (targetLabel) targetLabel.textContent = 'Target Waktu Penutupan (Opsional)';
      inputs.forEach(inp => {
        if (inp) {
          inp.disabled = false;
          inp.required = false;
        }
      });
    } else {
      if (targetGroup) targetGroup.style.display = 'none';
      inputs.forEach(inp => {
        if (inp) {
          inp.disabled = true;
          inp.required = false;
        }
      });
    }
  }

  const headerCountdownToggle = document.getElementById('reg-header-countdown-toggle');
  if (headerCountdownToggle) {
    headerCountdownToggle.checked = (state.regSettings.showHeaderCountdown !== false);
  }

  const waTitleInput = document.getElementById('reg-wa-title');
  const waDescInput = document.getElementById('reg-wa-desc');
  const waLinkInput = document.getElementById('reg-wa-link');

  if (waTitleInput) waTitleInput.value = state.regSettings.waTitle || '';
  if (waDescInput) waDescInput.value = state.regSettings.waDesc || '';
  if (waLinkInput) waLinkInput.value = state.regSettings.waLink || '';
}

function renderAdminQuestionsTable() {
  const tableBody = document.getElementById('admin-questions-table-body');
  if (!tableBody) return;

  if (!state.regSettings.customQuestions || state.regSettings.customQuestions.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Tidak ada pertanyaan kustom. Silakan tambah baru.</td></tr>`;
    return;
  }

  tableBody.innerHTML = state.regSettings.customQuestions.map((q, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td style="font-weight: 600; color: var(--text-white);">${escapeHtml(q.label)}</td>
      <td><span class="table-badge">${escapeHtml(q.type.toUpperCase())}</span></td>
      <td>${q.options ? escapeHtml(q.options.join(', ')) : '-'}</td>
      <td>
        <span class="table-badge" style="background: ${q.required ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.05)'}; color: ${q.required ? '#FACC15' : 'var(--text-muted)'}; font-weight: bold;">
          ${q.required ? 'YA' : 'TIDAK'}
        </span>
      </td>
      <td>
        <div class="action-buttons-group">
          <button type="button" class="btn btn-outline-cyan btn-sm edit-question-btn" data-id="${q.id}" title="Edit Pertanyaan">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button type="button" class="btn btn-delete-action btn-sm delete-question-btn" data-id="${q.id}" title="Hapus Pertanyaan">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  tableBody.querySelectorAll('.edit-question-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const qId = btn.getAttribute('data-id');
      const q = state.regSettings.customQuestions.find(item => item.id === qId);
      if (!q) return;

      playRoboticSound('click');
      
      document.getElementById('edit-question-id').value = q.id;
      document.getElementById('question-label').value = q.label;
      document.getElementById('question-type').value = q.type;
      
      const optionsInput = document.getElementById('question-options');
      const optionsGroup = document.getElementById('question-options-group');
      if (q.type === 'radio' || q.type === 'select') {
        if (optionsInput) {
          optionsInput.value = q.options ? q.options.join(', ') : '';
          optionsInput.setAttribute('required', 'required');
        }
        if (optionsGroup) optionsGroup.style.display = 'block';
      } else {
        if (optionsInput) {
          optionsInput.value = '';
          optionsInput.removeAttribute('required');
        }
        if (optionsGroup) optionsGroup.style.display = 'none';
      }

      document.getElementById('question-required').checked = q.required;
      document.getElementById('question-dialog-title').textContent = 'Ubah Pertanyaan Kustom';

      const questionDialog = document.getElementById('custom-question-dialog');
      if (questionDialog) {
        questionDialog.showModal();
        document.body.classList.add('dialog-open');
      }
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  tableBody.querySelectorAll('.delete-question-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const qId = btn.getAttribute('data-id');
      const qIdx = state.regSettings.customQuestions.findIndex(item => item.id === qId);
      if (qIdx === -1) return;

      const q = state.regSettings.customQuestions[qIdx];
      if (await customConfirm(`Apakah Anda yakin ingin menghapus pertanyaan kustom: "${q.label}"?`)) {
        playRoboticSound('click');
        state.regSettings.customQuestions.splice(qIdx, 1);
        saveData('robotik_reg_settings', state.regSettings);
        
        renderAdminQuestionsTable();
      } else {
        playRoboticSound('error');
      }
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });
}

// --- LANDING PAGE CMS ---
function setupLandingPageCMS() {
  const form = document.getElementById('cms-landing-form');
  if (!form) return;

  const achDialog = document.getElementById('custom-achievement-dialog');
  const achForm = document.getElementById('custom-achievement-form');
  const btnAddAch = document.getElementById('btn-add-custom-achievement');
  const btnCloseAch = document.getElementById('close-achievement-dialog-btn');
  const btnCancelAch = document.getElementById('btn-cancel-achievement-dialog');

  if (btnAddAch && achDialog) {
    btnAddAch.addEventListener('click', () => {
      playRoboticSound('click');
      document.getElementById('edit-achievement-idx').value = '';
      document.getElementById('achievement-juara').value = '';
      document.getElementById('achievement-organizer').value = '';
      document.getElementById('achievement-year').value = '';
      achDialog.showModal();
    });
  }

  const closeAchModal = () => {
    playRoboticSound('click');
    if (achDialog) achDialog.close();
  };

  if (btnCloseAch) btnCloseAch.addEventListener('click', closeAchModal);
  if (btnCancelAch) btnCancelAch.addEventListener('click', closeAchModal);

  if (achForm) {
    achForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const idxVal = document.getElementById('edit-achievement-idx').value;
      const juaraVal = document.getElementById('achievement-juara').value.trim();
      const organizerVal = document.getElementById('achievement-organizer').value.trim();
      const yearVal = document.getElementById('achievement-year').value.trim();

      if (!state.landingData.achievements) {
        state.landingData.achievements = [];
      }

      const achObj = { juara: juaraVal, organizer: organizerVal, year: yearVal };

      if (idxVal !== '') {
        const idx = parseInt(idxVal, 10);
        state.landingData.achievements[idx] = achObj;
      } else {
        state.landingData.achievements.push(achObj);
      }

      saveData('robotik_landing', state.landingData);
      renderAdminAchievementsTable();

      playRoboticSound('success');
      if (achDialog) achDialog.close();
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    playRoboticSound('click');

    const heroTagInput = document.getElementById('cms-hero-tag');
    const heroTitleInput = document.getElementById('cms-hero-title');
    const heroDescInput = document.getElementById('cms-hero-desc');
    const visiTextInput = document.getElementById('cms-visi-text');
    const divMechInput = document.getElementById('cms-div-mech-desc');
    const divElecInput = document.getElementById('cms-div-elec-desc');
    const divProgInput = document.getElementById('cms-div-prog-desc');
    
    const footerTaglineInput = document.getElementById('cms-footer-tagline');
    const footerLocationInput = document.getElementById('cms-footer-location');
    const footerEmailInput = document.getElementById('cms-footer-email');
    const footerInstagramInput = document.getElementById('cms-footer-instagram');
    const footerYoutubeInput = document.getElementById('cms-footer-youtube');

    const updatedMisi = [];
    for (let i = 1; i <= 4; i++) {
      const input = document.getElementById(`cms-misi-item-${i}`);
      if (input) updatedMisi.push(input.value.trim());
    }

    state.landingData = {
      heroTag: heroTagInput ? heroTagInput.value.trim() : '',
      heroTitle: heroTitleInput ? heroTitleInput.value.trim() : '',
      heroDesc: heroDescInput ? heroDescInput.value.trim() : '',
      visiText: visiTextInput ? visiTextInput.value.trim() : '',
      misiList: updatedMisi,
      divMechDesc: divMechInput ? divMechInput.value.trim() : '',
      divElecDesc: divElecInput ? divElecInput.value.trim() : '',
      divProgDesc: divProgInput ? divProgInput.value.trim() : '',
      achievements: state.landingData.achievements || [],
      footerTagline: footerTaglineInput ? footerTaglineInput.value.trim() : '',
      footerLocation: footerLocationInput ? footerLocationInput.value.trim() : '',
      footerEmail: footerEmailInput ? footerEmailInput.value.trim() : '',
      footerInstagram: footerInstagramInput ? footerInstagramInput.value.trim() : '',
      footerYoutube: footerYoutubeInput ? footerYoutubeInput.value.trim() : ''
    };

    saveData('robotik_landing', state.landingData);

    playRoboticSound('success');
    showToast('Konten landing page & footer berhasil diperbarui!');
  });
}

function renderAdminAchievementsTable() {
  const tableBody = document.getElementById('admin-achievements-table-body');
  if (!tableBody) return;

  if (!state.landingData.achievements || state.landingData.achievements.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Tidak ada data penghargaan & prestasi. Silakan tambah baru.</td></tr>`;
    return;
  }

  tableBody.innerHTML = state.landingData.achievements.map((ach, idx) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td style="font-weight: 600; color: var(--text-white); white-space: pre-wrap;">${escapeHtml(ach.juara || '')}</td>
      <td style="color: var(--text-muted);">${escapeHtml(ach.organizer || '')}</td>
      <td style="text-align: center;"><span class="table-badge" style="background: rgba(6,182,212,0.1); color: var(--accent-cyan); font-weight: bold; border: 1px solid rgba(6,182,212,0.2);">${escapeHtml(ach.year || '')}</span></td>
      <td style="text-align: center;">
        <div class="action-buttons-group" style="justify-content: center;">
          <button type="button" class="btn btn-outline-cyan btn-sm edit-ach-btn" data-index="${idx}" title="Edit Prestasi">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button type="button" class="btn btn-delete-action btn-sm delete-ach-btn" data-index="${idx}" title="Hapus Prestasi">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  tableBody.querySelectorAll('.edit-ach-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      const ach = state.landingData.achievements[idx];
      if (!ach) return;
      
      playRoboticSound('click');
      document.getElementById('edit-achievement-idx').value = idx;
      document.getElementById('achievement-juara').value = ach.juara || '';
      document.getElementById('achievement-organizer').value = ach.organizer || '';
      document.getElementById('achievement-year').value = ach.year || '';
      
      const dialog = document.getElementById('custom-achievement-dialog');
      if (dialog) dialog.showModal();
    });
  });

  tableBody.querySelectorAll('.delete-ach-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      if (await customConfirm('Apakah Anda yakin ingin menghapus penghargaan & prestasi ini?')) {
        playRoboticSound('click');
        state.landingData.achievements.splice(idx, 1);
        saveData('robotik_landing', state.landingData);
        renderAdminAchievementsTable();
      }
    });
  });
}

function populateLandingCmsInputs() {
  const heroTagInput = document.getElementById('cms-hero-tag');
  const heroTitleInput = document.getElementById('cms-hero-title');
  const heroDescInput = document.getElementById('cms-hero-desc');
  const visiTextInput = document.getElementById('cms-visi-text');
  const divMechInput = document.getElementById('cms-div-mech-desc');
  const divElecInput = document.getElementById('cms-div-elec-desc');
  const divProgInput = document.getElementById('cms-div-prog-desc');
  
  const footerTaglineInput = document.getElementById('cms-footer-tagline');
  const footerLocationInput = document.getElementById('cms-footer-location');
  const footerEmailInput = document.getElementById('cms-footer-email');
  const footerInstagramInput = document.getElementById('cms-footer-instagram');
  const footerYoutubeInput = document.getElementById('cms-footer-youtube');

  if (heroTagInput) heroTagInput.value = state.landingData.heroTag || '';
  if (heroTitleInput) heroTitleInput.value = state.landingData.heroTitle || '';
  if (heroDescInput) heroDescInput.value = state.landingData.heroDesc || '';
  if (visiTextInput) visiTextInput.value = state.landingData.visiText || '';

  if (state.landingData.misiList) {
    for (let i = 0; i < 4; i++) {
      const input = document.getElementById(`cms-misi-item-${i + 1}`);
      if (input) input.value = state.landingData.misiList[i] || '';
    }
  }

  if (divMechInput) divMechInput.value = state.landingData.divMechDesc || '';
  if (divElecInput) divElecInput.value = state.landingData.divElecDesc || '';
  if (divProgInput) divProgInput.value = state.landingData.divProgDesc || '';
  
  if (footerTaglineInput) footerTaglineInput.value = state.landingData.footerTagline || '';
  if (footerLocationInput) footerLocationInput.value = state.landingData.footerLocation || '';
  if (footerEmailInput) footerEmailInput.value = state.landingData.footerEmail || '';
  if (footerInstagramInput) footerInstagramInput.value = state.landingData.footerInstagram || '';
  if (footerYoutubeInput) footerYoutubeInput.value = state.landingData.footerYoutube || '';

  renderAdminAchievementsTable();
}

// --- INITIALIZE SYSTEM TELEMETRY (SIMULATED FOR STANDALONE) ---
function setupInteractiveCircuit() {
  const circuitBackground = document.querySelector('.bg-circuit-lines');
  if (!circuitBackground) return;

  if (window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      circuitBackground.style.transform = `translate(${x}px, ${y}px)`;
    });
  }
}

// --- BOOTSTRAP ---
document.addEventListener('DOMContentLoaded', async () => {
  // Asynchronously initialize Firebase before loading admin features
  await ensureFirebaseInitialized();

  // Check login state first (async: verifies HMAC session token)
  setupAuthStateListener();
  setupCmsAuthentication();
  setupCmsTabs();
  setupSubTabs();
  setupLocalImageUploader();
  setupApplicantsFilterAndExport();
  setupAdminRegSettings();
  setupLandingPageCMS();
  setupInteractiveCircuit();

  // Setup dialog backdrop click handlers
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
    });
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.close();
      }
    });
  });

  // Setup close buttons on achievement dialog
  const closePreviewBtn = document.getElementById('close-preview-dialog-btn');
  const previewDialog = document.getElementById('admin-card-preview-dialog');
  if (closePreviewBtn && previewDialog) {
    closePreviewBtn.addEventListener('click', () => {
      playRoboticSound('click');
      previewDialog.close();
    });
  }

  // Setup close buttons on applicant detail dialog
  const detailDialog = document.getElementById('admin-applicant-detail-dialog');
  const closeDetailDialogBtn = document.getElementById('close-detail-dialog-btn');
  const btnCloseDetailDialog = document.getElementById('btn-close-detail-dialog');
  
  if (detailDialog) {
    if (closeDetailDialogBtn) {
      closeDetailDialogBtn.addEventListener('click', () => {
        playRoboticSound('click');
        detailDialog.close();
      });
    }
    if (btnCloseDetailDialog) {
      btnCloseDetailDialog.addEventListener('click', () => {
        playRoboticSound('click');
        detailDialog.close();
      });
    }
  }

  // Setup Realtime Cloud Sync callbacks

  setupRealTimeRegSettingsSync((updatedRegSettings) => {
    populateRegSettingsCmsInputs();
    renderAdminQuestionsTable();
  });

  setupRealTimeLandingDataSync((updatedLandingData) => {
    populateLandingCmsInputs();
  });

  setupRealTimeBlogSync((updatedBlogArticles) => {
    renderAdminBlogTable();
    renderDashboardOverview();
  });

  setupRealTimePortfolioSync((updatedPortfolioProjects) => {
    renderAdminPortfolioTable();
    renderDashboardOverview();
  });
});
