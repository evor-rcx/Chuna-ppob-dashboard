with open('server.ts', 'r') as f:
    lines = f.readlines()

# We need to remove the two extra `}` lines before `        } catch (e) {` which is around line 3125.

with open('server.ts', 'w') as f:
    for i, line in enumerate(lines):
        if i == 3122 or i == 3123:  # Just skip them, they are the `                }` and `            }`
            continue
        f.write(line)

print("Fixed braces!")
