import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

if (!window.desktopApi) {
  window.desktopApi = {
    readFile: async () => ({ ok: true, data: '' }),
    writeFile: async () => ({ ok: true, data: true }),
    deleteFile: async () => ({ ok: true, data: true }),
    listFiles: async () => ({ ok: true, data: [] }),
    openDialog: async () => ({ ok: true, data: [] }),
    saveDialog: async () => ({ ok: true, data: null }),
    showMessage: async () => ({ ok: true, data: true }),
    getSettings: async () => ({ ok: true, data: { theme: 'light', autoSync: false, apiBaseUrl: 'http://localhost:3000' } }),
    updateSettings: async (settings) => ({ ok: true, data: { theme: 'light', autoSync: false, apiBaseUrl: 'http://localhost:3000', ...settings } }),
    listNotes: async () => ({ ok: true, data: [] }),
    saveNote: async (note) => ({ ok: true, data: { ...note, updatedAt: new Date().toISOString() } }),
    deleteNote: async () => ({ ok: true, data: true }),
    listRecent: async () => ({ ok: true, data: [] }),
    addRecent: async () => ({ ok: true, data: true }),
    exportData: async () => ({ ok: true, data: true }),
    importData: async () => ({ ok: true, data: true }),
    syncNow: async () => ({ ok: true, data: 'Sync complete (mock)' }),
    saveCredential: async () => ({ ok: true, data: true }),
    loadCredential: async () => ({ ok: true, data: null }),
    onNewNoteShortcut: () => () => undefined,
  };
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
