import type { AppSettings, FileEntry, IpcResponse, Note } from '../shared/types';

declare global {
  interface Window {
    desktopApi: {
      readFile(filePath: string): Promise<IpcResponse<string>>;
      writeFile(filePath: string, content: string): Promise<IpcResponse<boolean>>;
      deleteFile(filePath: string): Promise<IpcResponse<boolean>>;
      listFiles(dirPath: string): Promise<IpcResponse<FileEntry[]>>;
      openDialog(): Promise<IpcResponse<string[]>>;
      saveDialog(content: string): Promise<IpcResponse<string | null>>;
      showMessage(message: string): Promise<IpcResponse<boolean>>;
      getSettings(): Promise<IpcResponse<AppSettings>>;
      updateSettings(settings: Partial<AppSettings>): Promise<IpcResponse<AppSettings>>;
      listNotes(): Promise<IpcResponse<Note[]>>;
      saveNote(note: Pick<Note, 'id' | 'title' | 'content'>): Promise<IpcResponse<Note>>;
      deleteNote(id: number): Promise<IpcResponse<boolean>>;
      listRecent(): Promise<IpcResponse<string[]>>;
      addRecent(filePath: string): Promise<IpcResponse<boolean>>;
      exportData(filePath: string): Promise<IpcResponse<boolean>>;
      importData(filePath: string): Promise<IpcResponse<boolean>>;
      syncNow(): Promise<IpcResponse<string>>;
      saveCredential(token: string): Promise<IpcResponse<boolean>>;
      loadCredential(): Promise<IpcResponse<string | null>>;
      onNewNoteShortcut(handler: () => void): () => void;
    };
  }
}

export {};
