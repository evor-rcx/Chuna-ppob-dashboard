#!/bin/bash
# 1. Change grid-cols-2 to grid-cols-3
sed -i 's/grid-cols-1 md:grid-cols-2/grid-cols-1 md:grid-cols-3/g' src/components/views/Bot.tsx

# 2. Add Status Box
sed -i '/<div className={`text-sm font-medium break-words ${waStatus.includes('\''Connected'\'') ? '\''text-green-400'\'' : '\''text-amber-400'\''}`}>/!b;n;n;a\
          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-2">\
            <div className="flex items-center gap-3">\
              <div className="w-8 h-8 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center">💳</div>\
              <div className="text-[10px] uppercase text-slate-500 font-bold">Status GoPay</div>\
            </div>\
            <div className={`text-sm font-medium break-words ${gopayStatus.includes("Connected") ? "text-green-400" : "text-amber-400"}`}>\
              {gopayStatus}\
            </div>\
          </div>\
' src/components/views/Bot.tsx

# 3. Add GoPay Section before the end of PageContainer
sed -i '/<\/PageContainer>/i \
        <div className="pt-4 border-t border-slate-800/50">\
          <h3 className="text-sm font-medium text-white mb-4">Pengaturan GoPay Merchant</h3>\
          <div className="flex flex-col gap-4">\
            <div className="flex flex-col gap-2">\
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">GoPay Merchant ID</label>\
              <input \
                type="text" \
                placeholder="GXXXXXX" \
                value={gopayMerchantId}\
                onChange={(e) => setGopayMerchantId(e.target.value)}\
                className="w-full bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-white text-sm outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/50 transition-all"\
              />\
            </div>\
            <div className="flex flex-col gap-2">\
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Client Key</label>\
              <input \
                type="password" \
                placeholder="Client Key..." \
                value={gopayClientKey}\
                onChange={(e) => setGopayClientKey(e.target.value)}\
                className="w-full bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-white text-sm outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/50 transition-all"\
              />\
            </div>\
          </div>\
          <button \
            onClick={handleConnectGopay}\
            disabled={gopayLoading}\
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-3 px-4 rounded-xl cursor-pointer hover:from-blue-400 hover:to-blue-500 transition-colors mt-4 shadow-lg shadow-blue-900/20 disabled:opacity-50"\
          >\
            {gopayLoading ? "Menghubungkan..." : "Hubungkan GoPay"}\
          </button>\
        </div>\
' src/components/views/Bot.tsx
