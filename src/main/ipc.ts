import { dialog, ipcMain } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { IPC_CHANNELS } from '../shared/ipc';
import { isSafePath, isSafeText } from '../shared/validation';
import { addRecentFile, deleteNote, listNotes, listRecentFiles, upsertNote } from './database';
import { loadCredential, readSettings, saveCredential, writeSettings } from './store';
import type { FileEntry, IpcResponse, Note } from '../shared/types';

function success<T>(data: T): IpcResponse<T> {
  return { ok: true, data };
}

function failure(message: string): IpcResponse<never> {
  return { ok: false, error: message };
}

function resolvePath(rawPath: string): string {
  return path.resolve(rawPath);
}

export function registerIpcHandlers(syncNow: () => Promise<string>): void {
  ipcMain.handle(IPC_CHANNELS.fsRead, async (_, payload: { path: string }) => {
    if (!isSafePath(payload.path)) return failure('Invalid path');
    const content = fs.readFileSync(resolvePath(payload.path), 'utf8');
    addRecentFile(payload.path);
    return success(content);
  });

  ipcMain.handle(IPC_CHANNELS.fsWrite, async (_, payload: { path: string; content: string }) => {
    if (!isSafePath(payload.path) || !isSafeText(payload.content)) return failure('Invalid payload');
    fs.writeFileSync(resolvePath(payload.path), payload.content, 'utf8');
    addRecentFile(payload.path);
    return success(true);
  });

  ipcMain.handle(IPC_CHANNELS.fsDelete, async (_, payload: { path: string }) => {
    if (!isSafePath(payload.path)) return failure('Invalid path');
    fs.rmSync(resolvePath(payload.path), { recursive: true, force: true });
    return success(true);
  });

  ipcMain.handle(IPC_CHANNELS.fsList, async (_, payload: { path: string }) => {
    if (!isSafePath(payload.path)) return failure('Invalid path');
    const target = resolvePath(payload.path);
    const entries = fs.readdirSync(target, { withFileTypes: true }).map((entry): FileEntry => ({
      name: entry.name,
      path: path.join(target, entry.name),
      isDirectory: entry.isDirectory(),
    }));
    return success(entries);
  });

  ipcMain.handle(IPC_CHANNELS.dialogOpen, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory'],
    });
    return success(result.filePaths);
  });

  ipcMain.handle(IPC_CHANNELS.dialogSave, async (_, payload: { content: string }) => {
    if (!isSafeText(payload.content)) return failure('Invalid content');
    const result = await dialog.showSaveDialog({
      title: 'Save file',
      filters: [{ name: 'Text', extensions: ['txt', 'md'] }],
    });

    if (!result.filePath) return success(null);
    fs.writeFileSync(result.filePath, payload.content, 'utf8');
    addRecentFile(result.filePath);
    return success(result.filePath);
  });

  ipcMain.handle(IPC_CHANNELS.dialogMessage, async (_, payload: { message: string }) => {
    if (!isSafeText(payload.message, 2_000)) return failure('Invalid message');
    await dialog.showMessageBox({
      type: 'info',
      message: payload.message,
    });
    return success(true);
  });

  ipcMain.handle(IPC_CHANNELS.settingsGet, async () => success(readSettings()));
  ipcMain.handle(IPC_CHANNELS.settingsSet, async (_, payload: Partial<{ theme: 'light' | 'dark'; autoSync: boolean; apiBaseUrl: string }>) => {
    if (payload.apiBaseUrl !== undefined && !isSafeText(payload.apiBaseUrl, 1024)) return failure('Invalid settings');
    return success(writeSettings(payload));
  });

  ipcMain.handle(IPC_CHANNELS.notesList, async () => success(listNotes()));
  ipcMain.handle(IPC_CHANNELS.notesUpsert, async (_, payload: Pick<Note, 'id' | 'title' | 'content'>) => {
    if (!isSafeText(payload.title, 200) || !isSafeText(payload.content)) return failure('Invalid note');
    return success(upsertNote(payload));
  });
  ipcMain.handle(IPC_CHANNELS.notesDelete, async (_, id: number) => {
    if (typeof id !== 'number') return failure('Invalid note id');
    deleteNote(id);
    return success(true);
  });

  ipcMain.handle(IPC_CHANNELS.recentList, async () => success(listRecentFiles()));
  ipcMain.handle(IPC_CHANNELS.recentAdd, async (_, filePath: string) => {
    if (!isSafePath(filePath)) return failure('Invalid file path');
    addRecentFile(filePath);
    return success(true);
  });

  ipcMain.handle(IPC_CHANNELS.dataExport, async (_, exportPath: string) => {
    if (!isSafePath(exportPath)) return failure('Invalid export path');
    const payload = {
      notes: listNotes(),
      settings: readSettings(),
      recent: listRecentFiles(50),
      exportedAt: new Date().toISOString(),
    };
    fs.writeFileSync(resolvePath(exportPath), JSON.stringify(payload, null, 2), 'utf8');
    return success(true);
  });

  ipcMain.handle(IPC_CHANNELS.dataImport, async (_, importPath: string) => {
    if (!isSafePath(importPath)) return failure('Invalid import path');
    const raw = fs.readFileSync(resolvePath(importPath), 'utf8');
    const data = JSON.parse(raw) as {
      notes?: Array<Pick<Note, 'title' | 'content'>>;
      settings?: Partial<{ theme: 'light' | 'dark'; autoSync: boolean; apiBaseUrl: string }>;
      recent?: string[];
    };

    for (const note of data.notes ?? []) {
      upsertNote({ id: 0, title: note.title, content: note.content });
    }

    for (const recent of data.recent ?? []) {
      if (isSafePath(recent)) addRecentFile(recent);
    }

    if (data.settings) writeSettings(data.settings);

    return success(true);
  });

  ipcMain.handle(IPC_CHANNELS.syncNow, async () => {
    const message = await syncNow();
    return success(message);
  });

  ipcMain.handle(IPC_CHANNELS.credentialSet, async (_, token: string) => {
    if (!isSafeText(token, 10_000)) return failure('Invalid credential');
    if (!saveCredential(token)) {
      return failure('OS secure encryption is unavailable');
    }
    return success(true);
  });

  ipcMain.handle(IPC_CHANNELS.credentialGet, async () => success(loadCredential()));
}
