import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc';
import type { AppSettings, FileEntry, IpcResponse, Note } from '../shared/types';

const api = {
  readFile: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.fsRead, { path: filePath }) as Promise<IpcResponse<string>>,
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.fsWrite, { path: filePath, content }) as Promise<IpcResponse<boolean>>,
  deleteFile: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.fsDelete, { path: filePath }) as Promise<IpcResponse<boolean>>,
  listFiles: (dirPath: string) => ipcRenderer.invoke(IPC_CHANNELS.fsList, { path: dirPath }) as Promise<IpcResponse<FileEntry[]>>,
  openDialog: () => ipcRenderer.invoke(IPC_CHANNELS.dialogOpen) as Promise<IpcResponse<string[]>>,
  saveDialog: (content: string) => ipcRenderer.invoke(IPC_CHANNELS.dialogSave, { content }) as Promise<IpcResponse<string | null>>,
  showMessage: (message: string) => ipcRenderer.invoke(IPC_CHANNELS.dialogMessage, { message }) as Promise<IpcResponse<boolean>>,
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.settingsGet) as Promise<IpcResponse<AppSettings>>,
  updateSettings: (settings: Partial<AppSettings>) => ipcRenderer.invoke(IPC_CHANNELS.settingsSet, settings) as Promise<IpcResponse<AppSettings>>,
  listNotes: () => ipcRenderer.invoke(IPC_CHANNELS.notesList) as Promise<IpcResponse<Note[]>>,
  saveNote: (note: Pick<Note, 'id' | 'title' | 'content'>) => ipcRenderer.invoke(IPC_CHANNELS.notesUpsert, note) as Promise<IpcResponse<Note>>,
  deleteNote: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.notesDelete, id) as Promise<IpcResponse<boolean>>,
  listRecent: () => ipcRenderer.invoke(IPC_CHANNELS.recentList) as Promise<IpcResponse<string[]>>,
  addRecent: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.recentAdd, filePath) as Promise<IpcResponse<boolean>>,
  exportData: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.dataExport, filePath) as Promise<IpcResponse<boolean>>,
  importData: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.dataImport, filePath) as Promise<IpcResponse<boolean>>,
  syncNow: () => ipcRenderer.invoke(IPC_CHANNELS.syncNow) as Promise<IpcResponse<string>>,
  saveCredential: (token: string) => ipcRenderer.invoke(IPC_CHANNELS.credentialSet, token) as Promise<IpcResponse<boolean>>,
  loadCredential: () => ipcRenderer.invoke(IPC_CHANNELS.credentialGet) as Promise<IpcResponse<string | null>>,
  onNewNoteShortcut: (handler: () => void) => {
    const listener = () => handler();
    ipcRenderer.on('shortcut:new-note', listener);
    return () => ipcRenderer.off('shortcut:new-note', listener);
  },
};

contextBridge.exposeInMainWorld('desktopApi', api);
