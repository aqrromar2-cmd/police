import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

def show_section(section_id):
    idx = html.find(f'id="{section_id}"')
    if idx != -1:
        print(f"=== {section_id} ===")
        print(html[idx:idx+1500])
    else:
        print(f"=== {section_id} NOT FOUND ===")

show_section('page-pursuit-policy')
show_section('page-criminal-procedures')
show_section('page-firearm-policy')
