import { app } from 'electron';
import Database from 'better-sqlite3';
import path from 'node:path';
import type { Note } from '../shared/types';

let db: Database.Database;

function databaseFile(): string {
  return path.join(app.getPath('userData'), 'app.db');
}

export function initDatabase(): void {
  db = new Database(databaseFile());
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS recent_files (
      path TEXT PRIMARY KEY,
      opened_at TEXT NOT NULL
    );
  `);
}

function ensureDb(): Database.Database {
  if (!db) initDatabase();
  return db;
}

export function listNotes(): Note[] {
  const rows = ensureDb().prepare('SELECT id, title, content, updated_at FROM notes ORDER BY updated_at DESC').all() as Array<{
    id: number;
    title: string;
    content: string;
    updated_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    updatedAt: row.updated_at,
  }));
}

export function upsertNote(payload: Pick<Note, 'id' | 'title' | 'content'>): Note {
  const now = new Date().toISOString();
  if (payload.id > 0) {
    ensureDb()
      .prepare('UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?')
      .run(payload.title, payload.content, now, payload.id);
    return { ...payload, updatedAt: now };
  }

  const result = ensureDb()
    .prepare('INSERT INTO notes (title, content, updated_at) VALUES (?, ?, ?)')
    .run(payload.title, payload.content, now);

  return {
    id: Number(result.lastInsertRowid),
    title: payload.title,
    content: payload.content,
    updatedAt: now,
  };
}

export function deleteNote(id: number): void {
  ensureDb().prepare('DELETE FROM notes WHERE id = ?').run(id);
}

export function listRecentFiles(limit = 10): string[] {
  const rows = ensureDb()
    .prepare('SELECT path FROM recent_files ORDER BY opened_at DESC LIMIT ?')
    .all(limit) as Array<{ path: string }>;
  return rows.map((row) => row.path);
}

export function addRecentFile(filePath: string): void {
  ensureDb()
    .prepare('INSERT INTO recent_files (path, opened_at) VALUES (?, ?) ON CONFLICT(path) DO UPDATE SET opened_at = excluded.opened_at')
    .run(filePath, new Date().toISOString());
}
