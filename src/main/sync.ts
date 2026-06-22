import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { listNotes } from './database';
import { readSettings } from './store';

const MAX_RETRIES = 3;

function cachePath(): string {
  return path.join(app.getPath('userData'), 'sync-cache.json');
}

function writeCache(data: unknown): void {
  fs.writeFileSync(cachePath(), JSON.stringify(data, null, 2), 'utf8');
}

function readCache(): unknown {
  try {
    return JSON.parse(fs.readFileSync(cachePath(), 'utf8'));
  } catch {
    return null;
  }
}

export async function syncWithApi(): Promise<string> {
  const settings = readSettings();
  const notes = listNotes();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(`${settings.apiBaseUrl.replace(/\/$/, '')}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      writeCache(payload);
      return `Sync completed on attempt ${attempt}`;
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        const cache = readCache();
        if (cache) {
          return 'Offline mode: served cached sync data';
        }
        return `Sync failed: ${(error as Error).message}`;
      }
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }

  return 'Sync skipped';
}
