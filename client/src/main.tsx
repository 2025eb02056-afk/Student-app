import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';
import './services/firebase.js';
import { autoSeedFirestoreCollections } from './services/firestore.js';

// Automatically create & sync Firestore collections on app boot
if (typeof window !== 'undefined') {
  setTimeout(() => {
    autoSeedFirestoreCollections().catch((err) => {
      console.warn('Initial Firestore collections sync skipped:', err);
    });
  }, 1000);
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
