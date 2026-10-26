import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { safeLocalStorage, safeSessionStorage } from './lib/safeStorage';

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: any) {
    return {
      hasError: true,
      errorMsg: error?.message || 'Terjadi kendala saat memuat tampilan.'
    };
  }

  componentDidCatch(error: any, info: any) {
    console.error('RootErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            <h2 className="text-xl font-bold text-pink-400 mb-2">E4 STORE SHIELD</h2>
            <p className="text-sm text-slate-300 mb-6">
              Tampilan sedang dimuat ulang untuk menyesuaikan proteksi browser Anda.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm uppercase tracking-wider cursor-pointer"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Pasang interceptor global pada window.fetch untuk menyertakan Cookie & Header Token Sesi pada seluruh request /api/*
if (typeof window !== 'undefined' && !(window as any).__chunaFetchPatched) {
  (window as any).__chunaFetchPatched = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const isApiCall = urlStr.startsWith('/api/') || urlStr.includes('/api/');

    if (isApiCall) {
      const token = safeSessionStorage.getItem('chuna_auth_token') || safeLocalStorage.getItem('chuna_auth_token') || '';
      const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
      if (token) {
        if (!headers.has('X-Admin-Session')) headers.set('X-Admin-Session', token);
        if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
      }
      const nextInit: RequestInit = {
        ...init,
        headers,
        credentials: init?.credentials || 'same-origin'
      };
      const res = await originalFetch(input, nextInit);
      if (
        res.status === 401 &&
        !urlStr.includes('/api/auth/login') &&
        !urlStr.includes('/api/auth/verify-otp') &&
        !urlStr.includes('/api/auth/session') &&
        !urlStr.includes('/api/security/warden/')
      ) {
        try {
          const clone = res.clone();
          const data = await clone.json();
          if (data && data.code === 'SESSION_REQUIRED') {
            safeSessionStorage.removeItem('chuna_auth');
            safeSessionStorage.removeItem('chuna_auth_token');
            safeLocalStorage.removeItem('chuna_auth');
            safeLocalStorage.removeItem('chuna_auth_token');
            window.dispatchEvent(new Event('logout'));
          }
        } catch (e) {}
      }
      return res;
    }

    return originalFetch(input, init);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);


