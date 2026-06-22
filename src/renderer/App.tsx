import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import type { AppSettings, Note, Theme } from '../shared/types';
import { Sidebar } from './components/Sidebar';
import { StatusBar } from './components/StatusBar';
import { TopBar } from './components/TopBar';
import { ModalDialog } from './components/ModalDialog';

const FileExplorer = lazy(async () => import('./components/FileExplorer').then((module) => ({ default: module.FileExplorer })));
const RichEditor = lazy(async () => import('./components/RichEditor').then((module) => ({ default: module.RichEditor })));
const SettingsPanel = lazy(async () => import('./components/SettingsPanel').then((module) => ({ default: module.SettingsPanel })));

const defaultSettings: AppSettings = {
  theme: 'light',
  autoSync: false,
  apiBaseUrl: 'http://localhost:3000',
};

export function App() {
  const [section, setSection] = useState<'files' | 'editor' | 'settings'>('editor');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [status, setStatus] = useState('Ready');
  const [currentPath, setCurrentPath] = useState('');
  const [note, setNote] = useState<Note>({ id: 0, title: 'Untitled', content: '', updatedAt: new Date().toISOString() });
  const [notes, setNotes] = useState<Note[]>([]);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    void (async () => {
      const loadedSettings = await window.desktopApi.getSettings();
      if (loadedSettings.ok && loadedSettings.data) {
        setSettings(loadedSettings.data);
      }
      const loadedNotes = await window.desktopApi.listNotes();
      if (loadedNotes.ok && loadedNotes.data) setNotes(loadedNotes.data);
    })();

    return window.desktopApi.onNewNoteShortcut(() => {
      setNote({ id: 0, title: 'Untitled', content: '', updatedAt: new Date().toISOString() });
      setSection('editor');
      setStatus('New note created from shortcut');
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  const canSave = useMemo(() => note.title.trim().length > 0, [note.title]);

  const saveCurrentNote = async (): Promise<void> => {
    if (!canSave) return;
    const response = await window.desktopApi.saveNote({ id: note.id, title: note.title.trim(), content: note.content });
    if (response.ok && response.data) {
      setNote(response.data);
      setStatus('Note saved');
      const refreshed = await window.desktopApi.listNotes();
      if (refreshed.ok && refreshed.data) setNotes(refreshed.data);
    } else {
      setStatus(response.error ?? 'Unable to save note');
    }
  };

  return (
    <div className="app-shell">
      <TopBar
        theme={settings.theme}
        onToggleTheme={async () => {
          const theme: Theme = settings.theme === 'light' ? 'dark' : 'light';
          const response = await window.desktopApi.updateSettings({ theme });
          if (response.ok && response.data) {
            setSettings(response.data);
            setStatus(`Theme set to ${theme}`);
          }
        }}
        onOpen={async () => {
          const picked = await window.desktopApi.openDialog();
          if (!picked.ok || !picked.data?.length) return;
          const path = picked.data[0];
          setCurrentPath(path);
          setSection('files');
          setStatus(`Opened ${path}`);
        }}
        onSave={async () => {
          await saveCurrentNote();
        }}
        onExport={async () => {
          if (!currentPath) return;
          const filePath = `${currentPath}.export.json`;
          const response = await window.desktopApi.exportData(filePath);
          setStatus(response.ok ? `Exported to ${filePath}` : response.error ?? 'Export failed');
        }}
        onImport={async () => {
          const picked = await window.desktopApi.openDialog();
          if (!picked.ok || !picked.data?.length) return;
          const response = await window.desktopApi.importData(picked.data[0]);
          setStatus(response.ok ? 'Imported data' : response.error ?? 'Import failed');
        }}
        onSync={async () => {
          const response = await window.desktopApi.syncNow();
          const nextMessage = response.ok ? response.data ?? 'Sync complete' : response.error ?? 'Sync failed';
          setStatus(nextMessage);
          setModalMessage(nextMessage);
        }}
      />
      <div className="workspace">
        <Sidebar current={section} onChange={setSection} notes={notes} onPickNote={setNote} />
        <main className="main-content">
          <Suspense fallback={<div>Loading section...</div>}>
            {section === 'files' ? (
              <FileExplorer
                currentPath={currentPath}
                onPathChange={setCurrentPath}
                onStatus={setStatus}
                onLoadFile={(content, filePath) => {
                  setNote((prev) => ({ ...prev, content, title: filePath.split('/').pop() ?? prev.title }));
                  setSection('editor');
                }}
              />
            ) : null}
            {section === 'editor' ? (
              <RichEditor
                note={note}
                onChange={setNote}
                onSave={saveCurrentNote}
                onStatus={setStatus}
              />
            ) : null}
            {section === 'settings' ? (
              <SettingsPanel
                settings={settings}
                onSave={async (next) => {
                  const response = await window.desktopApi.updateSettings(next);
                  if (response.ok && response.data) {
                    setSettings(response.data);
                    setStatus('Settings updated');
                  }
                }}
                onSaveCredential={async (token) => {
                  const response = await window.desktopApi.saveCredential(token);
                  setStatus(response.ok ? 'Credential stored securely' : response.error ?? 'Unable to save credential');
                }}
              />
            ) : null}
          </Suspense>
        </main>
      </div>
      <StatusBar message={status} />
      <ModalDialog
        title="Sync status"
        message={modalMessage}
        open={modalMessage.length > 0}
        onClose={() => setModalMessage('')}
      />
    </div>
  );
}
