import re

with open('/app/applet/src/components/views/Login.tsx', 'r') as f:
    content = f.read()

if "import { playAccessGranted }" not in content:
    content = content.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport { playAccessGranted } from '../../utils/audio';")
    content = content.replace("setIsUnlocking(true);", "setIsUnlocking(true);\n      playAccessGranted();")
    
with open('/app/applet/src/components/views/Login.tsx', 'w') as f:
    f.write(content)

with open('/app/applet/src/components/Sidebar.tsx', 'r') as f:
    sidebar_content = f.read()

if "import { playPowerDown, playTerminalBlip }" not in sidebar_content:
    sidebar_content = sidebar_content.replace("import { getHolidayInfo } from '../utils/holidays';", "import { getHolidayInfo } from '../utils/holidays';\nimport { playPowerDown, playTerminalBlip } from '../utils/audio';")
    sidebar_content = sidebar_content.replace("setIsLoggingOut(true);", "setIsLoggingOut(true);\n    playPowerDown();")
    sidebar_content = sidebar_content.replace("setLogoutLogs(prev => [...prev, logs[currentLogIndex]]);", "setLogoutLogs(prev => [...prev, logs[currentLogIndex]]);\n        playTerminalBlip();")

with open('/app/applet/src/components/Sidebar.tsx', 'w') as f:
    f.write(sidebar_content)
