import type { Note } from '../../shared/types';

interface SidebarProps {
  current: 'files' | 'editor' | 'settings';
  notes: Note[];
  onChange(section: 'files' | 'editor' | 'settings'): void;
  onPickNote(note: Note): void;
}

export function Sidebar({ current, notes, onChange, onPickNote }: SidebarProps) {
  return (
    <aside className="sidebar">
      <button className={current === 'files' ? 'active' : ''} onClick={() => onChange('files')}>Files</button>
      <button className={current === 'editor' ? 'active' : ''} onClick={() => onChange('editor')}>Editor</button>
      <button className={current === 'settings' ? 'active' : ''} onClick={() => onChange('settings')}>Settings</button>
      <div className="notes-list">
        <strong>Recent Notes</strong>
        {notes.slice(0, 8).map((note) => (
          <button key={note.id} className="note-item" onClick={() => onPickNote(note)}>
            {note.title}
          </button>
        ))}
      </div>
    </aside>
  );
}
