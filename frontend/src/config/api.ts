/**
 * Centralized API Configuration for PersonaAI
 * 
 * Supports:
 * - Build-time Vite environment variable (import.meta.env.VITE_API_URL)
 * - Runtime override via localStorage ('persona_custom_api_url') or window.__PERSONA_API_URL__
 * - Development fallback (http://localhost:5000/api)
 * - Automatic URL normalization (removes trailing slashes, ensures /api suffix)
 * - Production diagnostic detection when deployed to Vercel
 */

const DEFAULT_DEV_API = 'http://localhost:5000/api';

/**
 * Normalizes an API base URL so it never has trailing slashes and always ends in /api.
 */
export function normalizeApiUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return DEFAULT_DEV_API;
  let cleaned = rawUrl.trim().replace(/\/+$/, '');
  // If the user provided the base domain without /api (e.g. https://my-backend.onrender.com)
  if (!cleaned.endsWith('/api')) {
    cleaned = `${cleaned}/api`;
  }
  return cleaned;
}

/**
 * Determines if the application is running in a live production environment (e.g. Vercel).
 */
export function isProductionEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return (
    hostname !== 'localhost' &&
    hostname !== '127.0.0.1' &&
    !hostname.startsWith('192.168.') &&
    !hostname.startsWith('10.')
  );
}

/**
 * Checks if a given URL targets a local machine.
 */
export function isLocalhostUrl(url: string): boolean {
  return url.includes('localhost') || url.includes('127.0.0.1');
}

/**
 * Resolves the active API Base URL using the priority hierarchy:
 * 1. Runtime override in localStorage ('persona_custom_api_url')
 * 2. Runtime global window.__PERSONA_API_URL__
 * 3. Vite Build-Time Environment Variable: import.meta.env.VITE_API_URL
 * 4. Development fallback: http://localhost:5000/api
 */
export function getApiBaseUrl(): string {
  // 1. Check runtime localStorage override
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('persona_custom_api_url');
      if (stored && stored.trim().length > 0) {
        return normalizeApiUrl(stored);
      }
    } catch {
      // Ignore localStorage access issues
    }
  }

  // 2. Check window.__PERSONA_API_URL__
  if (typeof window !== 'undefined' && (window as any).__PERSONA_API_URL__) {
    return normalizeApiUrl((window as any).__PERSONA_API_URL__);
  }

  // 3. Check Vite build-time environment variable
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return normalizeApiUrl(envUrl);
  }

  // 4. Fallback
  return DEFAULT_DEV_API;
}

/**
 * Stores a custom API Base URL in localStorage for runtime testing.
 */
export function setCustomApiUrl(url: string): string {
  const normalized = normalizeApiUrl(url);
  if (typeof window !== 'undefined') {
    localStorage.setItem('persona_custom_api_url', normalized);
  }
  return normalized;
}

/**
 * Clears any runtime custom API Base URL override.
 */
export function clearCustomApiUrl(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('persona_custom_api_url');
  }
}

/**
 * Formats actionable, meaningful error messages for network and API failures.
 */
export function formatApiErrorMessage(err: unknown, endpoint: string): string {
  const currentUrl = getApiBaseUrl();
  const isNetworkFailure =
    err instanceof TypeError ||
    (err instanceof Error &&
      (err.message.includes('fetch') ||
        err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError') ||
        err.message.includes('Cannot connect')));

  if (isNetworkFailure) {
    if (isProductionEnvironment() && isLocalhostUrl(currentUrl)) {
      return `Production Configuration Required: The frontend is running on Vercel, but VITE_API_URL is configured to "${currentUrl}". In Vercel Project Settings, add the Environment Variable: VITE_API_URL = https://your-backend.onrender.com/api`;
    }
    return `Cannot connect to Backend API at ${currentUrl} (${endpoint}). Please verify that your backend server is deployed and running on Render or locally with 'npm start'.`;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return 'An unexpected network error occurred while communicating with the server.';
}

// Make setPersonaApiUrl available globally in the browser console for instant live debugging
if (typeof window !== 'undefined') {
  (window as any).setPersonaApiUrl = (url: string) => {
    const set = setCustomApiUrl(url);
    console.log(`✅ PersonaAI Backend API Base URL updated to: ${set}`);
    console.log('Reloading application to apply new API configuration...');
    window.location.reload();
  };
  (window as any).getPersonaApiUrl = getApiBaseUrl;
  (window as any).clearPersonaApiUrl = () => {
    clearCustomApiUrl();
    console.log('✅ Custom API URL cleared. Reverted to default.');
    window.location.reload();
  };
}
