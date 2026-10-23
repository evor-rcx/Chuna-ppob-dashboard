import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Pasang interceptor global pada window.fetch untuk menyertakan Cookie & Header Token Sesi pada seluruh request /api/*
if (typeof window !== 'undefined' && !(window as any).__chunaFetchPatched) {
  (window as any).__chunaFetchPatched = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const isApiCall = urlStr.startsWith('/api/') || urlStr.includes('/api/');

    if (isApiCall) {
      const token = sessionStorage.getItem('chuna_auth_token') || localStorage.getItem('chuna_auth_token') || '';
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
        !urlStr.includes('/api/auth/session') &&
        !urlStr.includes('/api/security/warden/')
      ) {
        try {
          const clone = res.clone();
          const data = await clone.json();
          if (data && data.code === 'SESSION_REQUIRED') {
            sessionStorage.removeItem('chuna_auth');
            sessionStorage.removeItem('chuna_auth_token');
            localStorage.removeItem('chuna_auth');
            localStorage.removeItem('chuna_auth_token');
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
    <App />
  </StrictMode>,
);

