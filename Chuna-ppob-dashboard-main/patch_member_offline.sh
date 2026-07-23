#!/bin/bash
sed -i 's/const members = \[/const [members, setMembers] = useState<any[]>(\[\]);/g' src/components/views/MemberOffline.tsx
sed -i 's/{ id: '\''OFL-01'\''.*//g' src/components/views/MemberOffline.tsx
sed -i 's/{ id: '\''OFL-02'\''.*//g' src/components/views/MemberOffline.tsx
sed -i 's/{ id: '\''OFL-03'\''.*//g' src/components/views/MemberOffline.tsx
sed -i 's/];/useEffect(() => {\n    fetch("\/api\/members\/offline").then(res => res.json()).then(data => setMembers(data.members || [])).catch(() => {});\n  }, []);/g' src/components/views/MemberOffline.tsx
sed -i 's/import { PageContainer }/import { useState, useEffect } from "react";\nimport { PageContainer }/g' src/components/views/MemberOffline.tsx
