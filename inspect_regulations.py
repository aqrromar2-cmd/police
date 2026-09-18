import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('لوائح الأقسام والتفصيلات التنظيمية')
if idx != -1:
    print(html[idx-100:idx+3500])
else:
    print("Section not found.")
