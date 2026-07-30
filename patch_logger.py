import re
with open('server.ts', 'r') as f:
    code = f.read()

# I want to add a file logger at the top of server.ts
logger_code = """
import fs_logger from 'fs';
const originalLog = console.log;
console.log = function(...args) {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    fs_logger.appendFileSync('app_debug.log', new Date().toISOString() + ' ' + msg + '\\n');
    originalLog.apply(console, args);
};
const originalError = console.error;
console.error = function(...args) {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    fs_logger.appendFileSync('app_debug.log', new Date().toISOString() + ' ERROR ' + msg + '\\n');
    originalError.apply(console, args);
};
"""
code = code.replace('import express from "express";', 'import express from "express";\n' + logger_code)
with open('server.ts', 'w') as f:
    f.write(code)
print("Logger patched")
