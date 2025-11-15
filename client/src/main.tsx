import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// DEV ONLY: Cleanup script to forcefully unregister old Service Workers
// This fixes the caching issue preventing new code from loading
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  const SW_CLEANUP_KEY = 'sw-cleanup-done';
  
  if (!sessionStorage.getItem(SW_CLEANUP_KEY)) {
    window.addEventListener('load', async () => {
      try {
        // Unregister all Service Workers
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('[DEV] Unregistered old Service Worker');
        }
        
        // Clear all caches
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          console.log('[DEV] Cleared cache:', cacheName);
        }
        
        // Mark cleanup as done and reload once
        if (registrations.length > 0 || cacheNames.length > 0) {
          sessionStorage.setItem(SW_CLEANUP_KEY, 'true');
          console.log('[DEV] Service Worker cleanup complete - reloading to load fresh code');
          window.location.reload();
        }
      } catch (error) {
        console.error('[DEV] Service Worker cleanup failed:', error);
      }
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);

// TEMPORARILY DISABLED: Service Worker was caching old JavaScript bundles
// preventing fixes from reaching the browser. Will re-enable with network-first strategy.
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}
*/
