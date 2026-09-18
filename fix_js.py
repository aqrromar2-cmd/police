import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# =====================================================
# FIX 1: initModals() crashes on null elements
# Elements joinAcademyBtn, academyModal, contactModal
# were DELETED from HTML but JS still references them
# This crashes entire JS execution!
# =====================================================
old_initModals = """function initModals() {
  // Join Academy Modal
  elements.joinAcademyBtn.addEventListener('click', () => {
    elements.academyModal.classList.add('open');
  });

  elements.closeAcademyModal.addEventListener('click', () => {
    elements.academyModal.classList.remove('open');
  });

  window.addEventListener('click', (e) => {
    if (e.target === elements.academyModal) {
      elements.academyModal.classList.remove('open');
    }
    if (e.target === elements.contactModal) {
      closeContactModal();
    }
  });
}"""

new_initModals = """function initModals() {
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
}"""

if old_initModals in js:
    js = js.replace(old_initModals, new_initModals)
    print("[OK] Fixed initModals() null crash")
else:
    print("[WARN] initModals pattern not found - applying partial fix")
    js = js.replace(
        "elements.joinAcademyBtn.addEventListener",
        "elements.joinAcademyBtn && elements.joinAcademyBtn.addEventListener"
    )
    js = js.replace(
        "elements.closeAcademyModal.addEventListener",
        "elements.closeAcademyModal && elements.closeAcademyModal.addEventListener"
    )

# =====================================================
# FIX 2: openContactModal crashes if element is null
# =====================================================
old_open = """function openContactModal() {
  elements.contactModal.classList.add('open');
}

function closeContactModal() {
  elements.contactModal.classList.remove('open');
}"""

new_open = """function openContactModal() {
  if (elements.contactModal) elements.contactModal.classList.add('open');
}

function closeContactModal() {
  if (elements.contactModal) elements.contactModal.classList.remove('open');
}"""

if old_open in js:
    js = js.replace(old_open, new_open)
    print("[OK] Fixed openContactModal/closeContactModal null crash")
else:
    print("[WARN] openContactModal pattern not found")

# =====================================================
# FIX 3: updateBreadcrumbs uses wrong span selector
# Should handle <i class="nav-icon"> not span.lspd-emoji
# =====================================================
old_bc = """  const currentNavItem = document.querySelector(`.nav-item[data-route="${state.currentRoute}"] span:not(.lspd-emoji)`);"""
new_bc = """  const currentNavItem = document.querySelector(`.nav-item[data-route="${state.currentRoute}"] span`);"""

if old_bc in js:
    js = js.replace(old_bc, new_bc)
    print("[OK] Fixed updateBreadcrumbs selector")

old_search_cat = """      const categoryNameNode = document.querySelector(`.nav-item[data-route="${sectionId}"] span:not(.lspd-emoji)`);"""
new_search_cat = """      const categoryNameNode = document.querySelector(`.nav-item[data-route="${sectionId}"] span`);"""

if old_search_cat in js:
    js = js.replace(old_search_cat, new_search_cat)
    print("[OK] Fixed search category name selector")

# =====================================================
# FIX 4: Remove the duplicate azkar click listener
# that conflicts with the router's hash-based navigation
# =====================================================
azkar_listener_start = "// Initialize azkar route"
azkar_listener_end = "});"
idx_start = js.find(azkar_listener_start)
if idx_start != -1:
    # Find the NEXT occurrence of }); after this comment
    idx_end = js.find(azkar_listener_end, idx_start)
    if idx_end != -1:
        js = js[:idx_start] + js[idx_end + len(azkar_listener_end):]
        print("[OK] Removed duplicate azkar click listener")

# =====================================================
# FIX 5: Make sure azkar route is included in routing
# by adding 'azkar' to known inner page sections
# =====================================================
# The router already works for any hash that maps to page-{hash}
# since page-azkar exists, it should work. No additional fix needed.

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("\napp.js fixed and saved!")
print(f"Total size: {len(js)} bytes")
