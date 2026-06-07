import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from 'next-themes';
import App from '@/App';
import '@/index.css';

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="adn-theme">
      <App />
    </ThemeProvider>
  </HelmetProvider>
);
