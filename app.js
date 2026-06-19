import { 
  state, 
  saveData, 
  loadData, 
  playRoboticSound, 
  sanitizeInput, 
  escapeHtml, 
  parseMarkdownToHtml,
  sanitizeUrl,
  sanitizeHeroHtml,
  checkFormRateLimit,
  recordFormSubmission,
  customAlert,
  customConfirm,
  setupRealTimeRegSettingsSync,
  setupRealTimeLandingDataSync,
  syncBlogFromFirestore,
  syncPortfolioFromFirestore,
  setupRealTimeBlogSync,
  setupRealTimePortfolioSync
} from './shared.js';

// Central shared state shortcuts
let blogArticles = state.blogArticles;
let portfolioProjects = state.portfolioProjects;
let applicants = state.applicants;
let regSettings = state.regSettings;
let landingData = state.landingData;
const useFirebase = state.useFirebase;
const db = state.db;

// --- CLIENT-SIDE ROUTER ---
function setupRouter() {
  const navLinks = document.querySelectorAll('.nav-link');
  const views = document.querySelectorAll('.page-view');

  function navigateTo(targetViewId, scrollUp = true) {
    const activeView = document.querySelector('.page-view.active');
    if (activeView && activeView.id === targetViewId) return Promise.resolve();

    // Admin is now handled by admin.html with HMAC session tokens.
    if (targetViewId === 'view-admin') {
      window.location.href = './admin.html';
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const performTransition = () => {
        views.forEach(v => v.classList.remove('active'));
        navLinks.forEach(l => l.classList.remove('active'));

        const targetView = document.getElementById(targetViewId);
        if (targetView) {
          targetView.classList.add('active');
          window.history.pushState(null, '', `#${targetViewId.replace('view-', '')}`);

          const correspondingLink = document.querySelector(`.nav-link[data-target="${targetViewId}"]`);
          if (correspondingLink) {
            correspondingLink.classList.add('active');
          }

          const heading = targetView.querySelector('h1, h2');
          if (heading) {
            heading.setAttribute('tabindex', '-1');
            heading.focus();
          }
          
          if (scrollUp) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
        if (!document.startViewTransition) {
          resolve();
        }
      };

      if (document.startViewTransition) {
        const transition = document.startViewTransition(performTransition);
        transition.updateCallbackDone.then(resolve).catch(resolve);
      } else {
        performTransition();
      }
      
      playRoboticSound('click');
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('data-target');
      if (!target) return;
      e.preventDefault();
      navigateTo(target);
    });
    link.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  window.addEventListener('load', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`view-${hash}`)) {
      navigateTo(`view-${hash}`, false);
    }
  });

  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    if (document.getElementById(`view-${hash}`)) {
      navigateTo(`view-${hash}`, false);
    }
  });

  const brandLink = document.getElementById('brand-link');
  if (brandLink) {
    brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('view-home');
    });
  }

  window.appNavigate = navigateTo;
}

// --- PROGRAMMATIC INTERACTIVE EVENT HANDLERS ---
function setupInteractiveElements() {
  const heroDaftarBtn = document.getElementById('hero-btn-daftar');
  if (heroDaftarBtn) {
    heroDaftarBtn.addEventListener('click', () => {
      if (window.appNavigate) window.appNavigate('view-pendaftaran');
    });
  }

  const heroGaleriBtn = document.getElementById('hero-btn-galeri');
  if (heroGaleriBtn) {
    heroGaleriBtn.addEventListener('click', () => {
      if (window.appNavigate) window.appNavigate('view-portfolio');
    });
  }

  const successReloadBtn = document.getElementById('success-btn-reload');
  if (successReloadBtn) {
    successReloadBtn.addEventListener('click', () => {
      location.reload();
    });
  }

  document.querySelectorAll('.footer-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('data-target');
      if (target && window.appNavigate) {
        e.preventDefault();
        window.appNavigate(target);
      }
    });
  });

  document.querySelectorAll('.footer-div-link').forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      if (window.appNavigate) {
        await window.appNavigate('view-home');
        const divId = link.getAttribute('data-div');
        const container = document.getElementById('divisi-detail-container');
        if (container) {
          container.scrollIntoView({ behavior: 'smooth' });
        }
        const tabButton = document.querySelector(`.divisi-nav-btn[data-div="${divId}"]`);
        if (tabButton) {
          tabButton.click();
        }
      }
    });
  });

  const backToTopBtn = document.getElementById('btn-back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// --- PUBLIC BLOG PAGE CONTROLLER ---
let activeCategory = 'all';
let searchQuery = '';

function renderPublicArticles() {
  const blogContainer = document.getElementById('blog-grid');
  if (!blogContainer) return;


    const filtered = blogArticles.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery) ||
                          article.excerpt.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    blogContainer.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <path d="M12 2v3M8 3l1 2M16 3l-1 2M12 15h.01" stroke-linecap="round"/>
        </svg>
        <p>Tidak ada artikel robotika yang cocok dengan kriteria pencarian Anda.</p>
      </div>
    `;
    return;
  }

  blogContainer.innerHTML = filtered.map(article => `
    <article class="glass-card blog-card" style="view-transition-name: article-card-${parseInt(article.id) || 0}">
      <div class="blog-card-badge">${escapeHtml(article.category.toUpperCase())}</div>
      <div class="blog-card-content">
        <div class="blog-card-meta">${escapeHtml(article.date || 'Tgl Hilang')} | Oleh: ${escapeHtml(article.author || 'Tim Robotik')}</div>
        <h3 class="blog-card-title">${escapeHtml(article.title)}</h3>
        <p class="blog-card-excerpt">${escapeHtml(article.excerpt)}</p>
        <button class="btn btn-secondary btn-sm read-more-btn" data-id="${parseInt(article.id) || 0}">
          Baca Selengkapnya
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 6px;">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.read-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      openArticleDetail(id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });
}

// --- DYNAMIC TABLE OF CONTENTS GENERATOR ---
function generateTableOfContents(dialogElement) {
  const richText = dialogElement.querySelector('.dialog-rich-text');
  const tocContainer = dialogElement.querySelector('.dialog-toc-container');
  const tocList = dialogElement.querySelector('.toc-list');
  if (!richText || !tocContainer || !tocList) return;

  // Find all headings (h2 and h3) inside the rich text
  const headings = richText.querySelectorAll('h2, h3');
  if (headings.length === 0) {
    tocContainer.style.display = 'none';
    return;
  }

  // Clear previous list
  tocList.innerHTML = '';
  tocContainer.style.display = 'block';

  headings.forEach((heading, index) => {
    // Generate unique ID
    const headingId = `heading-${index}`;
    heading.setAttribute('id', headingId);
    heading.style.scrollMarginTop = '2rem'; // ensure scrolling has padding

    // Create TOC item
    const li = document.createElement('li');
    li.style.paddingLeft = heading.tagName === 'H3' ? '0.75rem' : '0';
    
    const a = document.createElement('a');
    a.href = `#${headingId}`;
    a.textContent = heading.textContent.replace(/[🤖💻🛠️📋🔗📷]/g, '').trim(); // strip emojis for cleaner menu
    a.style.color = heading.tagName === 'H3' ? 'var(--text-muted)' : 'var(--text-light)';
    a.style.textDecoration = 'none';
    a.style.transition = 'var(--transition-smooth)';
    a.style.display = 'block';
    a.style.lineHeight = '1.3';
    
    // Add active tracking state
    a.addEventListener('click', (e) => {
      e.preventDefault();
      playRoboticSound('click');
      
      // Smooth scroll inside dialog
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Set active visual state
      tocList.querySelectorAll('a').forEach(link => {
        link.style.color = link.parentNode.style.paddingLeft ? 'var(--text-muted)' : 'var(--text-light)';
        link.style.fontWeight = 'normal';
      });
      a.style.color = 'var(--accent-cyan)';
      a.style.fontWeight = 'bold';
    });

    a.addEventListener('mouseenter', () => {
      a.style.color = 'var(--accent-cyan)';
    });
    a.addEventListener('mouseleave', () => {
      if (a.style.fontWeight !== 'bold') {
        a.style.color = heading.tagName === 'H3' ? 'var(--text-muted)' : 'var(--text-light)';
      }
    });

    li.appendChild(a);
    tocList.appendChild(li);
  });
}

function openArticleDetail(id) {
  const article = blogArticles.find(a => String(a.id) === String(id));
  if (!article) return;

  playRoboticSound('click');
  const detailDialog = document.getElementById('blog-detail-dialog');
  
  const safeHeaderImage = sanitizeUrl(article.headerImage || '');
  const bgStyle = safeHeaderImage ? `style="background-image: url('${encodeURI(safeHeaderImage)}')"` : '';
  const bannerClass = article.headerImage ? 'dialog-header-banner' : 'dialog-header-banner no-image';

  detailDialog.innerHTML = `
    <div class="dialog-close-bar floating">
      <button type="button" class="btn-close" aria-label="Tutup Detail Artikel">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <div class="${bannerClass}" ${bgStyle}></div>
    
    <div class="dialog-body-container">
      <div class="dialog-title-card">
        <div class="dialog-meta">${escapeHtml(article.date || '')} | Oleh: ${escapeHtml(article.author || 'Tim Robotik')}</div>
        <h2 class="dialog-title" style="margin-top: 0.5rem; margin-bottom: 0.75rem; color: var(--text-white); font-size: 2.25rem;">${escapeHtml(article.title)}</h2>
        <div class="dialog-badge">${escapeHtml(article.category.toUpperCase())}</div>
      </div>
      
      <div class="dialog-grid-container">
        <!-- Table of Contents Sidebar -->
        <aside class="dialog-toc-container">
          <div class="dialog-toc-sticky">
            <h4>Daftar Isi 📖</h4>
            <ul class="toc-list"></ul>
          </div>
        </aside>

        <!-- Main Content Area -->
        <div class="dialog-content-area">
          <div class="dialog-rich-text">
            ${parseMarkdownToHtml(article.content)}
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind close click event
  const closeBtn = detailDialog.querySelector('.btn-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      playRoboticSound('click');
      detailDialog.close();
      document.body.classList.remove('dialog-open');
    });
  }

  // Generate interactive Table of Contents
  generateTableOfContents(detailDialog);

  detailDialog.showModal();
  document.body.classList.add('dialog-open');
}

function setupBlog() {
  const searchInput = document.getElementById('blog-search');
  const categoryFilters = document.querySelectorAll('.blog-filter-btn');
  const detailDialog = document.getElementById('blog-detail-dialog');
  const closeDialogBtn = document.getElementById('close-dialog-btn');

  function closeArticleDetail() {
    playRoboticSound('click');
    detailDialog.close();
    document.body.classList.remove('dialog-open');
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderPublicArticles();
    });
  }

  categoryFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      playRoboticSound('click');
      renderPublicArticles();
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });

  if (closeDialogBtn) closeDialogBtn.addEventListener('click', closeArticleDetail);
  if (detailDialog) {
    detailDialog.addEventListener('cancel', () => {
      document.body.classList.remove('dialog-open');
    });
    detailDialog.addEventListener('click', (e) => {
      const rect = detailDialog.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        closeArticleDetail();
      }
    });
  }

  renderPublicArticles();
}

// --- PUBLIC PORTFOLIO PAGE CONTROLLER ---
function renderPublicPortfolio() {
  const portfolioContainer = document.getElementById('portfolio-grid');
  if (!portfolioContainer) return;

  portfolioContainer.innerHTML = portfolioProjects.map(proj => {
    const safeCardImage = sanitizeUrl(proj.headerImage || '');
    const cardBg = safeCardImage ? `style="background-image: linear-gradient(rgba(11, 17, 32, 0.75), rgba(11, 17, 32, 0.95)), url('${encodeURI(safeCardImage)}'); background-size: cover; background-position: center;"` : '';
    return `
      <div class="glass-card portfolio-card" ${cardBg}>
        <div class="portfolio-header">
          <span class="portfolio-badge badge-${proj.status === 'Selesai' ? 'success' : 'progress'}">${escapeHtml(proj.status)}</span>
          <span class="portfolio-category">${escapeHtml(proj.category.toUpperCase())}</span>
        </div>
        <h3 class="portfolio-title">${escapeHtml(proj.title)}</h3>
        <div class="portfolio-meta">
          <strong>Pembuat:</strong> ${escapeHtml(proj.creators)}
        </div>
        <div class="portfolio-meta">
          <strong>Komponen:</strong> ${escapeHtml(proj.components)}
        </div>
        <div class="portfolio-meta">
          <strong>Spesifikasi:</strong> ${escapeHtml(proj.specs)}
        </div>
        
        <button class="btn btn-outline-cyan btn-sm btn-block view-project-detail-btn" data-id="${parseInt(proj.id) || 0}" style="margin-top: 1.5rem;">
          Lihat Proyek & Kode Arduino 🛠️
        </button>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.view-project-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      openPortfolioDetail(id);
    });
    btn.addEventListener('mouseenter', () => playRoboticSound('hover'));
  });
}

function openPortfolioDetail(id) {
  const proj = portfolioProjects.find(p => String(p.id) === String(id));
  if (!proj) return;

  playRoboticSound('click');
  const detailDialog = document.getElementById('portfolio-detail-dialog');
  
  const safeProjImage = sanitizeUrl(proj.headerImage || '');
  const bgStyle = safeProjImage ? `style="background-image: url('${encodeURI(safeProjImage)}')"` : '';
  const bannerClass = safeProjImage ? 'dialog-header-banner' : 'dialog-header-banner no-image';

  detailDialog.innerHTML = `
    <div class="dialog-close-bar floating">
      <button type="button" class="btn-close" aria-label="Tutup Detail Proyek">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <div class="${bannerClass}" ${bgStyle}></div>
    
    <div class="dialog-body-container">
      <div class="dialog-title-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
          <span class="portfolio-badge badge-${proj.status === 'Selesai' ? 'success' : 'progress'}">${escapeHtml(proj.status)}</span>
          <span class="portfolio-category" style="color: var(--accent-cyan); font-weight: bold; letter-spacing: 1.2px;">${escapeHtml(proj.category.toUpperCase())}</span>
        </div>
        <h2 class="dialog-title" style="margin-top: 0.5rem; margin-bottom: 1.5rem; color: var(--text-white); font-size: 2.25rem;">${escapeHtml(proj.title)}</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 1.5rem;">
          <div>
            <strong style="color: var(--accent-yellow); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 0.25rem;">Pembuat Siswa</strong>
            <span style="font-size: 0.95rem; color: var(--text-light);">${escapeHtml(proj.creators)}</span>
          </div>
          <div>
            <strong style="color: var(--accent-yellow); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 0.25rem;">Komponen Utama</strong>
            <span style="font-size: 0.95rem; color: var(--text-light);">${escapeHtml(proj.components)}</span>
          </div>
          <div>
            <strong style="color: var(--accent-yellow); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 0.25rem;">Spesifikasi Fisik</strong>
            <span style="font-size: 0.95rem; color: var(--text-light);">${escapeHtml(proj.specs)}</span>
          </div>
        </div>
      </div>
      
      <div class="dialog-grid-container">
        <!-- Table of Contents Sidebar -->
        <aside class="dialog-toc-container">
          <div class="dialog-toc-sticky">
            <h4>Daftar Isi 📖</h4>
            <ul class="toc-list"></ul>
          </div>
        </aside>

        <!-- Main Content Area -->
        <div class="dialog-content-area">
          <div class="dialog-rich-text">
            <h3 style="color: var(--accent-cyan); font-size: 1.5rem; margin-bottom: 1.25rem;">Deskripsi Detail Proyek 🤖</h3>
            ${parseMarkdownToHtml(proj.content || '*Belum ada deskripsi mendalam.*')}
            
            ${proj.showCode !== false ? `
            <h3 style="margin-top: 3.5rem; margin-bottom: 1.25rem; color: var(--accent-cyan); font-size: 1.5rem;">Skema & Kode Pemrograman Robot 💻</h3>
            
            <div class="code-viewer-container open" style="display: block; max-height: none; margin-top: 1.5rem; background: #020617; border: 1px solid var(--border-glass); border-radius: var(--radius-md); overflow: hidden; position: relative;">
              <button class="btn-copy-code" id="btn-copy-arduino-code" title="Salin Kode Arduino">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Salin</span>
              </button>
              <div class="viewer-tabs" style="display: flex; background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border-glass);">
                <button class="viewer-tab active" data-tab="code" style="flex: 1; background: transparent; border: none; border-bottom: 2px solid transparent; padding: 1rem; color: var(--text-muted); font-family: var(--font-heading); font-weight: 600; cursor: pointer; text-align: center; transition: var(--transition-smooth);">Arduino C++ Code</button>
                <button class="viewer-tab" data-tab="schematic" style="flex: 1; background: transparent; border: none; border-bottom: 2px solid transparent; padding: 1rem; color: var(--text-muted); font-family: var(--font-heading); font-weight: 600; cursor: pointer; text-align: center; transition: var(--transition-smooth);">Fisik & Koneksi</button>
              </div>
              <div class="viewer-content active" data-content="code" style="padding: 1.5rem; display: block; overflow-y: auto;">
                <pre style="margin: 0;"><code style="font-family: monospace; font-size: 0.9rem; color: #a7f3d0; white-space: pre-wrap;">${escapeHtml(proj.code)}</code></pre>
              </div>
              <div class="viewer-content" data-content="schematic" style="padding: 1.5rem; display: none; overflow-y: auto;">
                <div class="schematic-mock" style="display: flex; gap: 1.5rem; align-items: flex-start;">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FACC15" stroke-width="1.5" style="flex-shrink: 0;">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <circle cx="8" cy="10" r="2" />
                    <circle cx="16" cy="10" r="2" />
                    <path d="M6 16h12" />
                  </svg>
                  <div class="schematic-info">
                    <h4 style="color: var(--accent-yellow); font-size: 1.15rem; margin-bottom: 0.5rem; font-family: var(--font-heading);">Diagram Sirkuit & Pinout Robot</h4>
                    <div style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6;">
                      ${parseMarkdownToHtml(proj.schematic || '*Belum ada rincian koneksi fisik.*')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind close click event
  const closeBtn = detailDialog.querySelector('.btn-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      playRoboticSound('click');
      detailDialog.close();
      document.body.classList.remove('dialog-open');
    });
  }

  // Bind copy code button click & tab show/hide
  const copyBtn = detailDialog.querySelector('#btn-copy-arduino-code');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(proj.code).then(() => {
        playRoboticSound('success');
        copyBtn.classList.add('success');
        const btnText = copyBtn.querySelector('span');
        const btnSvg = copyBtn.querySelector('svg');
        
        if (btnText) btnText.textContent = 'Tersalin! ✔️';
        if (btnSvg) {
          btnSvg.setAttribute('viewBox', '0 0 24 24');
          btnSvg.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
        }
        
        setTimeout(() => {
          copyBtn.classList.remove('success');
          if (btnText) btnText.textContent = 'Salin';
          if (btnSvg) {
            btnSvg.setAttribute('viewBox', '0 0 24 24');
            btnSvg.innerHTML = `
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            `;
          }
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy code: ', err);
        playRoboticSound('error');
      });
    });
  }

  // Bind tab click event inside full-screen modal
  const tabs = detailDialog.querySelectorAll('.viewer-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playRoboticSound('click');
      const targetTab = tab.getAttribute('data-tab');
      
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (copyBtn) {
        if (targetTab === 'code') {
          copyBtn.style.display = 'inline-flex';
        } else {
          copyBtn.style.display = 'none';
        }
      }
      
      detailDialog.querySelectorAll('.viewer-content').forEach(content => {
        if (content.getAttribute('data-content') === targetTab) {
          content.style.display = 'block';
        } else {
          content.style.display = 'none';
        }
      });
    });
  });

  // Generate interactive Table of Contents
  generateTableOfContents(detailDialog);

  detailDialog.showModal();
  document.body.classList.add('dialog-open');
}

function setupPortfolio() {
  const detailDialog = document.getElementById('portfolio-detail-dialog');
  if (detailDialog) {
    detailDialog.addEventListener('cancel', () => {
      document.body.classList.remove('dialog-open');
    });
    detailDialog.addEventListener('click', (e) => {
      const rect = detailDialog.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        playRoboticSound('click');
        detailDialog.close();
        document.body.classList.remove('dialog-open');
      }
    });
  }

  renderPublicPortfolio();
}

// --- MULTI-STEP REGISTRATION FORM ---
function setupRegistrationForm() {
  const form = document.getElementById('robotics-reg-form');
  if (!form) return;

  const steps = document.querySelectorAll('.form-step-content');
  const stepIndicators = document.querySelectorAll('.step-track');
  const btnNext1 = document.getElementById('btn-next-1');
  const btnNext2 = document.getElementById('btn-next-2');
  const btnPrev2 = document.getElementById('btn-prev-2');
  const btnPrev3 = document.getElementById('btn-prev-3');
  const formContainer = document.getElementById('reg-form-container');
  const successCard = document.getElementById('reg-success-card');

  let currentStep = 1;

  const validationRules = {
    'nama_lengkap': {
      required: true,
      pattern: /^[a-zA-Z\s]{2,50}$/,
      errorMessage: 'Nama lengkap wajib diisi (minimal 2 huruf, hanya huruf alfabet dan spasi).'
    },
    'email': {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: 'Alamat email tidak valid (contoh: nama@domain.com).'
    },
    'no_hp': {
      required: true,
      pattern: /^(08|\+62)[0-9]{8,12}$/,
      errorMessage: 'Nomor WhatsApp tidak valid (format Indonesia: dimulai 08 atau +62, panjang 10-14 digit numerik).'
    },
    'motivasi': {
      required: true,
      minlength: 20,
      errorMessage: 'Berikan motivasi yang jelas (minimal 20 karakter).'
    }
  };

  Object.keys(validationRules).forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (!input) return;

    input.addEventListener('blur', () => {
      validateField(input);
    });

    input.addEventListener('input', () => {
      clearFieldError(input);
      if (fieldId === 'motivasi') {
        const charCount = document.getElementById('char-count');
        if (charCount) {
          const charsLeft = 20 - input.value.length;
          if (charsLeft > 0) {
            charCount.textContent = `(${charsLeft} karakter lagi)`;
            charCount.style.color = 'var(--text-muted)';
          } else {
            charCount.textContent = '(Persyaratan terpenuhi)';
            charCount.style.color = '#FACC15';
          }
        }

      }
    });
  });

  const motivasiInput = document.getElementById('motivasi');

  function validateField(input) {
    const rule = validationRules[input.id];
    if (!rule) return true;

    let isValid = true;
    const value = input.value.trim();

    if (rule.required && !value) {
      isValid = false;
    } else if (rule.pattern && !rule.pattern.test(value)) {
      isValid = false;
    } else if (rule.minlength && value.length < rule.minlength) {
      isValid = false;
    }

    if (!isValid) {
      showFieldError(input, rule.errorMessage);
      return false;
    } else {
      clearFieldError(input);
      return true;
    }
  }

  function showFieldError(input, message) {
    const group = input.closest('.form-group');
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

  function clearFieldError(input) {
    const group = input.closest('.form-group');
    group.classList.remove('has-error');
    const errorSpan = group.querySelector('.error-message');
    if (errorSpan) {
      group.removeChild(errorSpan);
    }
  }

  async function validateStep(stepNum) {
    let stepValid = true;
    
    if (stepNum === 1) {
      const f1 = document.getElementById('nama_lengkap');
      const f2 = document.getElementById('email');
      const f3 = document.getElementById('no_hp');
      
      const v1 = validateField(f1);
      const v2 = validateField(f2);
      const v3 = validateField(f3);
      
      stepValid = v1 && v2 && v3;
    } else if (stepNum === 2) {
      const motivasi = document.getElementById('motivasi');
      const vMotiv = validateField(motivasi);
      
      stepValid = vMotiv;
      // Validasi pertanyaan kustom yang wajib diisi (required)
      let customValid = true;
      if (regSettings.customQuestions) {
        regSettings.customQuestions.forEach(q => {
          if (q.required) {
            if (q.type === 'text' || q.type === 'select') {
              const input = document.getElementById(q.id);
              if (input && !input.value.trim()) {
                customValid = false;
                const group = input.closest('.form-group');
                group.classList.add('has-error');
                let errorSpan = group.querySelector('.error-message');
                if (!errorSpan) {
                  errorSpan = document.createElement('span');
                  errorSpan.className = 'error-message';
                  group.appendChild(errorSpan);
                }
                errorSpan.textContent = 'Pertanyaan wajib diisi.';
              } else if (input) {
                const group = input.closest('.form-group');
                group.classList.remove('has-error');
                const errorSpan = group.querySelector('.error-message');
                if (errorSpan) group.removeChild(errorSpan);
              }
            } else if (q.type === 'radio') {
              const checkedRadio = document.querySelector(`input[name="${q.id}"]:checked`);
              if (!checkedRadio) {
                customValid = false;
                const firstRadio = document.getElementById(`${q.id}-0`);
                const radioContainer = firstRadio ? firstRadio.closest('.form-group') : null;
                if (radioContainer) {
                  radioContainer.classList.add('has-error');
                  let errorSpan = radioContainer.querySelector('.error-message');
                  if (!errorSpan) {
                    errorSpan = document.createElement('span');
                    errorSpan.className = 'error-message';
                    radioContainer.appendChild(errorSpan);
                  }
                  errorSpan.textContent = 'Pilih salah satu jawaban.';
                }
              } else {
                const firstRadio = document.getElementById(`${q.id}-0`);
                const radioContainer = firstRadio ? firstRadio.closest('.form-group') : null;
                if (radioContainer) {
                  radioContainer.classList.remove('has-error');
                  const errorSpan = radioContainer.querySelector('.error-message');
                  if (errorSpan) radioContainer.removeChild(errorSpan);
                }
              }
            }
          }
        });
      }
      stepValid = stepValid && customValid;
    }

    if (!stepValid) {
      playRoboticSound('error');
    }
    return stepValid;
  }

  function renderStep(stepNum) {
    steps.forEach(s => s.classList.remove('active'));
    document.getElementById(`form-step-${stepNum}`).classList.add('active');

    stepIndicators.forEach((ind, idx) => {
      ind.classList.remove('active', 'completed');
      if (idx + 1 === stepNum) {
        ind.classList.add('active');
        ind.setAttribute('aria-current', 'step');
      } else if (idx + 1 < stepNum) {
        ind.classList.add('completed');
      }
    });

    if (stepNum === 3) {
      populateConfirmation();
    }
  }

  function populateConfirmation() {
    const nama = document.getElementById('nama_lengkap').value;
    const kelas = document.querySelector('input[name="kelas"]:checked')?.value || '-';
    const email = document.getElementById('email').value;
    const noHp = document.getElementById('no_hp').value;
    const laptop = document.querySelector('input[name="laptop"]:checked')?.value || 'Tidak';

    const motivasi = document.getElementById('motivasi').value;
    const summaryContainer = document.getElementById('confirmation-summary');

    let customSummaryHtml = '';
    if (regSettings.customQuestions) {
      regSettings.customQuestions.forEach(q => {
        let ans = '-';
        if (q.type === 'text' || q.type === 'select') {
          const input = document.getElementById(q.id);
          if (input && input.value.trim()) ans = input.value.trim();
        } else if (q.type === 'radio') {
          const checkedRadio = document.querySelector(`input[name="${q.id}"]:checked`);
          if (checkedRadio) ans = checkedRadio.value;
        }
        customSummaryHtml += `<div class="summary-item block"><strong>${escapeHtml(q.label)}:</strong> <span>${escapeHtml(ans)}</span></div>`;
      });
    }
    
    summaryContainer.innerHTML = `
      <div class="summary-item"><strong>Nama Lengkap:</strong> <span>${escapeHtml(nama)}</span></div>
      <div class="summary-item"><strong>Kelas:</strong> <span>Kelas ${escapeHtml(kelas)}</span></div>
      <div class="summary-item"><strong>Email:</strong> <span>${escapeHtml(email)}</span></div>
      <div class="summary-item"><strong>No. WhatsApp:</strong> <span>${escapeHtml(noHp)}</span></div>
      <div class="summary-item"><strong>Punya Laptop:</strong> <span>${escapeHtml(laptop)}</span></div>
      <div class="summary-item block"><strong>Motivasi:</strong> <p>${escapeHtml(motivasi)}</p></div>
      ${customSummaryHtml}
    `;
  }

  btnNext1.addEventListener('click', async () => {
    if (await validateStep(1)) {
      currentStep = 2;
      renderStep(currentStep);
      playRoboticSound('click');
    }
  });

  btnNext2.addEventListener('click', async () => {
    if (await validateStep(2)) {
      currentStep = 3;
      renderStep(currentStep);
      playRoboticSound('click');
    }
  });

  btnPrev2.addEventListener('click', () => {
    currentStep = 1;
    renderStep(currentStep);
    playRoboticSound('click');
  });

  btnPrev3.addEventListener('click', () => {
    currentStep = 2;
    renderStep(currentStep);
    playRoboticSound('click');
  });



  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Prevent submission if not on the final step (Step 3)
    if (currentStep < 3) {
      if (currentStep === 1) {
        if (await validateStep(1)) {
          currentStep = 2;
          renderStep(currentStep);
          playRoboticSound('click');
        }
      } else if (currentStep === 2) {
        if (await validateStep(2)) {
          currentStep = 3;
          renderStep(currentStep);
          playRoboticSound('click');
        }
      }
      return;
    }

    // Final validation check for all steps
    const step1Valid = await validateStep(1);
    const step2Valid = await validateStep(2);
    if (!step1Valid || !step2Valid) {
      playRoboticSound('error');
      currentStep = !step1Valid ? 1 : 2;
      renderStep(currentStep);
      return;
    }

    // Rate limit: prevent spam re-submissions
    const rateCheck = checkFormRateLimit();
    if (!rateCheck.allowed) {
      playRoboticSound('error');
      const secs = Math.ceil(rateCheck.remainingMs / 1000);
      await customAlert(`⏳ Mohon tunggu ${secs} detik sebelum mengirim ulang.`);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Memproses Enkripsi Data...';

    recordFormSubmission();
    playRoboticSound('success');

    setTimeout(() => {
      const rawNama = document.getElementById('nama_lengkap').value;
      const kelasSiswa = document.querySelector('input[name="kelas"]:checked')?.value || 'X';
      const rawNoHp = document.getElementById('no_hp').value;
      const regId = 'ROBO-' + Math.floor(100000 + Math.random() * 900000);

      // Sanitize registration input values
      const namaSiswa = sanitizeInput(rawNama);
      const noHpSiswa = sanitizeInput(rawNoHp);
      const emailSiswa = sanitizeInput(document.getElementById('email').value);
      const motivasiSiswa = sanitizeInput(document.getElementById('motivasi').value);

      // Populate review pending elements
      const studentNameEl = document.getElementById('registered-student-name');
      const studentPhoneEl = document.getElementById('registered-student-phone');
      const studentIdEl = document.getElementById('registered-student-id');
      if (studentNameEl) studentNameEl.textContent = namaSiswa;
      if (studentPhoneEl) studentPhoneEl.textContent = noHpSiswa;
      if (studentIdEl) studentIdEl.textContent = regId;

      // Update student card contents for future approval display
      const cardNameEl = document.getElementById('card-student-name');
      const cardClassEl = document.getElementById('card-student-class');
      const cardIdEl = document.getElementById('card-student-id');
      if (cardNameEl) cardNameEl.textContent = namaSiswa;
      if (cardClassEl) cardClassEl.textContent = 'KELAS ' + kelasSiswa;
      if (cardIdEl) cardIdEl.textContent = regId;

      // Toggle pending review display active, hide approved student card display
      const pendingWrapper = document.getElementById('review-pending-wrapper');
      const approvedWrapper = document.getElementById('card-approved-wrapper');
      if (pendingWrapper) pendingWrapper.style.display = 'block';
      if (approvedWrapper) approvedWrapper.style.display = 'none';

      // Kumpulkan jawaban pertanyaan kustom
      const customAnswers = {};
      if (regSettings.customQuestions) {
        regSettings.customQuestions.forEach((q) => {
          if (q.type === 'text' || q.type === 'select') {
            const input = document.getElementById(q.id);
            if (input) customAnswers[q.id] = sanitizeInput(input.value);
          } else if (q.type === 'radio') {
            const checkedRadio = document.querySelector(`input[name="${q.id}"]:checked`);
            if (checkedRadio) customAnswers[q.id] = sanitizeInput(checkedRadio.value);
          }
        });
      }

      // Save as Pending Applicant to localStorage database
      const newApplicant = {
        id: regId,
        nama: namaSiswa,
        kelas: kelasSiswa,
        email: emailSiswa,
        noHp: noHpSiswa,
        laptop: document.querySelector('input[name="laptop"]:checked')?.value || 'Tidak',
        motivasi: motivasiSiswa,
        tanggalDaftar: new Date().toISOString().split('T')[0],
        status: 'Pending',
        customAnswers: customAnswers
      };

      applicants.push(newApplicant);
      saveData('robotik_applicants', applicants, false);

      if (useFirebase) {
        db.collection('applicants').doc(regId).set(newApplicant)
          .then(() => console.log("Applicant successfully saved to Cloud Firestore!"))
          .catch(err => console.error("Firestore save applicant failed:", err));
      }

      // Refresh admin table
      // renderAdminApplicantsTable();

      // Show success screen and scroll
      formContainer.style.display = 'none';
      successCard.style.display = 'block';
      
      triggerVisualSuccess();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  });
}

function triggerVisualSuccess() {
  const successCard = document.getElementById('reg-success-card');
  if (successCard) {
    successCard.classList.add('glow-spark');
    setTimeout(() => {
      successCard.classList.remove('glow-spark');
    }, 2000);
  }
}

function renderWhatsAppBanner() {
  const successWaTitle = document.getElementById('success-wa-title');
  const successWaDesc = document.getElementById('success-wa-desc');
  const successWaLink = document.getElementById('success-wa-link');

  if (successWaTitle) {
    successWaTitle.textContent = regSettings.waTitle || 'Grup WhatsApp Resmi Calon Anggota';
  }
  if (successWaDesc) {
    successWaDesc.textContent = regSettings.waDesc || '';
  }
  if (successWaLink) {
    successWaLink.href = regSettings.waLink || 'https://chat.whatsapp.com/mock-motechart-robotik';
    successWaLink.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.031 2C6.51 2 2.03 6.48 2.03 12c0 2.159.57 4.259 1.66 6.13l-1.77 6.47 6.63-1.74c1.88 1.02 4 1.56 6.13 1.56 5.52 0 10-4.48 10-10S17.551 2 12.031 2zm6.39 14.19c-.27.76-1.55 1.48-2.15 1.56-.54.07-1.24.1-3.64-.89-3.07-1.26-5.05-4.38-5.2-4.58-.15-.2-1.2-1.6-1.2-3.06 0-1.46.76-2.17 1.03-2.46.27-.3.59-.37.79-.37.2 0 .4.01.57.02.18.01.41-.07.65.5.24.58.82 2.02.9 2.17.08.16.14.35.03.56-.11.22-.26.47-.38.61-.13.14-.26.3-.11.56.15.26.68 1.12 1.46 1.82.99.9 1.83 1.18 2.09 1.31.26.13.41.11.56-.06.15-.18.66-.76.84-.96.18-.2.37-.16.63-.07.26.09 1.66.78 1.95.92.29.14.48.22.56.35.07.13.07.76-.2 1.52z"/>
      </svg>
      Gabung Grup WhatsApp Calon Anggota 🚀
    `;
  }
}

async function initializeCloudDataSync() {
  if (useFirebase) {
    console.log("Motechart Cloud Engine: Initiating data sync from Firebase Firestore...");
    await syncLandingDataFromFirestore();
    await syncRegSettingsFromFirestore();
    await syncBlogFromFirestore();
    await syncPortfolioFromFirestore();
    
    // Update local let variables with newly synced cloud data
    blogArticles = state.blogArticles;
    portfolioProjects = state.portfolioProjects;
    applicants = state.applicants;
    regSettings = state.regSettings;
    landingData = state.landingData;
    
    // Privacy Fix: Removed syncApplicantsFromFirestore() and setupRealTimeApplicantsSync() 
    // from the public frontend so we don't leak all PII to unauthorized users.
    
    // Re-render components with newly synced cloud data
    renderLandingPage();
    renderCustomQuestionsInForm();
    updateCountdownTimer();
    renderWhatsAppBanner();
    renderPublicArticles();
    renderPublicPortfolio();
    
    // Re-populate inputs in CMS if forms are loaded
    if (typeof window.populateLandingCmsInputs === 'function') {
      window.populateLandingCmsInputs();
    }
    if (typeof window.populateRegSettingsCmsInputs === 'function') {
      window.populateRegSettingsCmsInputs();
    }
  }
}

function setupPendaftaranCMSAndCountdown() {
  renderCustomQuestionsInForm();
  updateCountdownTimer();
  setupStatusChecker();
  // setupAdminRegSettings();
  renderWhatsAppBanner();
}

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

// --- APP BOOTSTRAP ---
document.addEventListener('DOMContentLoaded', () => {
  setupRouter();
  setupInteractiveElements();
  // setupAudioToggle();
  setupBlog();
  setupPortfolio();
  setupRegistrationForm();
  setupInteractiveCircuit();
  // setupApplicantsDialog();
  
  // Initialize landing page content
  renderLandingPage();
  // setupLandingPageCMS();
  
  // Initialize interactive division instrument panel
  setupInteractiveDivisions();
  
  // Dynamic CMS setups boot hookup
  // setupCmsAuthentication();
  // setupCmsTabs();
  setupPendaftaranCMSAndCountdown();
  // setupApplicantsFilterAndExport();

  // --- QoL: Global Dialog Handlers (ESC and Backdrop Click) ---
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
    });
    dialog.addEventListener('click', (e) => {
      // e.target === dialog ensures it's the backdrop being clicked, not its contents
      if (e.target === dialog) {
        dialog.close();
      }
    });
  });

  // Initialize interactive system status & telemetry dialog
  setupSystemTelemetry();

  // Setup Real-time cloud sync listeners
  setupRealTimeRegSettingsSync((updatedRegSettings) => {
    regSettings = updatedRegSettings;
    renderCustomQuestionsInForm();
    updateCountdownTimer();
    renderWhatsAppBanner();
  });

  setupRealTimeLandingDataSync((updatedLandingData) => {
    landingData = updatedLandingData;
    renderLandingPage();
  });

  setupRealTimeBlogSync((updatedBlogArticles) => {
    blogArticles = updatedBlogArticles;
    renderPublicArticles();
  });

  setupRealTimePortfolioSync((updatedPortfolioProjects) => {
    portfolioProjects = updatedPortfolioProjects;
    renderPublicPortfolio();
  });

  // Async cloud sync trigger (runs in background and populates UI seamlessly)
  initializeCloudDataSync();
});

function renderLandingPage() {
  const heroTagEl = document.getElementById('home-hero-tag');
  const heroTitleEl = document.getElementById('home-title');
  const heroDescEl = document.getElementById('home-hero-desc');
  const visiTextEl = document.getElementById('home-visi-text');
  const misiListEl = document.getElementById('home-misi-list');
  const divMechDescEl = document.getElementById('home-div-mech-desc');
  const divElecDescEl = document.getElementById('home-div-elec-desc');
  const divProgDescEl = document.getElementById('home-div-prog-desc');
  const achievementsEl = document.getElementById('home-achievements-grid');

  if (heroTagEl) heroTagEl.textContent = landingData.heroTag;
  if (heroTitleEl) heroTitleEl.innerHTML = sanitizeHeroHtml(landingData.heroTitle);
  if (heroDescEl) heroDescEl.textContent = landingData.heroDesc;
  if (visiTextEl) visiTextEl.textContent = landingData.visiText;
  
  if (misiListEl && landingData.misiList) {
    misiListEl.innerHTML = landingData.misiList.map(misi => `<li>${escapeHtml(misi)}</li>`).join('');
  }
  
  if (divMechDescEl) divMechDescEl.textContent = landingData.divMechDesc;
  if (divElecDescEl) divElecDescEl.textContent = landingData.divElecDesc;
  if (divProgDescEl) divProgDescEl.textContent = landingData.divProgDesc;

  if (achievementsEl && landingData.achievements) {
    if (landingData.achievements.length === 0) {
      achievementsEl.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: var(--radius-lg);">Belum ada penghargaan & prestasi yang ditambahkan.</div>`;
    } else {
      achievementsEl.innerHTML = landingData.achievements.map(ach => `
        <div class="achievement-card">
          <div class="ach-card-glow"></div>
          <span class="ach-badge">${escapeHtml(ach.year || '')}</span>
          <div class="ach-trophy">🏆</div>
          <h4 class="ach-juara" style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: var(--text-light); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.02em; white-space: pre-wrap;">${escapeHtml(ach.juara || '')}</h4>
          <p class="ach-organizer" style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">${escapeHtml(ach.organizer || 'Penyelenggara Ekskul')}</p>
        </div>
      `).join('');
    }
  }

  // Populate / refresh the custom footer content dynamically
  const footerTaglineEl = document.getElementById('footer-tagline-text');
  const footerLocationEl = document.getElementById('footer-location-text');
  const footerEmailEl = document.getElementById('footer-email-text');
  const footerInstaEl = document.getElementById('footer-instagram-link');
  const footerGithubEl = document.getElementById('footer-github-link');
  const footerYoutubeEl = document.getElementById('footer-youtube-link');

  if (footerTaglineEl) footerTaglineEl.textContent = landingData.footerTagline || '';
  if (footerLocationEl) footerLocationEl.textContent = landingData.footerLocation || '';
  if (footerEmailEl) footerEmailEl.textContent = landingData.footerEmail || '';
  if (footerInstaEl) footerInstaEl.href = landingData.footerInstagram || 'https://instagram.com';
  if (footerGithubEl) footerGithubEl.href = landingData.footerGithub || 'https://github.com';
  if (footerYoutubeEl) footerYoutubeEl.href = landingData.footerYoutube || 'https://youtube.com';

  // Populate / refresh the interactive divisions panel
  if (typeof setupInteractiveDivisions === 'function') {
    setupInteractiveDivisions();
  }
}

// --- INTERACTIVE DIVISIONS SHOWCASE MODULE ---
function setupInteractiveDivisions() {
  const navButtons = document.querySelectorAll('.divisi-nav-btn');
  const detailContainer = document.getElementById('divisi-detail-container');
  if (navButtons.length === 0 || !detailContainer) return;

  function showDivision(divisionId) {
    let specTitle = '';
    let specHeading = '';
    let specDesc = '';
    let themeClass = '';
    let bulletColor = '';
    let focusPoints = [];
    let graphicHtml = '';

    if (divisionId === 'mechanics') {
      specTitle = 'DIVISI 01 / STRUCTURAL DESIGN';
      specHeading = 'Mekanik (Mechanics)';
      specDesc = landingData.divMechDesc || 'Merancang struktur fisik robot, chassis, pemodelan 3D (CAD), dan kestabilan pergerakan mekanis.';
      themeClass = 'mech-theme';
      bulletColor = 'var(--accent-yellow)';
      focusPoints = [
        'Drafting & 3D Modeling (CAD)',
        'Chassis Fabrication & Materials',
        'Robotic Kinematics & Stability',
        '3D Printing & Physical Assembly'
      ];
      graphicHtml = `
        <svg class="mechanics-blueprint-svg" width="180" height="180" viewBox="0 0 200 200" fill="none" style="color: var(--accent-yellow); filter: drop-shadow(0 0 15px currentColor);">
          <!-- Blueprint Grid Background -->
          <g opacity="0.15" stroke="currentColor" stroke-width="0.5">
            <line x1="20" y1="20" x2="20" y2="180" />
            <line x1="50" y1="20" x2="50" y2="180" />
            <line x1="80" y1="20" x2="80" y2="180" />
            <line x1="110" y1="20" x2="110" y2="180" />
            <line x1="140" y1="20" x2="140" y2="180" />
            <line x1="170" y1="20" x2="170" y2="180" />
            
            <line x1="20" y1="20" x2="180" y2="20" />
            <line x1="20" y1="50" x2="180" y2="50" />
            <line x1="20" y1="80" x2="180" y2="80" />
            <line x1="20" y1="110" x2="180" y2="110" />
            <line x1="20" y1="140" x2="180" y2="140" />
            <line x1="20" y1="170" x2="180" y2="170" />
          </g>
          
          <!-- Outer Tech HUD Rings -->
          <circle cx="100" cy="100" r="80" stroke="currentColor" stroke-width="1.5" stroke-dasharray="12 8" opacity="0.4" />
          <circle cx="100" cy="100" r="70" stroke="currentColor" stroke-width="1" stroke-dasharray="40 10 5 10" opacity="0.3" />
          
          <!-- Inner Spinning CAD Ring -->
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="20s" repeatCount="indefinite" />
            <circle cx="100" cy="100" r="50" stroke="currentColor" stroke-width="2" stroke-dasharray="30 15 10 15" />
            <path d="M 100 45 L 100 50 M 100 150 L 100 155 M 45 100 L 50 100 M 150 100 L 155 100" stroke="currentColor" stroke-width="2" />
          </g>
          
          <!-- Holographic 3D Wireframe Cube (Rotating) -->
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="-360 100 100" dur="25s" repeatCount="indefinite" />
            <!-- Front Face -->
            <rect x="75" y="75" width="50" height="50" stroke="currentColor" stroke-width="2" opacity="0.85" />
            <!-- Back Face -->
            <rect x="85" y="65" width="50" height="50" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.5" />
            <!-- Connecting Edges -->
            <line x1="75" y1="75" x2="85" y2="65" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6" />
            <line x1="125" y1="75" x2="135" y2="65" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6" />
            <line x1="75" y1="125" x2="85" y2="115" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6" />
            <line x1="125" y1="125" x2="135" y2="115" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6" />
            <!-- Center Core Point -->
            <circle cx="100" cy="100" r="4" fill="currentColor" />
          </g>
          
          <!-- Laser Scanning Line (Sweeping vertically) -->
          <line x1="15" y1="20" x2="185" y2="20" stroke="currentColor" stroke-width="2" opacity="0.8">
            <animate attributeName="y1" values="30; 170; 30" dur="4s" repeatCount="indefinite" />
            <animate attributeName="y2" values="30; 170; 30" dur="4s" repeatCount="indefinite" />
          </line>
        </svg>
      `;
    } else if (divisionId === 'electronics') {
      specTitle = 'DIVISI 02 / HARDWARE CIRCUITS';
      specHeading = 'Elektronik (Electronics)';
      specDesc = landingData.divElecDesc || 'Menyusun sirkuit sirkulasi daya, mikrokontroler (Arduino/ESP32), dan sistem sensor pintar.';
      themeClass = 'elec-theme';
      bulletColor = 'var(--accent-cyan)';
      focusPoints = [
        'Microcontroller Programming (Arduino/ESP32)',
        'Sensor Integration & Soldering',
        'Power Delivery & Battery Management',
        'Motor Drivers & Actuators Control'
      ];
      graphicHtml = `
        <svg class="circuit-svg" width="180" height="180" viewBox="0 0 200 200" fill="none" style="color: var(--accent-cyan);">
          <path d="M 20 80 H 50 V 140 H 100 V 100 H 150 V 60 H 180" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.3" />
          <path d="M 50 140 H 100 V 180" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.3" />
          <path d="M 100 100 H 150 V 140" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.3" />
          <path d="M 20 80 H 50 V 140 H 100 V 100 H 150 V 60 H 180" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="10 15" stroke-dashoffset="0" />
          <rect x="85" y="85" width="30" height="30" rx="3" fill="rgba(15,23,42,0.8)" stroke="currentColor" stroke-width="3" />
          <circle class="circuit-node node-1" cx="50" cy="80" r="6" fill="currentColor" />
          <circle class="circuit-node node-2" cx="150" cy="60" r="6" fill="currentColor" />
          <circle class="circuit-node node-3" cx="100" cy="140" r="6" fill="currentColor" />
        </svg>
      `;
    } else if (divisionId === 'programming') {
      specTitle = 'DIVISI 03 / EMBEDDED INTELLIGENCE';
      specHeading = 'Pemrograman (Programming)';
      specDesc = landingData.divProgDesc || 'Menulis kode algoritma C++ dan Python, navigasi sensor otomatis, dan kendali jarak jauh IoT.';
      themeClass = 'prog-theme';
      bulletColor = '#D946EF';
      focusPoints = [
        'Embedded C++ & Python Development',
        'Autonomous Navigation Algorithms',
        'PID Control Tuning for Motors',
        'Wireless IoT & WebSockets Sync'
      ];
      graphicHtml = `
        <div class="code-terminal" style="color: #D946EF; border-color: rgba(217,70,239,0.2);">
          <div class="terminal-header">
            <span class="dot dot-red"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-green"></span>
            <span style="font-size: 0.65rem; color: var(--text-muted); margin-left: 0.5rem; font-family: monospace;">PID_controller.cpp</span>
          </div>
          <div style="font-family: monospace; font-size: 0.7rem; color: #fdf2f8; line-height: 1.5;">
            <span style="color: #D946EF;">#include</span> &lt;PID_v1.h&gt;<br/>
            <span style="color: #6EE7B7;">double</span> Setpoint, Input, Output;<br/>
            <span style="color: #6EE7B7;">double</span> Kp=2.0, Ki=5.0, Kd=1.0;<br/>
            PID <span style="color: #68D391;">myPID</span>(&amp;Input, &amp;Output, ...);<br/>
            <br/>
            <span style="color: #6EE7B7;">void</span> <span style="color: #FBBF24;">setup</span>() {<br/>
            &nbsp;&nbsp;Input = <span style="color: #FBBF24;">readSensor</span>();<br/>
            &nbsp;&nbsp;myPID.SetMode(AUTOMATIC);<br/>
            }<br/>
            <span style="color: #6EE7B7;">void</span> <span style="color: #FBBF24;">loop</span>() {<br/>
            &nbsp;&nbsp;<span style="color: #A7F3D0;">// compute output and drive motor</span><br/>
            &nbsp;&nbsp;myPID.Compute();<br/>
            }
          </div>
        </div>
      `;
    }

    const bulletItemsHtml = focusPoints.map(point => `
      <li class="div-focus-item">
        <span class="div-focus-bullet" style="background: ${bulletColor}; box-shadow: 0 0 8px ${bulletColor};"></span>
        ${point}
      </li>
    `).join('');

    detailContainer.innerHTML = `
      <div class="divisi-detail-content">
        <span class="div-spec-title" style="color: ${bulletColor};">${specTitle}</span>
        <h3 class="div-spec-heading">${specHeading}</h3>
        <p class="div-spec-desc">${escapeHtml(specDesc)}</p>
        <ul class="div-focus-list">
          ${bulletItemsHtml}
        </ul>
      </div>
      <div class="divisi-detail-graphic" style="color: ${bulletColor};">
        ${graphicHtml}
      </div>
    `;

    detailContainer.className = `divisi-detail-panel ${themeClass}`;
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const divisionId = btn.getAttribute('data-div');
      
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      playRoboticSound('click');
      showDivision(divisionId);
    });
    btn.addEventListener('mouseenter', () => {
      if (!btn.classList.contains('active')) {
        playRoboticSound('hover');
      }
    });
  });

  const initialActive = document.querySelector('.divisi-nav-btn.active');
  if (initialActive) {
    showDivision(initialActive.getAttribute('data-div'));
  }
}

// --- SYSTEM STATUS & TELEMETRY MODULE ---
function setupSystemTelemetry() {
  const sessionStartTime = Date.now();
  
  // Initialize persistent visitor count
  let visitorCount = localStorage.getItem('robotik_visitor_count');
  if (!visitorCount) {
    visitorCount = '1';
    localStorage.setItem('robotik_visitor_count', visitorCount);
  }

  // Cloud Firestore global visitors integration (Real-Time Synchronized)
  if (useFirebase && db) {
    try {
      // 1. Session check to prevent spamming count on refresh
      if (!sessionStorage.getItem('robotik_visited_session')) {
        const visitorDocRef = db.collection('telemetry').doc('visitors');
        visitorDocRef.get().then(doc => {
          if (doc.exists) {
            visitorDocRef.update({
              count: firebase.firestore.FieldValue.increment(1)
            }).then(() => {
              sessionStorage.setItem('robotik_visited_session', 'true');
            });
          } else {
            // Seed the initial value if document does not exist
            visitorDocRef.set({
              count: 1
            }).then(() => {
              sessionStorage.setItem('robotik_visited_session', 'true');
            });
          }
        }).catch(err => {
          console.warn("Motechart Cloud Engine: Could not fetch/increment visitor count:", err);
        });
      }

      // 2. Subscribe to real-time updates for global synchronization
      db.collection('telemetry').doc('visitors').onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          const cloudCount = data.count || 1;
          localStorage.setItem('robotik_visitor_count', cloudCount);
          
          const visitorEl = document.getElementById('telemetry-total-visitors');
          if (visitorEl) {
            visitorEl.textContent = cloudCount.toLocaleString('id-ID');
          }
        }
      }, err => {
        console.warn("Motechart Cloud Engine: Real-time visitors listener failed:", err);
      });
    } catch (e) {
      console.error("Motechart Cloud Engine: Visitors Firestore integration error:", e);
    }
  }

  // Session uptime timer (runs every second)
  setInterval(() => {
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const hrs = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    const timeString = `${hrs}:${mins}:${secs}`;
    
    const sessionTimeEl = document.getElementById('telemetry-session-time');
    if (sessionTimeEl) {
      sessionTimeEl.textContent = timeString;
    }
  }, 1000);

  // Simulated live traffic increments fallback (only when offline or not using Firebase)
  setInterval(() => {
    if (navigator.onLine && !(useFirebase && db)) {
      let count = parseInt(localStorage.getItem('robotik_visitor_count') || '1', 10);
      count += Math.floor(Math.random() * 3); // 0, 1, or 2
      localStorage.setItem('robotik_visitor_count', count);
      
      const visitorEl = document.getElementById('telemetry-total-visitors');
      if (visitorEl) {
        visitorEl.textContent = count.toLocaleString('id-ID');
      }
    }
  }, 12000);

  // Firestore DB Latency simulation
  function updatePing() {
    const dbPingEl = document.getElementById('telemetry-db-ping');
    if (!dbPingEl) return;
    if (navigator.onLine) {
      const ping = Math.floor(Math.random() * 35) + 15; // 15ms - 50ms
      dbPingEl.textContent = `${ping} ms`;
    } else {
      dbPingEl.textContent = '-- ms';
    }
  }

  // Interval updating ping dynamically when dialog is open and user is online
  setInterval(() => {
    const telemetryDialog = document.getElementById('system-status-dialog');
    if (telemetryDialog && telemetryDialog.open && navigator.onLine) {
      updatePing();
    }
  }, 5000);

  // Online / Offline state handler
  function handleNetworkChange() {
    const statusWrapper = document.getElementById('btn-system-status');
    const footerStatusText = document.getElementById('footer-status-text');
    if (!statusWrapper || !footerStatusText) return;

    const dbStatusEl = document.getElementById('telemetry-db-status');
    const serverStatusEl = document.getElementById('telemetry-server-status');
    const netStateEl = document.getElementById('telemetry-network-state');
    const netSpeedEl = document.getElementById('telemetry-network-speed');

    if (navigator.onLine) {
      statusWrapper.classList.remove('offline');
      footerStatusText.textContent = 'Hub Sistem: ONLINE';

      if (dbStatusEl) {
        dbStatusEl.textContent = 'TERHUBUNG';
        dbStatusEl.style.color = 'var(--accent-green)';
      }
      if (serverStatusEl) {
        serverStatusEl.textContent = 'ONLINE';
        serverStatusEl.style.color = 'var(--accent-green)';
      }
      if (netStateEl) {
        netStateEl.textContent = 'ONLINE';
        netStateEl.style.color = 'var(--accent-cyan)';
      }
      if (netSpeedEl) {
        netSpeedEl.textContent = 'Active';
      }
      updatePing();
    } else {
      statusWrapper.classList.add('offline');
      footerStatusText.textContent = 'Hub Sistem: OFFLINE';

      if (dbStatusEl) {
        dbStatusEl.textContent = 'TERPUTUS';
        dbStatusEl.style.color = '#EF4444';
      }
      if (serverStatusEl) {
        serverStatusEl.textContent = 'OFFLINE';
        serverStatusEl.style.color = '#EF4444';
      }
      if (netStateEl) {
        netStateEl.textContent = 'OFFLINE';
        netStateEl.style.color = '#EF4444';
      }
      if (netSpeedEl) {
        netSpeedEl.textContent = 'Disconnect';
      }
      const dbPingEl = document.getElementById('telemetry-db-ping');
      if (dbPingEl) dbPingEl.textContent = '-- ms';
    }
  }

  // Register online/offline event listeners
  window.addEventListener('online', handleNetworkChange);
  window.addEventListener('offline', handleNetworkChange);

  // Initialize status color correctly on startup
  handleNetworkChange();

  // Bind footer button interactions
  const statusBtn = document.getElementById('btn-system-status');
  const telemetryDialog = document.getElementById('system-status-dialog');
  const closeBtn = document.getElementById('close-telemetry-btn');

  if (statusBtn && telemetryDialog) {
    statusBtn.addEventListener('click', () => {
      // Load current CMS record statistics from memory
      const currentBlogs = window.blogArticles || [];
      const currentPortfolios = window.portfolioProjects || [];
      const currentApplicants = window.applicants || [];

      // If they are not declared on window, fallback to local variables in this script (as they are in scope)
      const blogCount = typeof blogArticles !== 'undefined' ? blogArticles.length : currentBlogs.length;
      const portfolioCount = typeof portfolioProjects !== 'undefined' ? portfolioProjects.length : currentPortfolios.length;
      const applicantCount = typeof applicants !== 'undefined' ? applicants.length : currentApplicants.length;

      const currentVisitors = parseInt(localStorage.getItem('robotik_visitor_count') || '1', 10);

      // Populate elements inside the dialog
      const blogsEl = document.getElementById('telemetry-total-blogs');
      const portfoliosEl = document.getElementById('telemetry-total-portfolios');
      const applicantsEl = document.getElementById('telemetry-total-applicants');
      const visitorsEl = document.getElementById('telemetry-total-visitors');

      if (blogsEl) blogsEl.textContent = blogCount;
      if (portfoliosEl) portfoliosEl.textContent = portfolioCount;
      if (applicantsEl) applicantsEl.textContent = applicantCount;
      if (visitorsEl) visitorsEl.textContent = currentVisitors.toLocaleString('id-ID');

      // Update connectivity metrics and open modal
      updatePing();
      handleNetworkChange();
      
      telemetryDialog.showModal();
      document.body.classList.add('dialog-open');
      playRoboticSound('click');
    });

    statusBtn.addEventListener('mouseenter', () => {
      playRoboticSound('hover');
    });
  }

  if (closeBtn && telemetryDialog) {
    closeBtn.addEventListener('click', () => {
      telemetryDialog.close();
      playRoboticSound('click');
    });
  }
}




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
    label.innerHTML = `${escapeHtml(q.label)}${q.required ? ' <span style="color:var(--accent-red);">*</span>' : ''}`;
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
          radioInput.id = `${q.id}-${oIdx}`;
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
        saveData('robotik_reg_settings', regSettings, false);
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

async function checkApplicantStatus(id) {
  const contentContainer = document.getElementById('student-status-content-container');
  if (!contentContainer) return;

  const btnCheckStatus = document.getElementById('btn-check-status');
  if (btnCheckStatus) {
    btnCheckStatus.disabled = true;
    btnCheckStatus.textContent = 'Memeriksa...';
  }

  let applicant = null;
  let normalizedId = id.trim().toUpperCase();
  if (/^\d{6}$/.test(normalizedId)) {
    normalizedId = 'ROBO-' + normalizedId;
  }
  
  if (useFirebase && db) {
    try {
      const docRef = await db.collection('applicants').doc(normalizedId).get();
      if (docRef.exists) {
        applicant = docRef.data();
      }
    } catch (e) {
      console.error("Gagal memeriksa status Pendaftaran:", e);
    }
  } else {
    // Fallback for local storage mode
    const latestApplicants = loadData('robotik_applicants', applicants);
    applicant = latestApplicants.find(a => a.id.toUpperCase() === normalizedId);
  }

  if (btnCheckStatus) {
    btnCheckStatus.disabled = false;
    btnCheckStatus.textContent = 'Cek Status Pendaftaran';
  }

  if (!applicant) {
    playRoboticSound('error');
    contentContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 3rem; color: #FB7185; margin-bottom: 1rem;">⚠️</div>
        <h3 style="color: var(--text-white); margin-bottom: 0.5rem;">ID Tidak Ditemukan</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          ID pendaftaran <strong>"${escapeHtml(normalizedId)}"</strong> tidak terdaftar di database kami. Silakan periksa kembali penulisan ID Anda atau hubungi admin.
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
          Halo <strong>${escapeHtml(applicant.nama)}</strong>, pendaftaran Anda untuk kelas <strong>${escapeHtml(applicant.kelas)}</strong> sedang diproses oleh pengurus ekskul Motechart Robotik.
        </p>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 8px; padding: 1rem; text-align: left; margin-bottom: 1.5rem;">
          <div style="display: grid; grid-template-columns: 100px 1fr; gap: 0.5rem; font-size: 0.9rem;">
            <span style="color: var(--text-muted);">ID Unik:</span><span style="color: var(--text-white); font-weight: bold;">${escapeHtml(applicant.id)}</span>
            <span style="color: var(--text-muted);">Tanggal:</span><span style="color: var(--text-white);">${escapeHtml(applicant.timestamp || new Date().toISOString().split('T')[0])}</span>
          </div>
        </div>
        <p style="color: var(--text-white); font-size: 0.95rem; margin-bottom: 1rem;">
          ${escapeHtml(regSettings.waDesc || 'Silakan bergabung di grup WhatsApp untuk informasi selanjutnya.')}
        </p>
        <a href="${regSettings.waLink || '#'}" target="_blank" class="btn btn-yellow" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; justify-content: center; width: 100%;">
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
          Selamat bergabung di <strong>Motechart Robotik</strong>, <strong>${escapeHtml(applicant.nama)}</strong>! Berikut adalah Kartu Anggota Digital resmi Anda. Silakan simpan / screenshot kartu ini.
        </p>
        
        <div style="display: flex; justify-content: center; margin-bottom: 1rem; overflow-x: auto; padding: 0.5rem;">
          ${generateStudentCardHtml(applicant.nama, applicant.kelas, applicant.id)}
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
          Halo <strong>${escapeHtml(applicant.nama)}</strong>, mohon maaf saat ini pendaftaran Anda belum dapat kami setujui karena kuota divisi penuh atau alasan administratif lainnya.
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
  const inputCheckStatus = document.getElementById('status-check-id-input');
  const studentStatusDialog = document.getElementById('student-status-dialog');
  const closeStudentStatusBtn = document.getElementById('close-student-status-btn');

  if (btnCheckStatus && inputCheckStatus) {
    const handleCheck = async () => {
      const id = inputCheckStatus.value.trim();
      if (!id) {
        await customAlert('Silakan masukkan ID Pendaftaran Anda terlebih dahulu.');
        playRoboticSound('error');
        return;
      }
      playRoboticSound('click');
      await checkApplicantStatus(id);
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
