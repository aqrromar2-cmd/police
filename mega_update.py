import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

orig_size = len(html)
print(f"Original HTML size: {orig_size}")

# ====================================================
# HELPER: find_section_bounds - finds start/end of an
# inner-page-section by its ID
# ====================================================
def find_section_bounds(html, section_id):
    start_tag = f'id="{section_id}"'
    start = html.find(start_tag)
    if start == -1:
        return -1, -1
    # Go back to the opening <section
    sec_open = html.rfind('<section', 0, start)
    # Find the matching </section>
    depth = 0
    i = sec_open
    while i < len(html):
        if html[i:i+8] == '<section':
            depth += 1
            i += 8
        elif html[i:i+10] == '</section>':
            depth -= 1
            if depth == 0:
                return sec_open, i + 10
            i += 10
        else:
            i += 1
    return sec_open, -1


# ====================================================
# PART 1: UPDATE TASER SECTION (minor text corrections)
# User wants exact wording:
# - "يشترط أن يكون الشخص غير حامل لسلاح ناري"
# ====================================================
print("\n[1] Updating taser section text...")
html = html.replace(
    '<li>يشترط أن يكون الشخص هارباً دون حمل أي سلاح.</li>',
    '<li>يشترط أن يكون الشخص غير حامل لسلاح ناري.</li>'
)
html = html.replace(
    '<span>القسم الثاني: حالات السماح بالتيزر المباشر</span>',
    '<span>القسم الثاني: قوانين التيزر المباشر</span>'
)
# Fix taser direct cases to match user's exact wording
html = html.replace(
    '<li>عند إشهار سلاح أبيض.</li>\r\n<li>عند قيام المتهم بالنطح أو الإعاقة الجسدية.</li>\r\n<li>عند توجه المتهم نحو البحر أو محاولة السباحة للهروب.</li>\r\n<li>عند وجود تدخل خارجي يعيق عمل الشرطة.</li>',
    '<li>في حال إشهار سلاح أبيض.</li>\r\n<li>في حال نطح المتهم للعسكري أو إعاقته.</li>\r\n<li>في حال توجه المتهم إلى البحر.</li>\r\n<li>في حال وجود تدخل خارجي.</li>'
)
html = html.replace(
    '<span>القسم الرابع: قوانين الدسباتش</span>',
    '<span>القسم الرابع: الدسباتش</span>'
)
print("  [OK] Taser text updated.")

# ====================================================
# PART 2: ADD "ضوابط المطاردة والصدم التكتيكي" to pursuit
# We add it BEFORE </section> of page-pursuit-policy
# ====================================================
print("\n[2] Adding pursuit tactical section...")

PIT_SECTION = """
<!-- New: ضوابط المطاردة والصدم التكتيكي -->
<div class="accordion-list" style="margin-top:2rem;">
<div class="accordion-item search-target">
<div class="accordion-header">
<div class="accordion-header-title">
<i class="fa-solid fa-shield-halved"></i>
<span>ضوابط المطاردة والصدم التكتيكي</span>
</div>
<i class="fa-solid fa-chevron-down accordion-icon"></i>
</div>
<div class="accordion-content">
<h4 style="color:var(--accent-gold);margin-bottom:0.5rem;">ضوابط المطاردة:</h4>
<ul class="bullet-list">
<li>ترك مسافة آمنة بين الوحدات والمركبة المطاردة.</li>
<li>التمركز الصحيح أثناء المطاردة.</li>
<li>تحديث الحالة باستمرار عبر الراديو.</li>
<li>التبليغ عن أي هارب بشكل مستمر.</li>
<li>الحفاظ على سلامة المواطنين.</li>
<li>الحذر أثناء المطاردة.</li>
</ul>
<h4 style="color:var(--accent-gold);margin:1rem 0 0.5rem;">الصدم التكتيكي PIT:</h4>
<ul class="bullet-list">
<li>يجب أخذ إذن من الدسباتش قبل الصدم.</li>
<li>يجب وجود وحدة مساندة أثناء تنفيذ الصدم.</li>
<li>يمنع تنفيذ الصدم دون وحدة داعمة.</li>
<li>يمنع الصدم في المناطق العامة والمزدحمة.</li>
<li>يمنع الصدم على الجسور أو الأماكن الخطرة.</li>
<li>يجب التبليغ بنجاح أو فشل عملية الصدم.</li>
</ul>
<h4 style="color:var(--accent-gold);margin:1rem 0 0.5rem;">يسمح بالصدم في الحالات التالية:</h4>
<div class="pursuit-cases-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;margin-top:0.5rem;">
<div class="case-card" style="background:rgba(230,175,46,0.07);border:1px solid rgba(230,175,46,0.25);border-radius:10px;padding:1rem;">
<div style="font-weight:700;color:var(--accent-gold);margin-bottom:0.5rem;"><i class="fa-solid fa-1"></i> الحالة الأولى</div>
<p>تعريض حياة المواطنين أو الشرطة للخطر.</p>
<p style="color:#4ec4b6;margin-top:0.4rem;font-size:0.85rem;">✓ يسمح بصدمة كل 30 ثانية.</p>
</div>
<div class="case-card" style="background:rgba(230,175,46,0.07);border:1px solid rgba(230,175,46,0.25);border-radius:10px;padding:1rem;">
<div style="font-weight:700;color:var(--accent-gold);margin-bottom:0.5rem;"><i class="fa-solid fa-2"></i> الحالة الثانية</div>
<p>إطلاق النار من داخل المركبة.</p>
<p style="color:#4ec4b6;margin-top:0.4rem;font-size:0.85rem;">✓ يسمح بصدمة كل 10 ثوانٍ.</p>
</div>
<div class="case-card" style="background:rgba(230,175,46,0.07);border:1px solid rgba(230,175,46,0.25);border-radius:10px;padding:1rem;">
<div style="font-weight:700;color:var(--accent-gold);margin-bottom:0.5rem;"><i class="fa-solid fa-3"></i> الحالة الثالثة</div>
<p>إطلاق النار على مركبات الشرطة.</p>
<p style="color:#4ec4b6;margin-top:0.4rem;font-size:0.85rem;">✓ يسمح بتبادل إطلاق النار. وإذا كان الخطر على طرف آخر يسمح بالصدم بهدف التعطيل.</p>
</div>
</div>
<h4 style="color:var(--accent-gold);margin:1.5rem 0 0.5rem;">أنواع المطاردات:</h4>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
<div style="background:rgba(28,37,65,0.4);border:1px solid var(--border-color);border-radius:8px;padding:0.8rem;text-align:center;">
<div style="font-weight:700;color:var(--accent-gold);">🚗 مطاردة مرورية</div>
<div style="font-size:0.9rem;margin-top:0.4rem;">عدد الوحدات المسموح بها: <strong>مركبتان</strong></div>
</div>
<div style="background:rgba(28,37,65,0.4);border:1px solid var(--border-color);border-radius:8px;padding:0.8rem;text-align:center;">
<div style="font-weight:700;color:var(--accent-gold);">🚔 مطاردة جنائية</div>
<div style="font-size:0.9rem;margin-top:0.4rem;">عدد الوحدات المسموح بها: <strong>ثلاث مركبات</strong></div>
</div>
</div>
</div>
</div>
</div>
"""

# Find pursuit section end
sec_start, sec_end = find_section_bounds(html, 'page-pursuit-policy')
if sec_start != -1 and sec_end != -1:
    # Insert before </section>
    insert_pos = sec_end - len('</section>')
    html = html[:insert_pos] + PIT_SECTION + '\n' + html[insert_pos:]
    print("  [OK] Pursuit tactical section added.")
else:
    print("  [WARN] page-pursuit-policy not found!")

# ====================================================
# PART 3: REPLACE criminal procedures content
# Keep the header + upload button, replace body
# ====================================================
print("\n[3] Replacing criminal procedures content...")

CRIMINAL_BODY = """
<div class="accordion-list" style="margin-top:1.5rem;">

<!-- 1- الحقوق القانونية -->
<div class="accordion-item search-target">
<div class="accordion-header">
<div class="accordion-header-title">
<i class="fa-solid fa-gavel"></i>
<span>1- الحقوق القانونية</span>
</div>
<i class="fa-solid fa-chevron-down accordion-icon"></i>
</div>
<div class="accordion-content">
<p style="margin-bottom:0.8rem;">عند القبض على المواطن يجب ذكر:</p>
<div class="miranda-speech" style="font-family:'Traditional Arabic',serif;font-size:1rem;line-height:1.8;padding:1rem;background:rgba(28,37,65,0.4);border-inline-start:3px solid var(--accent-gold);border-radius:6px;margin-bottom:0.8rem;">
"تم القبض عليك من قبل شرطة لوس سانتوس بتهمة (أعلى تهمة)، لديك الحق في التزام الصمت، أي شيء تقوله قد يستخدم ضدك في المحكمة، يحق لك تعيين محامٍ، وفي حال عدم قدرتك سيتم تعيين محامٍ لك عند توفره."
</div>
</div>
</div>

<!-- 2- إجراءات التفتيش -->
<div class="accordion-item search-target">
<div class="accordion-header">
<div class="accordion-header-title">
<i class="fa-solid fa-magnifying-glass"></i>
<span>2- إجراءات التفتيش</span>
</div>
<i class="fa-solid fa-chevron-down accordion-icon"></i>
</div>
<div class="accordion-content">
<ul class="bullet-list">
<li>تفتيش المتهم بشكل كامل.</li>
<li>مصادرة الممنوعات.</li>
<li>وضع الأدلة داخل خزنة الأدلة.</li>
<li>فك الكلبشة بعد انتهاء التفتيش عند الحاجة.</li>
</ul>
</div>
</div>

<!-- 3- السجن والغرامات -->
<div class="accordion-item search-target">
<div class="accordion-header">
<div class="accordion-header-title">
<i class="fa-solid fa-building-columns"></i>
<span>3- السجن والغرامات</span>
</div>
<i class="fa-solid fa-chevron-down accordion-icon"></i>
</div>
<div class="accordion-content">
<ul class="bullet-list">
<li>إبلاغ المواطن بجميع التهم.</li>
<li>إبلاغه بقيمة الغرامة.</li>
<li>إبلاغه بمدة السجن.</li>
<li>إعطاؤه فرصة للتبرير.</li>
</ul>
</div>
</div>

<!-- 4- الأدلة -->
<div class="accordion-item search-target">
<div class="accordion-header">
<div class="accordion-header-title">
<i class="fa-solid fa-folder-open"></i>
<span>4- الأدلة</span>
</div>
<i class="fa-solid fa-chevron-down accordion-icon"></i>
</div>
<div class="accordion-content">
<ul class="bullet-list">
<li>يمنع السجن بدون أدلة.</li>
<li>يجب حفظ الأدلة.</li>
<li>يجب إرفاق الأدلة داخل MDT.</li>
</ul>
</div>
</div>

<!-- 5- نظام MDT -->
<div class="accordion-item search-target">
<div class="accordion-header">
<div class="accordion-header-title">
<i class="fa-solid fa-laptop"></i>
<span>5- نظام MDT</span>
</div>
<i class="fa-solid fa-chevron-down accordion-icon"></i>
</div>
<div class="accordion-content">
<ul class="bullet-list">
<li>تسجيل القضية كاملة.</li>
<li>كتابة الملاحظات.</li>
<li>رفع الأدلة.</li>
</ul>
</div>
</div>

<!-- 6- التخفيض -->
<div class="accordion-item search-target">
<div class="accordion-header">
<div class="accordion-header-title">
<i class="fa-solid fa-percent"></i>
<span>6- التخفيض</span>
</div>
<i class="fa-solid fa-chevron-down accordion-icon"></i>
</div>
<div class="accordion-content">
<div class="warning-box" style="background:rgba(78,196,182,0.07);border-color:rgba(78,196,182,0.3);">
<p>إذا اعترف المتهم اعترافاً كاملاً: يجوز تخفيض العقوبة بنسبة <strong>25%</strong> بعد الرجوع لمسؤول الفترة.</p>
</div>
</div>
</div>

<!-- 7- المخالفات المرورية -->
<div class="accordion-item search-target">
<div class="accordion-header">
<div class="accordion-header-title">
<i class="fa-solid fa-car"></i>
<span>7- المخالفات المرورية</span>
</div>
<i class="fa-solid fa-chevron-down accordion-icon"></i>
</div>
<div class="accordion-content">
<div class="warning-box">
<div class="warning-box-title"><i class="fa-solid fa-triangle-exclamation"></i> <span>تنبيه</span></div>
<p>لا يجوز كلبشة المواطن في المخالفات المرورية إلا في حال عدم التعاون.</p>
</div>
</div>
</div>

</div>
"""

# Find the criminal procedures section
sec_start, sec_end = find_section_bounds(html, 'page-criminal-procedures')
if sec_start != -1 and sec_end != -1:
    current_section = html[sec_start:sec_end]
    # Keep the header (policy-header div), replace everything after it
    header_end = current_section.find('</div>', current_section.find('policy-description')) + 6
    new_section = current_section[:header_end] + CRIMINAL_BODY + '\n</section>'
    html = html[:sec_start] + new_section + html[sec_end:]
    print("  [OK] Criminal procedures replaced.")
else:
    print("  [WARN] page-criminal-procedures not found!")

# ====================================================
# PART 4: REPLACE firearm policy content (keep warning)
# ====================================================
print("\n[4] Replacing firearm policy content...")

FIREARM_BODY = """
<div class="accordion-list" style="margin-top:1.5rem;">

<!-- قوانين إطلاق النار -->
<div class="accordion-item search-target">
<div class="accordion-header">
<div class="accordion-header-title">
<i class="fa-solid fa-gun"></i>
<span>قوانين إطلاق النار</span>
</div>
<i class="fa-solid fa-chevron-down accordion-icon"></i>
</div>
<div class="accordion-content">
<ul class="bullet-list">
<li>يمنع إطلاق النار دون سبب قانوني.</li>
<li>يجب إعطاء الأولوية لبلاغات إطلاق النار في الراديو.</li>
<li>يمنع التشويش ببلاغات غير مهمة أثناء الاشتباكات.</li>
</ul>

<h4 style="color:var(--accent-gold);margin:1rem 0 0.5rem;">إطلاق النار على الكفرات (المركبات):</h4>
<p style="margin-bottom:0.5rem;">يسمح فقط إذا:</p>
<ul class="bullet-list">
<li>تم دهس عسكري عمداً.</li>
<li>بعد موافقة مسؤول الحالة أو الدسباتش.</li>
</ul>

<h4 style="color:var(--accent-gold);margin:1rem 0 0.5rem;">استخدام السلاح للتحايل:</h4>
<p>يحق للعسكري إطلاق النار إذا أطلق المجرم النار ثم أدخل سلاحه للتحايل.</p>
</div>
</div>

<!-- المواطن المتواجد بموقع الاشتباك -->
<div class="accordion-item search-target">
<div class="accordion-header">
<div class="accordion-header-title">
<i class="fa-solid fa-person-circle-question"></i>
<span>المواطن المتواجد بموقع الاشتباك</span>
</div>
<i class="fa-solid fa-chevron-down accordion-icon"></i>
</div>
<div class="accordion-content">
<div class="warning-box" style="margin-bottom:1rem;">
<p>لا يتم إطلاق النار على المواطن المتواجد بموقع الاشتباك إلا إذا توفّر الشرطان معاً:</p>
</div>
<ol class="bullet-list" style="list-style:decimal;padding-inline-start:1.5rem;">
<li>رفض التوقف.</li>
<li>كان يحمل سلاحاً نارياً.</li>
</ol>
<h4 style="color:var(--accent-gold);margin:1rem 0 0.5rem;">يسمح بإطلاق النار إذا:</h4>
<ol class="bullet-list" style="list-style:decimal;padding-inline-start:1.5rem;">
<li>رفع السلاح تجاه العسكري.</li>
<li>بادر بإطلاق النار.</li>
<li>أطلق النار على مدني.</li>
</ol>
</div>
</div>

<!-- إجراءات الاشتباك -->
<div class="accordion-item search-target">
<div class="accordion-header">
<div class="accordion-header-title">
<i class="fa-solid fa-crosshairs"></i>
<span>إجراءات الاشتباك</span>
</div>
<i class="fa-solid fa-chevron-down accordion-icon"></i>
</div>
<div class="accordion-content">
<h4 style="color:var(--accent-gold);margin-bottom:0.5rem;">إجراءات الاشتباك:</h4>
<ul class="bullet-list">
<li>تحديد الموقع بدقة.</li>
<li>تحديد عدد الأشخاص.</li>
<li>تحديد وصف الحالة.</li>
</ul>
<h4 style="color:var(--accent-gold);margin:1rem 0 0.5rem;">التدخل الخارجي:</h4>
<ul class="bullet-list">
<li>يجب الاستعداد لأي تدخل خارجي.</li>
<li>تخصيص وحدة متابعة ومراقبة.</li>
</ul>
<h4 style="color:var(--accent-gold);margin:1rem 0 0.5rem;">تأمين الموقع:</h4>
<ul class="bullet-list">
<li>إغلاق المخارج.</li>
<li>محاصرة المنطقة.</li>
<li>انتظار أوامر مسؤول الحالة.</li>
</ul>
<h4 style="color:var(--accent-gold);margin:1rem 0 0.5rem;">في حال التفوق العددي للمجرمين:</h4>
<ul class="bullet-list">
<li>إعطاء الأوصاف للدسباتش.</li>
<li>الانسحاب التكتيكي.</li>
<li>انتظار الدعم.</li>
</ul>
</div>
</div>

<!-- حالات إضافية -->
<div class="accordion-item search-target">
<div class="accordion-header">
<div class="accordion-header-title">
<i class="fa-solid fa-circle-info"></i>
<span>حالات إضافية</span>
</div>
<i class="fa-solid fa-chevron-down accordion-icon"></i>
</div>
<div class="accordion-content">
<ul class="bullet-list">
<li>إذا لم يُدخل الشخص سلاحه بعد التحذير ومرور 3 ثوانٍ يتم إطلاق النار على الأطراف.</li>
<li>كل 5 ثوانٍ يسمح بـ 3 طلقات.</li>
<li>في حال دهس شرطي يتم إطلاق النار على الكفرات.</li>
</ul>
</div>
</div>

</div>
"""

# Find the firearm policy section
sec_start, sec_end = find_section_bounds(html, 'page-firearm-policy')
if sec_start != -1 and sec_end != -1:
    current_section = html[sec_start:sec_end]
    # Keep the header AND the warning box
    warning_end_idx = current_section.find('</div>', current_section.find('تحذير استخدام القوة المميتة'))
    # Get the end of the warning box (it's a div with warning-box class)
    # Find the end of the warning div
    wb_start = current_section.find('<div class="warning-box search-target">')
    if wb_start == -1:
        wb_start = current_section.find('<div class="warning-box">')
    # Close tag
    wb_end_search = current_section.find('</div>', wb_start)
    # The warning box has nested divs, so find properly
    depth = 0
    i = wb_start
    while i < len(current_section):
        if current_section[i:i+4] == '<div':
            depth += 1
            i += 4
        elif current_section[i:i+6] == '</div>':
            depth -= 1
            if depth == 0:
                wb_end_pos = i + 6
                break
            i += 6
        else:
            i += 1
    new_section = current_section[:wb_end_pos] + FIREARM_BODY + '\n</section>'
    html = html[:sec_start] + new_section + html[sec_end:]
    print("  [OK] Firearm policy replaced.")
else:
    print("  [WARN] page-firearm-policy not found!")

# ====================================================
# PART 5: Add 3 new accordions to لوائح الأقسام
# Find the closing </div> of the accordion-list in the home page
# ====================================================
print("\n[5] Adding 3 new accordions to لوائح الأقسام...")

# Find the accordion-list after "لوائح الأقسام والتفصيلات التنظيمية"
idx_lawai = html.find('لوائح الأقسام والتفصيلات التنظيمية')
if idx_lawai != -1:
    # Find the accordion-list div after this
    acc_list_start = html.find('<div class="accordion-list"', idx_lawai)
    if acc_list_start != -1:
        # Find the closing </div> of this accordion-list
        # Count depth
        depth = 0
        i = acc_list_start
        while i < len(html):
            if html[i:i+4] == '<div':
                depth += 1
                i += 4
            elif html[i:i+6] == '</div>':
                depth -= 1
                if depth == 0:
                    acc_list_end = i
                    break
                i += 6
            else:
                i += 1

        NEW_ACCORDIONS = """
<!-- Accordion: قوانين التفاوض -->
<div class="accordion-item search-target">
<div class="accordion-header">
<div class="accordion-header-title">
<i class="fa-solid fa-comments"></i>
<span>قوانين التفاوض</span>
</div>
<i class="fa-solid fa-chevron-down accordion-icon"></i>
</div>
<div class="accordion-content">
<h4 style="color:#e55;margin-bottom:0.8rem;">الأشياء التي تنقص وقت الهروب الآمن:</h4>
<ul class="bullet-list">
<li>الأسلوب الهمجي.</li>
<li>إهانة الرهينة.</li>
<li>إهانة الشرطة.</li>
<li>خروج أي مجرم.</li>
<li>الاستهزاء أثناء التفاوض.</li>
<li>إشهار السلاح.</li>
<li>المقاطعة أثناء التفاوض.</li>
<li>الألفاظ غير اللائقة.</li>
</ul>
<div class="warning-box" style="margin:1rem 0;">
<div class="warning-box-title"><i class="fa-solid fa-triangle-exclamation"></i> <span>تنبيه مهم</span></div>
<p>يمنع منعاً باتاً تمثيل دور المتفاوض من جهة الشرطة.</p>
</div>
<h4 style="color:var(--accent-gold);margin:1rem 0 0.5rem;">أساسيات التفاوض:</h4>
<ul class="bullet-list">
<li>تعريف نفسك.</li>
<li>ذكر الاسم.</li>
<li>رقم الشارة.</li>
<li>الرتبة.</li>
<li>محاولة إقناع المجرمين بالتسليم.</li>
<li>التركيز على سلامة الرهينة.</li>
<li>التحقق من الرهينة عبر الكاميرات.</li>
<li>عدم الدخول للموقع للتأكد من الرهينة.</li>
</ul>
<h4 style="color:var(--accent-gold);margin:1rem 0 0.5rem;">طرق التحقق من وجود رهينة:</h4>
<ul class="bullet-list">
<li>كاميرات المراقبة.</li>
<li>المنظار.</li>
<li>كاميرا الشرطة.</li>
<li>طلب إظهار الرهينة فقط.</li>
</ul>
</div>
</div>

<!-- Accordion: مفشلات الهروب الآمن -->
<div class="accordion-item search-target">
<div class="accordion-header">
<div class="accordion-header-title">
<i class="fa-solid fa-circle-xmark"></i>
<span>مفشلات الهروب الآمن</span>
</div>
<i class="fa-solid fa-chevron-down accordion-icon"></i>
</div>
<div class="accordion-content">
<ul class="bullet-list" style="column-count:2;column-gap:1.5rem;">
<li>انتهاء الوقت المحدد.</li>
<li>التوقف أثناء المطاردة.</li>
<li>التوجه للبحر.</li>
<li>التوجه للجبال.</li>
<li>التدخل الخارجي.</li>
<li>دخول الأنفاق.</li>
<li>النزول من المركبة.</li>
<li>دخول الورشة.</li>
<li>تعديل المركبة.</li>
<li>رفع السلاح على الشرطة.</li>
<li>عدم إدخال السلاح بعد 5 ثوانٍ.</li>
<li>تعريض المواطنين للخطر.</li>
<li>تعريض الشرطة للخطر.</li>
<li>صعود الرصيف 3 مرات (الثالثة تفشل).</li>
<li>القفز بالمركبة 3 مرات (الثالثة تفشل).</li>
<li>عكس السير 3 مرات (الثالثة تفشل).</li>
<li>استخدام النيترو.</li>
</ul>
</div>
</div>

<!-- Accordion: العدد المسموح في السرقات -->
<div class="accordion-item search-target">
<div class="accordion-header">
<div class="accordion-header-title">
<i class="fa-solid fa-people-group"></i>
<span>العدد المسموح في السرقات</span>
</div>
<i class="fa-solid fa-chevron-down accordion-icon"></i>
</div>
<div class="accordion-content">
<div class="violations-table-wrapper" style="overflow-x:auto;margin-top:0.5rem;">
<table class="violations-table" style="width:100%;border-collapse:collapse;font-size:0.88rem;">
<thead>
<tr style="background:rgba(230,175,46,0.15);text-align:center;">
<th style="padding:0.7rem;border:1px solid var(--border-color);color:var(--accent-gold);">نوع السرقة</th>
<th style="padding:0.7rem;border:1px solid var(--border-color);color:#e55;">المجرمون</th>
<th style="padding:0.7rem;border:1px solid var(--border-color);color:#4ec4b6;">الشرطة</th>
</tr>
</thead>
<tbody style="text-align:center;">
<tr><td style="padding:0.6rem;border:1px solid var(--border-color);">Store Robbery</td><td style="border:1px solid var(--border-color);color:#e55;">1-3</td><td style="border:1px solid var(--border-color);color:#4ec4b6;">2-4</td></tr>
<tr style="background:rgba(255,255,255,0.02);"><td style="padding:0.6rem;border:1px solid var(--border-color);">Car Boots</td><td style="border:1px solid var(--border-color);color:#e55;">1-2</td><td style="border:1px solid var(--border-color);color:#4ec4b6;">1-3</td></tr>
<tr><td style="padding:0.6rem;border:1px solid var(--border-color);">House Robbery</td><td style="border:1px solid var(--border-color);color:#e55;">2-4</td><td style="border:1px solid var(--border-color);color:#4ec4b6;">4-6</td></tr>
<tr style="background:rgba(255,255,255,0.02);"><td style="padding:0.6rem;border:1px solid var(--border-color);">Cargo Robbery</td><td style="border:1px solid var(--border-color);color:#e55;">3-5</td><td style="border:1px solid var(--border-color);color:#4ec4b6;">5-7</td></tr>
<tr><td style="padding:0.6rem;border:1px solid var(--border-color);">Laundromat</td><td style="border:1px solid var(--border-color);color:#e55;">4-6</td><td style="border:1px solid var(--border-color);color:#4ec4b6;">6-8</td></tr>
<tr style="background:rgba(255,255,255,0.02);"><td style="padding:0.6rem;border:1px solid var(--border-color);">Cash Exchange</td><td style="border:1px solid var(--border-color);color:#e55;">5-7</td><td style="border:1px solid var(--border-color);color:#4ec4b6;">7-9</td></tr>
<tr><td style="padding:0.6rem;border:1px solid var(--border-color);">Fleeca</td><td style="border:1px solid var(--border-color);color:#e55;">6-8</td><td style="border:1px solid var(--border-color);color:#4ec4b6;">8-10</td></tr>
<tr style="background:rgba(255,255,255,0.02);"><td style="padding:0.6rem;border:1px solid var(--border-color);">Bobcat</td><td style="border:1px solid var(--border-color);color:#e55;">6-8</td><td style="border:1px solid var(--border-color);color:#4ec4b6;">8-10</td></tr>
<tr><td style="padding:0.6rem;border:1px solid var(--border-color);">Pacific Bank</td><td style="border:1px solid var(--border-color);color:#e55;">8-10</td><td style="border:1px solid var(--border-color);color:#4ec4b6;">10-12</td></tr>
<tr style="background:rgba(255,255,255,0.02);"><td style="padding:0.6rem;border:1px solid var(--border-color);">Paleto Bank</td><td style="border:1px solid var(--border-color);color:#e55;">8-10</td><td style="border:1px solid var(--border-color);color:#4ec4b6;">10-12</td></tr>
<tr><td style="padding:0.6rem;border:1px solid var(--border-color);">Maze Bank</td><td style="border:1px solid var(--border-color);color:#e55;">10-12</td><td style="border:1px solid var(--border-color);color:#4ec4b6;">12-14</td></tr>
<tr style="background:rgba(255,255,255,0.02);"><td style="padding:0.6rem;border:1px solid var(--border-color);font-weight:700;">الحالات المفتوحة</td><td style="border:1px solid var(--border-color);color:#e55;font-weight:700;">7 مواطنين</td><td style="border:1px solid var(--border-color);color:#4ec4b6;font-weight:700;">10 شرطة</td></tr>
</tbody>
</table>
</div>
<div class="warning-box" style="margin-top:1rem;">
<div class="warning-box-title"><i class="fa-solid fa-circle-info"></i> <span>ملاحظة</span></div>
<p>في حال خطف أوفيسر: يتم مضاعفة عدد وحدات الشرطة.</p>
</div>
</div>
</div>"""

        # Insert before closing </div> of the accordion list
        html = html[:acc_list_end] + NEW_ACCORDIONS + html[acc_list_end:]
        print("  [OK] 3 new accordions added to لوائح الأقسام.")
    else:
        print("  [WARN] accordion-list not found after لوائح الأقسام!")
else:
    print("  [WARN] لوائح الأقسام not found!")


# ====================================================
# PART 6: Search for البنود and delete جدول الترقيات/سلم الرتب
# ====================================================
print("\n[6] Handling البنود section...")

# Search for rank table or سلم الرتب in contraband-policy or other sections
sec_start, sec_end = find_section_bounds(html, 'page-contraband-policy')
if sec_start != -1:
    current = html[sec_start:sec_end]
    if 'البنود' in current or 'الترقيات' in current or 'سلم الرتب' in current:
        print("  Found البنود / ترقيات content in page-contraband-policy")
        # Remove جدول الترقيات section
        # This is complex to do safely without full inspection
        # For now we note it and skip
        print("  [SKIP] Complex replacement - needs separate inspection")
    else:
        print("  page-contraband-policy does NOT contain البنود")

# ====================================================
# Write final HTML
# ====================================================
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

new_size = len(html)
print(f"\nFinal HTML size: {new_size} ({new_size - orig_size:+d} bytes)")
print("index.html saved!")
