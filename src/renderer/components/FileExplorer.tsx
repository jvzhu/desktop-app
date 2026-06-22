import { useState } from 'react';
import type { FileEntry } from '../../shared/types';

interface FileExplorerProps {
  currentPath: string;
  onPathChange(path: string): void;
  onStatus(message: string): void;
  onLoadFile(content: string, filePath: string): void;
}

export function FileExplorer({ currentPath, onPathChange, onStatus, onLoadFile }: FileExplorerProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);

  const browse = async (): Promise<void> => {
    const selected = await window.desktopApi.openDialog();
    if (!selected.ok || !selected.data?.length) return;
    const path = selected.data[0];
    onPathChange(path);

    const listing = await window.desktopApi.listFiles(path);
    if (listing.ok && listing.data) {
      setEntries(listing.data);
      onStatus(`Loaded ${listing.data.length} entries`);
    }
  };

  return (
    <section>
      <h2>File Explorer</h2>
      <p>Path: {currentPath || 'Not selected'}</p>
      <button onClick={browse}>Browse</button>
      <ul className="file-list">
        {entries.map((entry) => (
          <li key={entry.path}>
            <button
              onClick={async () => {
                if (entry.isDirectory) {
                  onPathChange(entry.path);
                  const listing = await window.desktopApi.listFiles(entry.path);
                  if (listing.ok && listing.data) setEntries(listing.data);
                  return;
                }
                const file = await window.desktopApi.readFile(entry.path);
                if (file.ok && file.data !== undefined) {
                  onLoadFile(file.data, entry.path);
                  onStatus(`Loaded ${entry.name}`);
                }
              }}
            >
              {entry.isDirectory ? '📁' : '📄'} {entry.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
