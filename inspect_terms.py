import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

for term in ['لوائح الأقسام', 'التفصيلات التنظيمية', 'لوائح']:
    idx = html.find(term)
    if idx != -1:
        print(f"Found '{term}' at index {idx}: {html[idx-100:idx+200]}")
    else:
        print(f"'{term}' not found")
