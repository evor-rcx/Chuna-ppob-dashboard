import re

with open('src/components/views/KasirFisik.tsx', 'r') as f:
    content = f.read()

# Replace all value={formData.something} with value={formData.something || ''}
# Only if it's not already || '' and it's inside an input.
def replace_value(match):
    prefix = match.group(1)
    val = match.group(2)
    # Check if val already contains ||
    if '||' in val:
        return match.group(0)
    
    # Exceptions where we don't want to replace because they are handled
    if val in ['formData.category', 'formData.promo']:
        return match.group(0)

    return f'{prefix}value={{{val} || \'\'}}'

content = re.sub(r'(<input[^>]*?)value=\{([^}]+)\}', replace_value, content)

with open('src/components/views/KasirFisik.tsx', 'w') as f:
    f.write(content)
