import { app, safeStorage } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import type { AppSettings } from '../shared/types';

const defaultSettings: AppSettings = {
  theme: 'light',
  autoSync: false,
  apiBaseUrl: 'http://localhost:3000',
};

function ensureDir(): string {
  const dir = app.getPath('userData');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function settingsPath(): string {
  return path.join(ensureDir(), 'settings.json');
}

function credentialsPath(): string {
  return path.join(ensureDir(), 'credentials.bin');
}

export function readSettings(): AppSettings {
  try {
    const file = fs.readFileSync(settingsPath(), 'utf8');
    return { ...defaultSettings, ...(JSON.parse(file) as Partial<AppSettings>) };
  } catch {
    return defaultSettings;
  }
}

export function writeSettings(next: Partial<AppSettings>): AppSettings {
  const merged = { ...readSettings(), ...next };
  fs.writeFileSync(settingsPath(), JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}

export function saveCredential(token: string): void {
  const data = safeStorage.isEncryptionAvailable()
    ? safeStorage.encryptString(token)
    : Buffer.from(token, 'utf8');
  fs.writeFileSync(credentialsPath(), data);
}

export function loadCredential(): string | null {
  try {
    const data = fs.readFileSync(credentialsPath());
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(data);
    }
    return data.toString('utf8');
  } catch {
    return null;
  }
}
