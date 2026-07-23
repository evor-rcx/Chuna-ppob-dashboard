#!/bin/bash
# Remove handleConnectGopay
sed -i '/const handleConnectGopay = async () => {/,/  };/d' src/components/views/Bot.tsx
