const fs = require('fs');

const newStore = `
export const DB_NAME = 'chuna_bg_db';
export const STORE_NAME = 'bg_store';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataURLtoFile(dataurl: string, filename: string): File {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
}

export async function saveBgFile(file: File): Promise<void> {
  try {
    return await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(file, 'bg_file');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("IndexedDB failed, falling back to localStorage", err);
    try {
      const b64 = await fileToBase64(file);
      localStorage.setItem('chuna_bg_fallback', b64);
    } catch (fallbackErr) {
      console.error("Fallback to localStorage failed", fallbackErr);
      throw new Error("Gagal menyimpan file: " + (fallbackErr.message || fallbackErr.name || "Unknown error"));
    }
  }
}

export async function getBgFile(): Promise<File | null> {
  try {
    return await new Promise<File | null>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
           resolve(null);
           return;
        }
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const getRequest = store.get('bg_file');
        getRequest.onsuccess = () => {
          resolve(getRequest.result as File || null);
        };
        getRequest.onerror = () => reject(getRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    const b64 = localStorage.getItem('chuna_bg_fallback');
    if (b64) {
      return dataURLtoFile(b64, 'fallback_bg');
    }
    return null;
  }
}

export async function clearBgFile(): Promise<void> {
  try {
    localStorage.removeItem('chuna_bg_fallback');
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete('bg_file');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("clearBgFile: IndexedDB clear failed, ignored", err);
  }
}
`;

fs.writeFileSync('src/lib/bgStore.ts', newStore);
