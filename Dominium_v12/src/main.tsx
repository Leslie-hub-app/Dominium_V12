import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Global resilience handlers for iframe / sandbox environments
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Prevent default cross-origin script error masking
    if (event.error) {
      console.error('Global error captured:', event.error);
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection prevented:', event.reason);
    // Prevent unhandled promise rejections from killing the execution context
    event.preventDefault();
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
