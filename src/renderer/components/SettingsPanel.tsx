import { useState } from 'react';
import type { AppSettings } from '../../shared/types';

interface SettingsPanelProps {
  settings: AppSettings;
  onSave(settings: Partial<AppSettings>): void;
  onSaveCredential(token: string): void;
}

export function SettingsPanel({ settings, onSave, onSaveCredential }: SettingsPanelProps) {
  const [apiBaseUrl, setApiBaseUrl] = useState(settings.apiBaseUrl);
  const [token, setToken] = useState('');

  return (
    <section>
      <h2>Settings</h2>
      <label>
        API Base URL
        <input value={apiBaseUrl} onChange={(event) => setApiBaseUrl(event.target.value)} />
      </label>
      <label>
        <input
          type="checkbox"
          checked={settings.autoSync}
          onChange={(event) => onSave({ autoSync: event.target.checked })}
        />
        Auto sync
      </label>
      <button onClick={() => onSave({ apiBaseUrl })}>Save settings</button>

      <h3>Credential Storage</h3>
      <input
        type="password"
        value={token}
        onChange={(event) => setToken(event.target.value)}
        placeholder="API token"
      />
      <button onClick={() => onSaveCredential(token)}>Store credential</button>
    </section>
  );
}
