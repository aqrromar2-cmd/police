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
  const hash = rawHash ? rawHash.replace('#', '') : 'home';
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
  elements.navItems.forEach(item => {
    if (item.getAttribute('data-route') === route) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update inner Sidebar menu links
  elements.sidebarItems.forEach(item => {
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
  
  // Find navigation name
  const currentNavItem = document.querySelector(`.nav-item[data-route="${state.currentRoute}"] span`);
  if (currentNavItem) {
    elements.breadcrumbActive.textContent = currentNavItem.textContent.trim();
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
  const discordConfigBtn = document.getElementById('discordConfigBtn');

  const discordConfigModal = document.getElementById('discordConfigModal');
  const closeDiscordConfigModal = document.getElementById('closeDiscordConfigModal');
  const discordClientIdInput = document.getElementById('discordClientIdInput');
  const saveDiscordConfigBtn = document.getElementById('saveDiscordConfigBtn');
  const demoLoginBtn = document.getElementById('demoLoginBtn');

  // Parse token hash if redirected from Discord, & render user UI
  checkDiscordHashToken();
  renderDiscordUserUI();

  // Discord Login Click
  if (discordLoginBtn) {
    discordLoginBtn.addEventListener('click', () => {
      const clientId = localStorage.getItem('pdp_discord_client_id');
      if (!clientId) {
        openDiscordConfigModal();
      } else {
        loginWithDiscord(clientId);
      }
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

  // Open Config Modal
  if (discordConfigBtn) {
    discordConfigBtn.addEventListener('click', () => {
      userProfileContainer.classList.remove('active');
      openDiscordConfigModal();
    });
  }

  // Close Config Modal
  if (closeDiscordConfigModal && discordConfigModal) {
    closeDiscordConfigModal.addEventListener('click', closeDiscordConfigModalFunc);
    discordConfigModal.addEventListener('click', (e) => {
      if (e.target === discordConfigModal) {
        closeDiscordConfigModalFunc();
      }
    });
  }

  // Save Config & Login
  if (saveDiscordConfigBtn && discordClientIdInput) {
    saveDiscordConfigBtn.addEventListener('click', () => {
      const val = discordClientIdInput.value.trim();
      if (val) {
        localStorage.setItem('pdp_discord_client_id', val);
        closeDiscordConfigModalFunc();
        loginWithDiscord(val);
      } else {
        alert('الرجاء إدخال Client ID صحيح لتطبيق ديسكورد الخاص بك.');
      }
    });
  }

  // Demo Login Click
  if (demoLoginBtn) {
    demoLoginBtn.addEventListener('click', () => {
      const demoUser = {
        id: "718293847561029384",
        username: "LSPD_Chief",
        global_name: "قائد الشرطة (LSPD)",
        avatar_url: "badge.png",
        is_demo: true
      };
      localStorage.setItem('pdp_discord_user', JSON.stringify(demoUser));
      closeDiscordConfigModalFunc();
      renderDiscordUserUI();
    });
  }
}

function openDiscordConfigModal() {
  const modal = document.getElementById('discordConfigModal');
  const input = document.getElementById('discordClientIdInput');
  if (modal) {
    if (input) {
      input.value = localStorage.getItem('pdp_discord_client_id') || '';
    }
    modal.classList.add('open');
  }
}

function closeDiscordConfigModalFunc() {
  const modal = document.getElementById('discordConfigModal');
  if (modal) {
    modal.classList.remove('open');
  }
}

function loginWithDiscord(clientId) {
  const redirectUri = window.location.origin + window.location.pathname;
  const scope = encodeURIComponent('identify');
  const responseType = 'token';
  const authUrl = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}`;
  window.location.href = authUrl;
}

function checkDiscordHashToken() {
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token=')) return;

  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get('access_token');

  if (accessToken) {
    fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('فشل جلب بيانات ديسكورد');
      return res.json();
    })
    .then(user => {
      let avatarUrl = 'logo_blue.png';
      if (user.avatar) {
        avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
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
      history.replaceState(null, document.title, window.location.pathname + window.location.search);
      renderDiscordUserUI();
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
      const avatar = user.avatar_url || 'badge.png';

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
}



