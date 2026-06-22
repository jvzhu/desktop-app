import type { Theme } from '../../shared/types';

interface TopBarProps {
  theme: Theme;
  onOpen(): void;
  onSave(): void;
  onImport(): void;
  onExport(): void;
  onSync(): void;
  onToggleTheme(): void;
}

export function TopBar(props: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand">Desktop App</div>
      <div className="actions">
        <button onClick={props.onOpen}>Open</button>
        <button onClick={props.onSave}>Save</button>
        <button onClick={props.onImport}>Import</button>
        <button onClick={props.onExport}>Export</button>
        <button onClick={props.onSync}>Sync</button>
        <button onClick={props.onToggleTheme}>{props.theme === 'light' ? 'Dark' : 'Light'} Theme</button>
      </div>
    </header>
  );
}
