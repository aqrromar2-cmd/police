import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find البنود section and look for promotion tables
idx = html.find('<!-- Accordion 3: البنود -->')
if idx != -1:
    block = html[idx:idx+30000]
    # Find mentions of ترقيات and رتب in this block
    for search_term in ['جدول الترقيات', 'سلم الرتب', 'جدول الرتب', 'ترقيات', 'Promotion', 'جدول العقوبات']:
        sidx = block.find(search_term)
        if sidx != -1:
            print(f"Found '{search_term}' at offset {sidx} in البنود block:")
            print(block[max(0,sidx-50):sidx+200])
            print("---")
        else:
            print(f"NOT found in البنود block: {search_term}")
