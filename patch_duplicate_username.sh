#!/bin/bash
sed -i 's/const isTaken = Object.values(registeredUsers).some(u => u.username.toLowerCase() === text.toLowerCase());/const isTaken = Object.values(registeredUsers).some(u => u.username.toLowerCase() === text.toLowerCase()) || members.some(m => m.name.toLowerCase() === text.toLowerCase());/g' server.ts
