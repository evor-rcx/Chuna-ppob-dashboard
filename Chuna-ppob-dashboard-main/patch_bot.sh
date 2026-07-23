#!/bin/bash
sed -i '/const handleStartWA = async () => {/i \
  const handleConnectGopay = async () => {\
    if (!gopayMerchantId || !gopayClientKey) {\
      alert("Masukkan Merchant ID dan Client Key GoPay terlebih dahulu!");\
      return;\
    }\
    setGopayLoading(true);\
    setGopayStatus("Connecting...");\
    try {\
      const response = await fetch("/api/gopay/configure", {\
        method: "POST",\
        headers: { "Content-Type": "application/json" },\
        body: JSON.stringify({ merchantId: gopayMerchantId, clientKey: gopayClientKey })\
      });\
      const data = await response.json();\
      if (data.success) {\
        setGopayStatus(data.status);\
        alert(data.message);\
      } else {\
        setGopayStatus("Error");\
        alert("Gagal menghubungkan GoPay: " + data.error);\
      }\
    } catch (err) {\
      setGopayStatus("Error");\
      alert("Terjadi kesalahan saat menghubungkan GoPay.");\
    } finally {\
      setGopayLoading(false);\
    }\
  };\
' src/components/views/Bot.tsx
