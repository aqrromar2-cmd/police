import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

pattern = r'<section\s+[^>]*class="[^"]*section[^"]*"[^>]*id="([^"]+)"'
sections = re.findall(pattern, html)

print("Sections:")
for s in sections:
    print(" - " + s)
