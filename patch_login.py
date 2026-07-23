with open('/app/applet/src/components/views/Login.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { useState } from 'react';", "import React, { useState } from 'react';")

with open('/app/applet/src/components/views/Login.tsx', 'w') as f:
    f.write(content)
