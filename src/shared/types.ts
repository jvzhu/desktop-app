export type Theme = 'light' | 'dark';

export interface AppSettings {
  theme: Theme;
  autoSync: boolean;
  apiBaseUrl: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
}

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

export interface IpcResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
