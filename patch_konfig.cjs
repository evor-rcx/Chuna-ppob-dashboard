const fs = require('fs');
let code = fs.readFileSync('src/components/views/Konfig.tsx', 'utf8');

const targetStr = `import React, { useState, useEffect, useRef } from 'react';`;
const replacementStr = `import React, { useState, useEffect, useRef } from 'react';
import { saveBgFile, clearBgFile } from '../../lib/bgStore';`;

code = code.replace(targetStr, replacementStr);

const targetStr2 = `          {bgType && (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400">URL Gambar / Video</label>
              <input
                type="text"
                placeholder={bgType === 'image' ? 'Masukkan URL gambar...' : 'Masukkan URL video...'}
                value={bgUrl}
                onChange={(e) => {
                  setBgUrl(e.target.value);
                  localStorage.setItem('chuna_bg_url', e.target.value);
                  window.dispatchEvent(new Event('chuna_bg_update'));
                }}
                className="w-full bg-slate-800/50 border border-slate-700/50 p-2 rounded-lg text-white text-sm outline-none"
              />
            </div>
          )}`;

const replacementStr2 = `          {bgType && (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400">Pilih File {bgType === 'image' ? 'Gambar' : 'Video'} dari Perangkat</label>
              <input
                type="file"
                accept={bgType === 'image' ? 'image/*' : 'video/*'}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      await saveBgFile(file);
                      setBgUrl('file_loaded'); // trigger UI update
                      window.dispatchEvent(new Event('chuna_bg_update'));
                    } catch(err) {
                      alert("Gagal menyimpan file ke penyimpanan lokal.");
                    }
                  } else {
                    await clearBgFile();
                    setBgUrl('');
                    window.dispatchEvent(new Event('chuna_bg_update'));
                  }
                }}
                className="w-full bg-slate-800/50 border border-slate-700/50 p-2 rounded-lg text-white text-sm outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-500/20 file:text-sky-400 hover:file:bg-sky-500/30"
              />
              <span className="text-[10px] text-slate-500">File akan disimpan di penyimpanan browser (tidak diupload ke server).</span>
            </div>
          )}`;

code = code.replace(targetStr2, replacementStr2);
fs.writeFileSync('src/components/views/Konfig.tsx', code);
