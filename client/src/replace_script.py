import os
import re

directories = ['/Users/vinnu/Documents/code/prompt/client/src/components', '/Users/vinnu/Documents/code/prompt/client/src/pages', '/Users/vinnu/Documents/code/prompt/client/src/']

replacements = {
    r'text-white': 'text-primary',
    r'text-black': 'text-background',
    r'bg-black': 'bg-background',
    r'bg-white': 'bg-primary',
    r'border-white': 'border-primary',
    r'border-black': 'border-background',
}

def replace_in_file(filepath):
    if not filepath.endswith(('.jsx', '.js', '.tsx', '.ts')):
        return
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in replacements.items():
        # Match class names like text-white, text-white/50, hover:text-white etc
        # Use regex to replace whole word or with / opacity
        regex = r'(?<![a-zA-Z0-9-])' + pattern + r'(?![a-zA-Z0-9-])'
        new_content = re.sub(regex, replacement, new_content)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for d in directories:
    for root, dirs, files in os.walk(d):
        for file in files:
            replace_in_file(os.path.join(root, file))

