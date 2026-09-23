// Application State
const state = {
  currentLang: 'ar',
  currentTheme: localStorage.getItem('pdp_theme') || 'dark',
  currentRoute: 'home',
  statsAnimated: false
};

// DOM Elements
const elements = {
  html: document.documentElement,
  body: document.body,
      themeToggle: document.getElementById('themeToggle'),
  themeIcon: document.getElementById('themeIcon'),
  themeText: document.getElementById('themeText'),
  menuToggle: document.getElementById('menuToggle'),
  navLinks: document.getElementById('navLinks'),
  globalSearch: document.getElementById('globalSearch'),
  searchResultsArea: document.getElementById('searchResultsArea'),
  searchResultsGrid: document.getElementById('searchResultsGrid'),
  resultsCount: document.getElementById('resultsCount'),
  pagesContainer: document.getElementById('pagesContainer'),
  pageHome: document.getElementById('page-home'),
  innerPagesContainer: document.getElementById('innerPagesContainer'),
  breadcrumbActive: document.getElementById('breadcrumbActive'),
  breadcrumbsContainer: document.getElementById('breadcrumbsContainer'),
  pageInnerSearch: document.getElementById('pageInnerSearch'),
  academyModal: document.getElementById('academyModal'),
  joinAcademyBtn: document.getElementById('joinAcademyBtn'),
  closeAcademyModal: document.getElementById('closeAcademyModal'),
  contactModal: document.getElementById('contactModal'),
  sidebarItems: document.querySelectorAll('.sidebar-item'),
  navItems: document.querySelectorAll('.nav-item')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  checkDiscordHashToken();
  initRouter();
  initAccordions();
  initStatsObserver();
  initSearch();
  initModals();
  initMobileMenu();
  initScrollTop();
  initRadioDashboard();
  initViolationsBook();
  initBunood();
  initDiscordAuth();
  initLocalVisualEditor();
});

// ================= THEME ENGINE =================
function initTheme() {
  if (state.currentTheme === 'light') {
    elements.body.classList.add('light-theme');
    elements.themeIcon.className = 'fa-solid fa-sun';
    elements.themeText.textContent = 'مضيء';
  } else {
    elements.body.classList.remove('light-theme');
    elements.themeIcon.className = 'fa-solid fa-moon';
    elements.themeText.textContent = 'مظلم';
  }

  elements.themeToggle.addEventListener('click', () => {
    state.currentTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('pdp_theme', state.currentTheme);
    
    if (state.currentTheme === 'light') {
      elements.body.classList.add('light-theme');
      elements.themeIcon.className = 'fa-solid fa-sun';
    } else {
      elements.body.classList.remove('light-theme');
      elements.themeIcon.className = 'fa-solid fa-moon';
    }
    updateTranslatableElements();
  });
}

// ================= SPA ROUTER =================
function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute(); // Execute on initial load
}

function handleRoute() {
  const rawHash = window.location.hash;
  let hash = rawHash ? rawHash.replace('#', '') : 'home';
  
  // Ignore OAuth token hash in SPA router
  if (hash.includes('access_token=')) {
    hash = 'home';
  }
  
  state.currentRoute = hash;

  // Close mobile navigation drawer if open
  elements.navLinks.classList.remove('open');

  // Cancel any active global search displays when navigating
  if (elements.globalSearch.value !== '') {
    elements.globalSearch.value = '';
    elements.searchResultsArea.style.display = 'none';
    elements.pagesContainer.style.display = 'block';
  }

  // Clear inner search filter
  if (elements.pageInnerSearch) {
    elements.pageInnerSearch.value = '';
    filterInnerPage('');
  }

  if (hash === 'home') {
    // Show home page, hide inner page wrapper
    elements.pageHome.style.display = 'flex';
    elements.innerPagesContainer.style.display = 'none';
    elements.breadcrumbsContainer.style.visibility = 'hidden';
    
    // Highlight Navbar
    updateActiveNavItems('home');
  } else {
    // Show inner page wrapper, hide home
    elements.pageHome.style.display = 'none';
    elements.innerPagesContainer.style.display = 'grid';
    elements.breadcrumbsContainer.style.visibility = 'visible';

    // Hide all sub pages, show active one
    const subpages = document.querySelectorAll('.inner-page-section');
    let pageFound = false;

    subpages.forEach(page => {
      if (page.id === `page-${hash}`) {
        page.style.display = 'block';
        pageFound = true;
      } else {
        page.style.display = 'none';
      }
    });

    if (!pageFound) {
      // fallback to home if hash invalid
      window.location.hash = '#home';
      return;
    }

    // Highlight Navbar and Sidebar
    updateActiveNavItems(hash);
    
    // Scroll content card top into view on mobile/tablet
    if (window.innerWidth <= 992) {
      elements.innerPagesContainer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  updateBreadcrumbs();
}

function updateActiveNavItems(route) {
  // Update top Nav links
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    if (item.getAttribute('data-route') === route) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update inner Sidebar menu links
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  sidebarItems.forEach(item => {
    if (item.getAttribute('data-target') === route) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function updateBreadcrumbs() {
  if (state.currentRoute === 'home') {
    elements.breadcrumbsContainer.style.visibility = 'hidden';
    return;
  }
  elements.breadcrumbsContainer.style.visibility = 'visible';
  
  // Find navigation name from nav-item or sidebar-item
  let currentItem = document.querySelector(`.nav-item[data-route="${state.currentRoute}"] span`);
  if (!currentItem) {
    currentItem = document.querySelector(`.sidebar-item[data-target="${state.currentRoute}"] span`);
  }
  if (currentItem) {
    elements.breadcrumbActive.textContent = currentItem.textContent.trim();
  }
}

// ================= INTERACTIVE ACCORDIONS =================
function initAccordions() {
  const headers = document.querySelectorAll('.accordion-header');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.accordion-content');
      const isOpen = item.classList.contains('open');

      // Close other accordions in the same section
      const section = item.closest('.inner-page-section');
      const otherItems = section.querySelectorAll('.accordion-item');
      otherItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.accordion-content').style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        content.style.maxHeight = null;
      } else {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

// ================= ANIMATED STAT COUNTER =================
function initStatsObserver() {
  const options = {
    root: null,
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !state.statsAnimated) {
        animateStats();
        state.statsAnimated = true;
      }
    });
  }, options);

  const statsContainer = document.getElementById('statsContainer');
  if (statsContainer) {
    observer.observe(statsContainer);
  }
}

function animateStats() {
  const numbers = document.querySelectorAll('.stat-number');
  numbers.forEach(num => {
    const target = parseInt(num.getAttribute('data-target'), 10);
    const duration = 2000; // 2 seconds
    const stepTime = Math.abs(Math.floor(duration / target));
    let current = 0;
    
    // Cap stepTime at a reasonable speed to prevent locking up for low targets
    const timer = setInterval(() => {
      const increment = Math.ceil(target / 50);
      current += increment;
      if (current >= target) {
        num.textContent = target + (target === 150 ? '+' : target === 12 ? '' : target === 1240 ? '+' : '+');
        clearInterval(timer);
      } else {
        num.textContent = current;
      }
    }, Math.max(stepTime, 20));
  });
}

// ================= ADVANCED SEARCH SYSTEM =================
function initSearch() {
  // Global search input listener
  elements.globalSearch.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    performGlobalSearch(query);
  });

  // Inner page search filter
  elements.pageInnerSearch.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    filterInnerPage(query);
  });
}

function performGlobalSearch(query) {
  if (query === '') {
    // Hide results, show page content
    elements.searchResultsArea.style.display = 'none';
    elements.pagesContainer.style.display = 'block';
    return;
  }

  // Show results view, hide main contents
  elements.searchResultsArea.style.display = 'flex';
  elements.pagesContainer.style.display = 'none';
  elements.searchResultsGrid.innerHTML = '';

  const targets = document.querySelectorAll('.search-target');
  let matchCount = 0;

  targets.forEach(target => {
    let textToSearch = target.innerText.toLowerCase() + ' ';

    if (textToSearch.includes(query)) {
      matchCount++;
      
      // Determine what section it came from
      const section = target.closest('section');
      const sectionId = section.id.replace('page-', '');
      const categoryNameNode = document.querySelector(`.nav-item[data-route="${sectionId}"] span`);
      const displayCat = categoryNameNode ? categoryNameNode.textContent.trim() : 'القوانين';

      // Extract Title & Text details
      let displayTitle = '', displayBody = '';
      
      if (target.classList.contains('rule-info-card')) {
        displayTitle = target.querySelector('.rule-card-title').textContent.trim();
        displayBody = target.querySelector('.rule-card-text').textContent.trim();
      } else if (target.classList.contains('accordion-item')) {
        displayTitle = target.querySelector('.accordion-header-title span:not(.lspd-emoji)').textContent.trim();
        displayBody = target.querySelector('.accordion-content').textContent.trim();
      } else if (target.classList.contains('miranda-badge-box')) {
        displayTitle = target.querySelector('.miranda-title span:not(.lspd-emoji)').textContent.trim();
        displayBody = target.querySelector('.miranda-speech').textContent.trim();
      } else {
        const titleNode = target.querySelector('h3, h4');
        const textNode = target.querySelector('p');
        displayTitle = titleNode ? titleNode.textContent.trim() : '';
        displayBody = textNode ? textNode.textContent.trim() : '';
      }

      // Construct Result Card
      const resultCard = document.createElement('div');
      resultCard.className = 'search-result-item';
      resultCard.innerHTML = `
        <div class="search-result-category">${displayCat}</div>
        <div class="search-result-title">${highlightKeyword(displayTitle, query)}</div>
        <div class="search-result-snippet">${highlightKeyword(displayBody, query)}</div>
      `;

      // Interactive Clicking directs user straight to section and target element
      resultCard.addEventListener('click', () => {
        // 1. Navigate to page hash
        window.location.hash = `#${sectionId}`;
        
        // 2. Clear global search
        elements.globalSearch.value = '';
        elements.searchResultsArea.style.display = 'none';
        elements.pagesContainer.style.display = 'block';

        // 3. Highlight target element visually & scroll it into view
        setTimeout(() => {
          const matchedElementInDOM = document.getElementById(target.id) || findDOMElementByTitle(displayTitle);
          if (matchedElementInDOM) {
            // Expand accordion if target is inside one or is accordion
            if (matchedElementInDOM.classList.contains('accordion-item')) {
              matchedElementInDOM.classList.add('open');
            }
            
            matchedElementInDOM.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Pulse highlight effect
            matchedElementInDOM.style.outline = '2px solid var(--accent-gold)';
            matchedElementInDOM.style.boxShadow = 'var(--shadow-gold)';
            setTimeout(() => {
              matchedElementInDOM.style.outline = 'none';
              matchedElementInDOM.style.boxShadow = 'none';
            }, 2500);
          }
        }, 100);
      });

      elements.searchResultsGrid.appendChild(resultCard);
    }
  });

  elements.resultsCount.textContent = matchCount;
}

function highlightKeyword(text, keyword) {
  if (!text) return '';
  const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Find actual target element in active page
function findDOMElementByTitle(arabicTitle) {
  const elements = document.querySelectorAll('.search-target');
  for (let el of elements) {
    const titleNode = el.querySelector('.rule-card-title, .accordion-header-title span:not(.lspd-emoji), .miranda-title span:not(.lspd-emoji), h3, h4');
    if (titleNode && titleNode.textContent.trim() === arabicTitle.trim()) {
      return el;
    }
  }
  return null;
}

function filterInnerPage(query) {
  const activeSection = document.querySelector(`.inner-page-section[id="page-${state.currentRoute}"]`);
  if (!activeSection) return;

  const cards = activeSection.querySelectorAll('.search-target');
  cards.forEach(card => {
    let searchableText = card.innerText.toLowerCase() + ' ';
    const attrElements = card.querySelectorAll('[data-en], [data-ar]');
    

    if (searchableText.includes(query)) {
      card.style.display = card.classList.contains('rule-info-card') ? 'flex' : 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// ================= MODALS SYSTEM =================
function initModals() {
  // Safely handle modals - elements may have been removed from HTML
  if (elements.joinAcademyBtn && elements.academyModal) {
    elements.joinAcademyBtn.addEventListener('click', () => {
      elements.academyModal.classList.add('open');
    });
  }

  if (elements.closeAcademyModal && elements.academyModal) {
    elements.closeAcademyModal.addEventListener('click', () => {
      elements.academyModal.classList.remove('open');
    });
  }

  window.addEventListener('click', (e) => {
    if (elements.academyModal && e.target === elements.academyModal) {
      elements.academyModal.classList.remove('open');
    }
    if (elements.contactModal && e.target === elements.contactModal) {
      closeContactModal();
    }
  });
}

function openContactModal() {
  if (elements.contactModal) elements.contactModal.classList.add('open');
}

function closeContactModal() {
  if (elements.contactModal) elements.contactModal.classList.remove('open');
}

// ================= MOBILE NAVIGATION MENU =================
function initMobileMenu() {
  elements.menuToggle.addEventListener('click', () => {
    elements.navLinks.classList.toggle('open');
  });

  // Close mobile menu if clicked outside
  document.addEventListener('click', (e) => {
    if (!elements.menuToggle.contains(e.target) && !elements.navLinks.contains(e.target)) {
      elements.navLinks.classList.remove('open');
    }
  });
}

// ================= FLOATING SCROLL TO TOP BUTTON =================
function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
  
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ================= RADIO PROTOCOLS DASHBOARD =================
function initRadioDashboard() {
  // 1. Collapsible sections toggling
  const headers = document.querySelectorAll('.radio-section-header');
  headers.forEach(h => {
    h.addEventListener('click', () => {
      const section = h.parentElement;
      section.classList.toggle('open');
    });
  });

  // 2. Sidebar click scrolling and active highlight
  const sidebarItems = document.querySelectorAll('.radio-nav-item');
  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        // Expand if collapsed
        targetEl.classList.add('open');
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Highlight active
        sidebarItems.forEach(el => el.classList.remove('active'));
        item.classList.add('active');
      }
    });
  });

  // 3. Search Filter in Codes Table
  const searchInput = document.getElementById('radioCodesSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      const rows = document.querySelectorAll('.radio-code-row');
      rows.forEach(row => {
        const code = row.getAttribute('data-code').toLowerCase();
        const pronounce = row.getAttribute('data-pronounce').toLowerCase();
        const meaning = row.getAttribute('data-meaning').toLowerCase();
        
        if (code.includes(query) || pronounce.includes(query) || meaning.includes(query)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // 4. Modal Popup on Row Clicking
  const rows = document.querySelectorAll('.radio-code-row');
  const modal = document.getElementById('radioCodeModal');
  const closeBtn = document.getElementById('closeRadioCodeModal');
  
  if (modal && closeBtn) {
    rows.forEach(row => {
      row.addEventListener('click', () => {
        const code = row.getAttribute('data-code');
        const pronounce = row.getAttribute('data-pronounce');
        const meaning = row.getAttribute('data-meaning');
        const example = row.getAttribute('data-example') || '';
        
        document.getElementById('modalCodeName').textContent = code;
        document.getElementById('modalCodePronounce').textContent = pronounce;
        document.getElementById('modalCodeMeaning').textContent = meaning;
        
        const exampleEl = document.getElementById('modalCodeExample');
        if (example) {
          exampleEl.textContent = example;
          document.getElementById('copyCodeExampleBtn').style.display = 'flex';
        } else {
          exampleEl.textContent = 'لا يوجد مثال متاح حالياً.';
          document.getElementById('copyCodeExampleBtn').style.display = 'none';
        }
        
        modal.style.display = 'flex';
      });
    });
    
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  // 5. Copy example button logic
  const copyBtn = document.getElementById('copyCodeExampleBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent modal close
      const exampleText = document.getElementById('modalCodeExample').textContent;
      navigator.clipboard.writeText(exampleText).then(() => {
        const spanText = copyBtn.querySelector('span');
        const oldText = spanText.textContent;
        spanText.textContent = 'تم النسخ!';
        copyBtn.style.background = 'var(--accent-gold)';
        copyBtn.style.color = 'var(--primary-navy)';
        
        setTimeout(() => {
          spanText.textContent = oldText;
          copyBtn.style.background = 'rgba(230, 175, 46, 0.1)';
          copyBtn.style.color = 'var(--accent-gold)';
        }, 1500);
      });
    });
  }
}

// ================= TICKET BOOK / VIOLATIONS ENGINE =================
function initViolationsBook() {
  // 1. Collapsible sections toggling
  const headers = document.querySelectorAll('.ticket-section-header');
  headers.forEach(h => {
    h.addEventListener('click', () => {
      const section = h.parentElement;
      section.classList.toggle('open');
    });
  });

  // 2. Real-time Search Filter
  const searchInput = document.getElementById('ticketSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      const rows = document.querySelectorAll('.violation-row');
      
      rows.forEach(row => {
        const ar = row.querySelector('.violation-ar').textContent.toLowerCase();
        const en = row.querySelector('.violation-en').textContent.toLowerCase();
        const desc = row.querySelector('.violation-desc').textContent.toLowerCase();
        const fine = row.querySelector('.violation-fine').textContent.toLowerCase();
        const jail = row.querySelector('.violation-jail').textContent.toLowerCase();
        const bail = row.querySelector('.violation-bail').textContent.toLowerCase();
        
        if (ar.includes(query) || en.includes(query) || desc.includes(query) || fine.includes(query) || jail.includes(query) || bail.includes(query)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
      
      // Auto-expand sections having visible search results, collapse those with none
      const sections = document.querySelectorAll('.ticket-collapsible-section');
      sections.forEach(sec => {
        // We select the rows inside the current section's table
        const visibleRows = sec.querySelectorAll('.violation-row:not([style*="display: none"])');
        
        // Count how many violation-row have display != none
        let visibleCount = 0;
        sec.querySelectorAll('.violation-row').forEach(r => {
          if (r.style.display !== 'none') {
            visibleCount++;
          }
        });
        
        if (query !== '') {
          if (visibleCount > 0) {
            sec.classList.add('open');
          } else {
            sec.classList.remove('open');
          }
        }
      });
    });
  }
}

// ================= BUNOOD (CLAUSES) ENGINE =================
function initBunood() {
  // 1. Search filter
  const searchInput = document.getElementById('bunoodSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      filterBunood(q, getActiveFilter());
    });
  }

  // 2. Degree filter buttons
  const filterBtns = document.querySelectorAll('.bunood-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      filterBunood(q, btn.getAttribute('data-filter'));
    });
  });
}

function getActiveFilter() {
  const active = document.querySelector('.bunood-filter-btn.active');
  return active ? active.getAttribute('data-filter') : 'all';
}

function filterBunood(query, degree) {
  // Show/hide full degree cards
  const cards = document.querySelectorAll('.bunood-degree-card');
  cards.forEach(card => {
    const cardDegree = card.getAttribute('data-degree');
    const degreeMatch = degree === 'all' || cardDegree === degree;
    
    if (!degreeMatch) {
      card.style.display = 'none';
      return;
    }
    card.style.display = '';
    
    // Item-level filtering
    const items = card.querySelectorAll('.bunood-item');
    let anyVisible = false;
    items.forEach(item => {
      const num  = (item.getAttribute('data-num') || '').toLowerCase();
      const text = (item.querySelector('.bunood-text') || {}).textContent || '';
      const textLower = text.toLowerCase();
      const matches = !query || num.includes(query) || textLower.includes(query);
      item.style.display = matches ? '' : 'none';
      if (matches) anyVisible = true;
    });
    
    // Hide card if no items match when searching
    if (query && !anyVisible) {
      card.style.display = 'none';
    }
  });
}


// ================= AZKAR ENGINE =================
function switchAzkarTab(btn, tabId) {
  // Deactivate all tabs and contents
  document.querySelectorAll('.azkar-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.azkar-tab-content').forEach(c => c.classList.remove('active'));
  // Activate clicked
  btn.classList.add('active');
  const tab = document.getElementById(tabId);
  if (tab) tab.classList.add('active');
}

function countAzkar(badge) {
  const max = parseInt(badge.dataset.max) || 1;
  const cntEl = badge.querySelector('.cnt');
  let current = parseInt(cntEl.textContent) || 0;
  if (current < max) {
    current++;
    cntEl.textContent = current;
    if (current >= max) {
      badge.classList.add('done');
      badge.textContent = '✓ تم الانتهاء';
    }
  }
}

function copyAzkar(btn) {
  const card = btn.closest('.azkar-card');
  const text = card.querySelector('.azkar-text').textContent.trim();
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check" style="color:#4ec4b6;"></i>';
    setTimeout(() => { btn.innerHTML = orig; }, 1500);
  });
}

// Salah counter (persisted in localStorage)
let salahCount = parseInt(localStorage.getItem('salahCount') || '0');
function updateSalahDisplay() {
  const el = document.getElementById('salahBigCount');
  if (el) el.textContent = salahCount;
}
function incrementSalah() {
  salahCount++;
  localStorage.setItem('salahCount', salahCount);
  updateSalahDisplay();
  // Animate
  const el = document.getElementById('salahBigCount');
  if (el) {
    el.style.transform = 'scale(1.3)';
    el.style.color = '#fff';
    setTimeout(() => {
      el.style.transform = 'scale(1)';
      el.style.color = '#64b4ff';
    }, 200);
  }
}
function resetSalah() {
  if (confirm('هل تريد إعادة تعيين عداد الصلاة على النبي ﷺ؟')) {
    salahCount = 0;
    localStorage.setItem('salahCount', '0');
    updateSalahDisplay();
  }
}

// Call on page load to restore count
document.addEventListener('DOMContentLoaded', updateSalahDisplay);

// ================= SALAH POPUP =================
function showSalahPopup() {
  const popup = document.getElementById('salahPopup');
  if (popup) {
    popup.classList.add('visible');
    // Auto-close after 12 seconds
    setTimeout(() => { if (popup.classList.contains('visible')) closeSalahPopup(); }, 12000);
  }
}
function closeSalahPopup() {
  const popup = document.getElementById('salahPopup');
  if (popup) popup.classList.remove('visible');
}

// Show popup every 60 seconds
document.addEventListener('DOMContentLoaded', () => {
  // Show first one after 30 seconds
  setTimeout(showSalahPopup, 300000);
  // Then every 60 seconds
  setInterval(showSalahPopup, 600000);
});

// ================= ICON UPLOAD ENGINE =================
let _currentUploadTarget = null;

function triggerIconUpload(sectionId) {
  _currentUploadTarget = sectionId;
  const input = document.getElementById('iconFileInput');
  if (input) input.click();
}

function handleIconUpload(event) {
  const file = event.target.files[0];
  if (!file || !_currentUploadTarget) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    // Store in localStorage
    localStorage.setItem('sectionIcon_' + _currentUploadTarget, base64);
    // Apply immediately
    applySectionIcon(_currentUploadTarget, base64);
    // Show toast
    const toast = document.getElementById('iconUploadToast');
    if (toast) {
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }
    // Reset input
    event.target.value = '';
    _currentUploadTarget = null;
  };
  reader.readAsDataURL(file);
}

function applySectionIcon(sectionId, src) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  const titleContainer = section.querySelector('.policy-title-container');
  if (!titleContainer) return;

  // Find the existing icon (img, i, or span) - first child
  const firstChild = titleContainer.firstElementChild;
  if (!firstChild) return;

  // Replace with img
  const img = document.createElement('img');
  img.src = src;
  img.alt = 'أيقونة القسم';
  img.className = 'section-emoji-img';
  img.style.cssText = 'width:64px;height:64px;object-fit:contain;filter:drop-shadow(0 0 10px rgba(230,175,46,0.35));';
  titleContainer.replaceChild(img, firstChild);
}

// Restore saved icons on page load
document.addEventListener('DOMContentLoaded', () => {
  const sectionIds = [
    'page-general-rules', 'page-dispatcher-taser', 'page-radio-protocols',
    'page-pursuit-policy', 'page-case-management', 'page-criminal-procedures',
    'page-firearm-policy', 'page-contraband-policy', 'page-azkar', 'page-site-updates'
  ];
  sectionIds.forEach(id => {
    const saved = localStorage.getItem('sectionIcon_' + id);
    if (saved) applySectionIcon(id, saved);
  });
});

// ================= DISCORD AUTHENTICATION =================
function initDiscordAuth() {
  const discordLoginBtn = document.getElementById('discordLoginBtn');
  const userProfileContainer = document.getElementById('userProfileContainer');
  const userProfileBadge = document.getElementById('userProfileBadge');
  const userAvatarImg = document.getElementById('userAvatarImg');
  const userNameText = document.getElementById('userNameText');
  const userDropdownMenu = document.getElementById('userDropdownMenu');
  const dropdownAvatarImg = document.getElementById('dropdownAvatarImg');
  const dropdownDisplayName = document.getElementById('dropdownDisplayName');
  const dropdownUsername = document.getElementById('dropdownUsername');
  const dropdownUserId = document.getElementById('dropdownUserId');
  const discordLogoutBtn = document.getElementById('discordLogoutBtn');

  // Client ID from User Discord Developer Application
  const DEFAULT_DISCORD_CLIENT_ID = '1533392511685627964';

  // Parse token hash if redirected back from Discord, & render real user UI
  checkDiscordHashToken();
  renderDiscordUserUI();

  // Discord Login Click - Direct Official OAuth Flow
  if (discordLoginBtn) {
    discordLoginBtn.addEventListener('click', () => {
      const clientId = localStorage.getItem('pdp_discord_client_id') || DEFAULT_DISCORD_CLIENT_ID;

      if (window.location.protocol === 'file:') {
        alert('ملاحظة هامة: ديسكورد يشترط فتح الموقع من خلال سيرفر محلي (مثل Live Server في VS Code) أو رابط استضافة لتسجيل الدخول الرسمي بدلاً من فتح الملف كـ file://.');
        return;
      }

      loginWithDiscord(clientId);
    });
  }

  // Toggle Dropdown Profile Menu
  if (userProfileBadge && userProfileContainer) {
    userProfileBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      userProfileContainer.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!userProfileContainer.contains(e.target)) {
        userProfileContainer.classList.remove('active');
      }
    });
  }

  // Logout Click
  if (discordLogoutBtn) {
    discordLogoutBtn.addEventListener('click', () => {
      localStorage.removeItem('pdp_discord_user');
      userProfileContainer.classList.remove('active');
      renderDiscordUserUI();
    });
  }

  // Admin Control Panel Modal Listener
  initAdminControlModal();
}

function loginWithDiscord(clientId) {
  // Clean redirect URI without hash or query params
  const redirectUri = window.location.origin + window.location.pathname;
  const scope = encodeURIComponent('identify');
  const responseType = 'token';
  const authUrl = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}`;
  
  // Redirect to official Discord authorization URL
  window.location.href = authUrl;
}

function checkDiscordHashToken() {
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token=')) return;

  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get('access_token');

  if (accessToken) {
    // Immediately replace hash with #home to keep SPA router clean & functional
    history.replaceState(null, document.title, window.location.pathname + window.location.search + '#home');

    // Fetch REAL user profile data directly from Discord API
    fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('فشل جلب بيانات ديسكورد الرسمية');
      return res.json();
    })
    .then(user => {
      let avatarUrl = 'logo_blue.png';
      if (user.avatar) {
        const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
        avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
      } else {
        const defaultIndex = user.discriminator && user.discriminator !== '0'
          ? (parseInt(user.discriminator) % 5)
          : (Number(BigInt(user.id) >> 22n) % 6);
        avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
      }

      const userData = {
        id: user.id,
        username: user.username,
        global_name: user.global_name || user.username,
        avatar_url: avatarUrl,
        access_token: accessToken,
        logged_in_at: Date.now()
      };

      localStorage.setItem('pdp_discord_user', JSON.stringify(userData));
      renderDiscordUserUI();
      
      // Ensure home page is displayed after login
      if (typeof handleRoute === 'function') {
        handleRoute();
      }
    })
    .catch(err => {
      console.error('Discord Auth Error:', err);
    });
  }
}

function renderDiscordUserUI() {
  const discordLoginBtn = document.getElementById('discordLoginBtn');
  const userProfileContainer = document.getElementById('userProfileContainer');
  const userAvatarImg = document.getElementById('userAvatarImg');
  const userNameText = document.getElementById('userNameText');
  const dropdownAvatarImg = document.getElementById('dropdownAvatarImg');
  const dropdownDisplayName = document.getElementById('dropdownDisplayName');
  const dropdownUsername = document.getElementById('dropdownUsername');
  const dropdownUserId = document.getElementById('dropdownUserId');

  const savedUserStr = localStorage.getItem('pdp_discord_user');

  if (savedUserStr) {
    try {
      const user = JSON.parse(savedUserStr);
      if (discordLoginBtn) discordLoginBtn.style.display = 'none';
      if (userProfileContainer) userProfileContainer.style.display = 'flex';

      const displayName = user.global_name || user.username || 'المستخدم';
      const avatar = user.avatar_url || 'logo_blue.png';

      if (userAvatarImg) userAvatarImg.src = avatar;
      if (userNameText) userNameText.textContent = displayName;

      if (dropdownAvatarImg) dropdownAvatarImg.src = avatar;
      if (dropdownDisplayName) dropdownDisplayName.textContent = displayName;
      if (dropdownUsername) dropdownUsername.textContent = `@${user.username}`;
      if (dropdownUserId) dropdownUserId.textContent = `ID: ${user.id}`;
    } catch (e) {
      console.error('Failed to parse saved user:', e);
      if (discordLoginBtn) discordLoginBtn.style.display = 'flex';
      if (userProfileContainer) userProfileContainer.style.display = 'none';
    }
  } else {
    if (discordLoginBtn) discordLoginBtn.style.display = 'flex';
    if (userProfileContainer) userProfileContainer.style.display = 'none';
  }

  // Apply Role Permissions to UI
  applyUserPermissions();
}

// ================= ROLE BASED ACCESS CONTROL (RBAC) =================
const OVERLORD_DISCORD_ID = '1131693155067105442';

const DEFAULT_ROLES_MAP = {
  '1131693155067105442': 'OVERLORD',
  '855870309349589012': 'OFFICER',
  '1436542857958920312': 'SUPERVISOR'
};

function getStoredRolesMap() {
  let map = Object.assign({}, DEFAULT_ROLES_MAP, window.PDP_GLOBAL_ROLES_MAP || {});
  const saved = localStorage.getItem('pdp_user_roles_map');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.keys(parsed).forEach(id => {
        if (parsed[id] === 'REMOVED' || parsed[id] === null || parsed[id] === false) {
          delete map[id];
        } else {
          map[id] = parsed[id];
        }
      });
    } catch(e) {}
  }
  return map;
}

function saveRolesMap(map) {
  const fullState = {};
  const allKnownIds = new Set([
    ...Object.keys(DEFAULT_ROLES_MAP),
    ...Object.keys(window.PDP_GLOBAL_ROLES_MAP || {}),
    ...Object.keys(map)
  ]);

  allKnownIds.forEach(id => {
    if (map[id] && map[id] !== 'REMOVED') {
      fullState[id] = map[id];
    } else {
      fullState[id] = 'REMOVED';
    }
  });

  localStorage.setItem('pdp_user_roles_map', JSON.stringify(fullState));
  window.PDP_GLOBAL_ROLES_MAP = Object.assign({}, map);
}

function getOfficerAllowedPages() {
  const saved = localStorage.getItem('pdp_officer_allowed_pages');
  if (saved) {
    try { return JSON.parse(saved); } catch(e) {}
  }
  return ['internal-affairs', 'academy-questions'];
}

function saveOfficerAllowedPages(pagesArr) {
  localStorage.setItem('pdp_officer_allowed_pages', JSON.stringify(pagesArr));
}

function getUserRole(discordId) {
  if (!discordId) return 'GUEST';
  const cleanId = String(discordId).trim();
  if (cleanId === OVERLORD_DISCORD_ID) return 'OVERLORD';

  const rolesMap = getStoredRolesMap();
  if (rolesMap[cleanId]) {
    return rolesMap[cleanId];
  }
  return 'GUEST';
}

function applyUserPermissions() {
  const savedUserStr = localStorage.getItem('pdp_discord_user');
  let currentRole = 'GUEST';
  let userId = null;

  if (savedUserStr) {
    try {
      const user = JSON.parse(savedUserStr);
      userId = user.id;
      currentRole = getUserRole(user.id);
    } catch(e) {}
  }

  const roleBadge = document.getElementById('dropdownRoleBadge');
  const adminControlBtn = document.getElementById('adminControlBtn');

  if (roleBadge) {
    roleBadge.className = 'user-role-badge ' + currentRole.toLowerCase();
    if (currentRole === 'OVERLORD') roleBadge.textContent = 'المشرف العام 👑';
    else if (currentRole === 'SUPERVISOR') roleBadge.textContent = 'مسؤول 🛡️';
    else if (currentRole === 'OFFICER') roleBadge.textContent = 'أوفسر ⭐️';
    else roleBadge.textContent = 'عضو';
  }

  if (adminControlBtn) {
    adminControlBtn.style.display = (currentRole === 'OVERLORD') ? 'flex' : 'none';
  }

  const sidebarIA = document.getElementById('sidebar-internal-affairs');
  const sidebarAcademy = document.getElementById('sidebar-academy-questions');
  const sidebarDivider = document.getElementById('sidebar-restricted-divider');
  const navIA = document.getElementById('nav-internal-affairs');
  const navAcademy = document.getElementById('nav-academy-questions');

  const officerAllowed = getOfficerAllowedPages();

  const isLocal = window.location.protocol === 'file:' || 
                  window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';

  let canAccessIA = isLocal;
  let canAccessAcademy = isLocal;

  if (currentRole === 'OVERLORD' || currentRole === 'SUPERVISOR') {
    canAccessIA = true;
    canAccessAcademy = true;
  } else if (currentRole === 'OFFICER') {
    canAccessIA = officerAllowed.includes('internal-affairs');
    canAccessAcademy = officerAllowed.includes('academy-questions');
  }

  if (sidebarIA) sidebarIA.style.display = canAccessIA ? 'block' : 'none';
  if (sidebarAcademy) sidebarAcademy.style.display = canAccessAcademy ? 'block' : 'none';
  if (sidebarDivider) sidebarDivider.style.display = (canAccessIA || canAccessAcademy) ? 'block' : 'none';

  if (navIA) navIA.style.display = canAccessIA ? 'block' : 'none';
  if (navAcademy) navAcademy.style.display = canAccessAcademy ? 'block' : 'none';

  const currentRoute = state.currentRoute;
  if (currentRoute === 'internal-affairs' && !canAccessIA) {
    window.location.hash = '#home';
  } else if (currentRoute === 'academy-questions' && !canAccessAcademy) {
    window.location.hash = '#home';
  }
}

function initAdminControlModal() {
  const adminControlBtn = document.getElementById('adminControlBtn');
  const adminModal = document.getElementById('adminControlModal');
  const closeBtn = document.getElementById('closeAdminControlModal');
  const addBtn = document.getElementById('adminAddRoleBtn');
  const idInput = document.getElementById('adminNewDiscordId');
  const roleSelect = document.getElementById('adminNewRoleSelect');
  const allowOfficerIA = document.getElementById('allowOfficerIA');
  const allowOfficerAcademy = document.getElementById('allowOfficerAcademy');

  if (adminControlBtn && adminModal) {
    adminControlBtn.addEventListener('click', () => {
      const userContainer = document.getElementById('userProfileContainer');
      if (userContainer) userContainer.classList.remove('active');
      renderAdminRolesTable();
      
      const officerPages = getOfficerAllowedPages();
      if (allowOfficerIA) allowOfficerIA.checked = officerPages.includes('internal-affairs');
      if (allowOfficerAcademy) allowOfficerAcademy.checked = officerPages.includes('academy-questions');

      adminModal.classList.add('open');
    });
  }

  if (closeBtn && adminModal) {
    closeBtn.addEventListener('click', () => adminModal.classList.remove('open'));
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) adminModal.classList.remove('open');
    });
  }

  if (addBtn && idInput && roleSelect) {
    addBtn.addEventListener('click', () => {
      const newId = idInput.value.trim();
      const newRole = roleSelect.value;
      if (!newId || !/^\d+$/.test(newId)) {
        alert('الرجاء إدخال Discord ID صحيح (أرقام فقط).');
        return;
      }

      const map = getStoredRolesMap();
      map[newId] = newRole;
      saveRolesMap(map);
      idInput.value = '';
      renderAdminRolesTable();
      applyUserPermissions();
    });
  }

  if (allowOfficerIA && allowOfficerAcademy) {
    const handleOfficerToggle = () => {
      const pages = [];
      if (allowOfficerIA.checked) pages.push('internal-affairs');
      if (allowOfficerAcademy.checked) pages.push('academy-questions');
      saveOfficerAllowedPages(pages);
      applyUserPermissions();
    };
    allowOfficerIA.addEventListener('change', handleOfficerToggle);
    allowOfficerAcademy.addEventListener('change', handleOfficerToggle);
  }

  const adminExportRolesBtn = document.getElementById('adminExportRolesBtn');
  if (adminExportRolesBtn) {
    adminExportRolesBtn.addEventListener('click', () => {
      exportCleanHtmlFile();
    });
  }
}

function renderAdminRolesTable() {
  const tbody = document.getElementById('adminRolesTableBody');
  if (!tbody) return;

  const map = getStoredRolesMap();
  tbody.innerHTML = '';

  Object.keys(map).forEach(id => {
    const role = map[id];
    if (!role || role === 'REMOVED') return;

    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border-color)';

    let roleName = 'عضو';
    if (role === 'OVERLORD') roleName = 'المشرف العام 👑';
    else if (role === 'SUPERVISOR') roleName = 'مسؤول 🛡️';
    else if (role === 'OFFICER') roleName = 'أوفسر ⭐️';

    let removeBtnHtml = `<button type="button" class="admin-remove-btn" data-id="${id}" style="background:rgba(239,68,68,0.2); color:var(--danger); border:1px solid var(--danger); padding:0.25rem 0.65rem; border-radius:4px; font-size:0.78rem; font-weight:bold; cursor:pointer; transition:all 0.2s ease;">إزالة</button>`;
    if (role === 'OVERLORD') {
      removeBtnHtml = `<span style="font-size:0.75rem; color:var(--text-secondary);">مالك الموقع</span>`;
    }

    tr.innerHTML = `
      <td style="padding:0.5rem 0.75rem; font-family:monospace;">${id}</td>
      <td style="padding:0.5rem 0.75rem; font-weight:bold;">${roleName}</td>
      <td style="padding:0.5rem 0.75rem; text-align:center;">${removeBtnHtml}</td>
    `;
    tbody.appendChild(tr);
  });

  // Attach direct event listeners to remove buttons
  const removeBtns = tbody.querySelectorAll('.admin-remove-btn');
  removeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = btn.getAttribute('data-id');
      deleteRoleForId(targetId);
    });
  });
}

function deleteRoleForId(id) {
  const cleanId = String(id).trim();
  if (cleanId === OVERLORD_DISCORD_ID) return;

  const map = getStoredRolesMap();
  delete map[cleanId];
  saveRolesMap(map);
  renderAdminRolesTable();
  applyUserPermissions();
}

window.deleteRoleForId = deleteRoleForId;

// ================= LOCAL INLINE PENCIL EDITOR ENGINE =================
function initLocalVisualEditor() {
  const isLocal = window.location.protocol === 'file:' || 
                  window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';

  const localExportHeaderBtn = document.getElementById('localExportHeaderBtn');

  // Show header export button ONLY if opened locally
  if (isLocal) {
    if (localExportHeaderBtn) {
      localExportHeaderBtn.style.display = 'inline-flex';
      localExportHeaderBtn.addEventListener('click', exportCleanHtmlFile);
    }
  } else {
    // Hidden on production domain
    if (localExportHeaderBtn) localExportHeaderBtn.style.display = 'none';
    return;
  }

  // Restore saved edits from localStorage
  restoreLocalTextEdits();

  // Attach pencil edit buttons to all text nodes & lists
  attachPencilButtons();

  // Re-attach whenever page changes
  window.addEventListener('hashchange', () => {
    setTimeout(attachPencilButtons, 150);
  });

  function attachPencilButtons() {
    // Select structured containers for hover pencil icons (EXCLUDING nav links)
    const blockSelectors = `
      .rule-info-card, .announcement-card, .quick-card,
      .policy-header, .hero-content, .azkar-card,
      .accordion-item
    `;

    const blocks = document.querySelectorAll(blockSelectors);

    blocks.forEach(el => {
      if (el.dataset.pencilAttached) return;
      el.dataset.pencilAttached = 'true';

      if (getComputedStyle(el).position === 'static') {
        el.style.position = 'relative';
      }

      // Create pencil button at top corner
      const pencil = document.createElement('button');
      pencil.className = 'pencil-edit-btn';
      pencil.innerHTML = '<i class="fa-solid fa-pen"></i>';
      pencil.title = 'تعديل هذا المحتوى';
      pencil.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const textTarget = el.querySelector('.rule-card-text, .rule-card-title, .announcement-desc, .policy-description, .quick-card-desc, .hero-subtitle, p, span') || el;
        startEditingElement(textTarget);
      });

      el.appendChild(pencil);
    });

    // Double-click to edit content text elements on the page (EXCLUDING nav links)
    const allTextEls = document.querySelectorAll(`
      .rule-card-title, .rule-card-text, .rule-card-num,
      .announcement-title, .announcement-desc, .announcement-date,
      .policy-title, .policy-description, .hero-title, .hero-subtitle,
      .accordion-title, .accordion-desc, .accordion-body p, .accordion-body li,
      .azkar-text, .salah-hero h2, .salah-desc,
      .quick-card-title, .quick-card-desc,
      .alert-box, h1, h2, h3, h4, h5, h6, p, li, td, th
    `);

    allTextEls.forEach(el => {
      if (el.dataset.dblclickAttached) return;
      if (['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'BUTTON'].includes(el.tagName)) return;
      if (el.closest('.nav-links') || el.closest('.sidebar-menu') || el.tagName === 'A' || el.closest('a')) return; // Exclude nav links!
      if (el.classList.contains('pencil-edit-btn') || el.classList.contains('inline-popover-btn') || el.classList.contains('local-export-badge-btn')) return;

      el.dataset.dblclickAttached = 'true';
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        startEditingElement(el);
      });
    });

    // Image click edit for content images
    const images = document.querySelectorAll('img:not(.user-avatar):not(.dropdown-avatar)');
    images.forEach(img => {
      if (img.dataset.imageEditAttached) return;
      if (img.closest('.nav-links') || img.closest('.sidebar-menu')) return;

      img.dataset.imageEditAttached = 'true';
      img.style.cursor = 'pointer';
      img.title = 'انقر لتغيير هذه الصورة';
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        const input = document.getElementById('localImageFileInput');
        if (!input) return;
        
        const onFileSelect = (evt) => {
          const file = evt.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (re) => {
              img.src = re.target.result;
              saveAllTextEditsToStorage();
              showInlineToast('✓ تم تغيير الصورة بنجاح');
            };
            reader.readAsDataURL(file);
          }
          input.removeEventListener('change', onFileSelect);
        };
        input.addEventListener('change', onFileSelect);
        input.click();
      });
    });
  }

  let activeEditingElement = null;
  let activeOriginalHTML = '';
  let activePopover = null;

  function startEditingElement(el) {
    if (activeEditingElement && activeEditingElement !== el) {
      cancelEditingCurrent();
    }

    activeEditingElement = el;

    // Temporarily hide pencil button inside element during edit
    const pencilBtn = el.querySelector('.pencil-edit-btn');
    if (pencilBtn) pencilBtn.style.display = 'none';

    activeOriginalHTML = el.innerHTML;
    el.classList.add('inline-editing-active');
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('spellcheck', 'false');
    el.focus();

    // Create Save / Cancel popover toolbar
    const popover = document.createElement('div');
    popover.className = 'inline-action-popover';
    popover.innerHTML = `
      <button class="inline-popover-btn save"><i class="fa-solid fa-check"></i> حفظ</button>
      <button class="inline-popover-btn cancel"><i class="fa-solid fa-xmark"></i> إلغاء</button>
    `;

    // Prevent contenteditable focus loss on clicking buttons
    popover.addEventListener('mousedown', (e) => e.preventDefault());

    popover.querySelector('.save').addEventListener('click', (e) => {
      e.stopPropagation();
      saveEditingCurrent();
    });

    popover.querySelector('.cancel').addEventListener('click', (e) => {
      e.stopPropagation();
      cancelEditingCurrent();
    });

    // Handle ESC key
    const handleKeyDown = (evt) => {
      if (evt.key === 'Escape') {
        cancelEditingCurrent();
        el.removeEventListener('keydown', handleKeyDown);
      }
    };
    el.addEventListener('keydown', handleKeyDown);

    // Append popover
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }
    el.appendChild(popover);
    activePopover = popover;
  }

  function saveEditingCurrent() {
    if (!activeEditingElement) return;

    if (activePopover) activePopover.remove();

    const pencilBtn = activeEditingElement.querySelector('.pencil-edit-btn');
    if (pencilBtn) pencilBtn.style.display = 'inline-flex';

    activeEditingElement.removeAttribute('contenteditable');
    activeEditingElement.removeAttribute('spellcheck');
    activeEditingElement.classList.remove('inline-editing-active');

    saveAllTextEditsToStorage();
    showInlineToast('✓ تم حفظ النص بنجاح');

    activeEditingElement = null;
    activePopover = null;
    activeOriginalHTML = '';
  }

  function cancelEditingCurrent() {
    if (!activeEditingElement) return;

    if (activePopover) activePopover.remove();

    // Revert exact original HTML
    activeEditingElement.innerHTML = activeOriginalHTML;

    const pencilBtn = activeEditingElement.querySelector('.pencil-edit-btn');
    if (pencilBtn) pencilBtn.style.display = 'inline-flex';

    activeEditingElement.removeAttribute('contenteditable');
    activeEditingElement.removeAttribute('spellcheck');
    activeEditingElement.classList.remove('inline-editing-active');

    showInlineToast('✕ تم إلغاء التعديل', true);

    activeEditingElement = null;
    activePopover = null;
    activeOriginalHTML = '';
  }

  function saveAllTextEditsToStorage() {
    const editsData = [];
    const targets = document.querySelectorAll('[data-pencil-attached="true"]');
    targets.forEach(el => {
      const clone = el.cloneNode(true);
      const pencil = clone.querySelector('.pencil-edit-btn');
      if (pencil) pencil.remove();

      const selector = getUniqueSelector(el);
      editsData.push({
        selector: selector,
        html: clone.innerHTML
      });
    });
    localStorage.setItem('pdp_local_text_edits', JSON.stringify(editsData));
  }

  function restoreLocalTextEdits() {
    const saved = localStorage.getItem('pdp_local_text_edits');
    if (!saved) return;
    try {
      const editsData = JSON.parse(saved);
      editsData.forEach(item => {
        if (item.selector) {
          const el = document.querySelector(item.selector);
          if (el && item.html) {
            const pencil = el.querySelector('.pencil-edit-btn');
            el.innerHTML = item.html;
            if (pencil) el.appendChild(pencil);
          }
        }
      });
    } catch(e) {}
  }

  function getUniqueSelector(el) {
    if (el.id) return `#${el.id}`;
    let path = [];
    while (el && el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.className) {
        const classes = String(el.className).replace('inline-editing-active', '').trim().split(/\s+/).filter(c => c && !c.includes('contenteditable')).join('.');
        if (classes) selector += '.' + classes;
      }
      let sibling = el;
      let nth = 1;
      while (sibling = sibling.previousElementSibling) {
        if (sibling.nodeName.toLowerCase() == el.nodeName.toLowerCase()) nth++;
      }
      if (nth != 1) selector += ":nth-of-type("+nth+")";
      path.unshift(selector);
      el = el.parentNode;
    }
    return path.join(" > ");
  }

  function exportCleanHtmlFile() {
    if (activeEditingElement) cancelEditingCurrent();

    // Clone whole document
    const clone = document.documentElement.cloneNode(true);

    // Clean all pencil edit buttons, export badges, popovers and toast notices from clone
    const pencils = clone.querySelectorAll('.pencil-edit-btn');
    pencils.forEach(p => p.remove());

    const popovers = clone.querySelectorAll('.inline-action-popover');
    popovers.forEach(p => p.remove());

    const localBtn = clone.querySelector('#localExportHeaderBtn');
    if (localBtn) localBtn.remove();

    const toast = clone.querySelector('#inlineToastNotice');
    if (toast) toast.remove();

    const editables = clone.querySelectorAll('[contenteditable]');
    editables.forEach(el => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
      el.removeAttribute('data-pencil-attached');
      el.classList.remove('inline-editing-active');
    });

    // Auto-sync current active roles map into pdpRolesConfig script tag
    const activeRoles = getStoredRolesMap();
    let configScript = clone.querySelector('#pdpRolesConfig');
    if (configScript) {
      configScript.textContent = '\n  window.PDP_GLOBAL_ROLES_MAP = ' + JSON.stringify(activeRoles, null, 2) + ';\n';
    }

    // Generate clean HTML
    const htmlContent = '<!DOCTYPE html>\n' + clone.outerHTML;

    // Download file as index.html
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('✅ تم تصدير واستخراج ملف index.html المعدّل بنجاح!\n\nقم باستبدال ملف index.html في مجلد مشروعك المحلي ثم ارفعه للدومين والاستضافة الخاصة بك.');
  }

  function showInlineToast(message, isDanger = false) {
    const toast = document.getElementById('inlineToastNotice');
    const toastText = document.getElementById('inlineToastText');
    const toastIcon = document.getElementById('inlineToastIcon');
    if (!toast || !toastText) return;

    toastText.textContent = message;
    if (toastIcon) {
      toastIcon.className = isDanger ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-circle-check';
      toastIcon.style.color = isDanger ? '#ef4444' : '#10b981';
    }

    toast.style.display = 'flex';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 2500);
  }
}



