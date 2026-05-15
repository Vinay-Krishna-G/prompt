import os
import re

filepath = '/Users/vinnu/Documents/code/prompt/client/src/pages/AdminDashboard.jsx'
with open(filepath, 'r') as f:
    content = f.read()

new_content = content.replace('input-field', 'input-minimal')
with open(filepath, 'w') as f:
    f.write(new_content)

