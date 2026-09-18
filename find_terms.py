import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Search for specific terms
terms = ['البنود', 'بروتوكول الطوارئ', 'إجراءات المداهمة', 'الكود الأحمر', 'مركبات الشرطة', 'ملابس الشرطة', 'سلم الرتب']
for term in terms:
    idx = html.find(term)
    if idx != -1:
        print(f"FOUND '{term}' at {idx}:")
        print(html[max(0, idx-100):idx+200])
        print("---")
    else:
        print(f"NOT FOUND: {term}")
