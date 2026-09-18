import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('id="page-dispatcher-taser"')
if idx != -1:
    print(html[idx:idx+4500])
else:
    print("Section not found.")
