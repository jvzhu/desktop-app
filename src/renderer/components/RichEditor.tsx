import { useRef } from 'react';
import type { Note } from '../../shared/types';

interface RichEditorProps {
  note: Note;
  onChange(note: Note): void;
  onSave(): void;
  onStatus(message: string): void;
}

export function RichEditor({ note, onChange, onSave, onStatus }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <section className="editor">
      <h2>Editor</h2>
      <input
        aria-label="Note title"
        value={note.title}
        onChange={(event) => onChange({ ...note, title: event.target.value })}
        placeholder="Title"
      />
      <div className="toolbar">
        <button onClick={() => document.execCommand('bold')}>Bold</button>
        <button onClick={() => document.execCommand('italic')}>Italic</button>
        <button onClick={() => document.execCommand('underline')}>Underline</button>
      </div>
      <div
        ref={editorRef}
        className="rich-input"
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: note.content }}
        onInput={(event) => onChange({ ...note, content: (event.target as HTMLDivElement).innerHTML })}
      />
      <div className="editor-actions">
        <button onClick={onSave}>Save note</button>
        <button
          onClick={async () => {
            const result = await window.desktopApi.saveDialog(note.content);
            onStatus(result.ok ? 'Saved to file' : result.error ?? 'Save failed');
          }}
        >
          Save to file
        </button>
      </div>
    </section>
  );
}
