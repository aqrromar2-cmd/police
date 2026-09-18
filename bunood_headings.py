import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find the bunood section and print all section headings inside it
idx = html.find('<!-- Accordion 3: البنود -->')
if idx != -1:
    block = html[idx:idx+30000]
    # Find all h3/h4 tags inside this block
    headings = re.findall(r'<h[234][^>]*>.*?</h[234]>', block, re.DOTALL)
    print("Headings in البنود block:")
    for h in headings:
        print(" - " + h[:120])
    
    # Find section titles/labels  
    comments = re.findall(r'<!--[^>]+-->', block)
    print("\nHTML Comments in البنود block:")
    for c in comments[:20]:
        print(" - " + c[:100])
