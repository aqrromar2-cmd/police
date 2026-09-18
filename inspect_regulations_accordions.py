import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('لوائح الأقسام والتفصيلات التنظيمية')
if idx != -1:
    # Find all accordion item comments or headers within this block
    block = html[idx:idx+15000]
    import re
    accs = re.findall(r'<!-- Accordion \d+:[^>]*-->|<div class="accordion-header-title">.*?</div>', block, re.DOTALL)
    for a in accs:
        print(a.strip())
