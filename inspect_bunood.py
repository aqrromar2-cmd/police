import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Show البنود accordion content
idx = html.find('<!-- Accordion 3: البنود -->')
if idx != -1:
    print("=== البنود section ===")
    print(html[idx:idx+3000])
else:
    # Try another way
    idx = html.find('<span>البنود</span>')
    if idx != -1:
        print("Found span span>البنود:")
        print(html[idx-300:idx+3000])
