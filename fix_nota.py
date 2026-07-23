with open('server.ts', 'r') as f:
    content = f.read()

# Let's clean up all "/api/nota/:id" definitions and just leave one.
import re

# Find all blocks of app.get("/api/nota/:id"... up to their closing brackets.
# This might be tricky because of nested brackets. Let's just find the first occurrence and delete everything until the next route?
