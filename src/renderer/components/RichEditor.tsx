import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import type { Note } from '../../shared/types';

interface RichEditorProps {
  note: Note;
  onChange(note: Note): void;
  onSave(): void;
  onStatus(message: string): void;
}

function sanitizeHtml(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: ['style'],
  });
}

export function RichEditor({ note, onChange, onSave, onStatus }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    const safe = sanitizeHtml(note.content);
    if (editorRef.current.innerHTML !== safe) {
      editorRef.current.innerHTML = safe;
    }
  }, [note.content]);

  const syncEditorContent = (): void => {
    if (!editorRef.current) return;
    const safe = sanitizeHtml(editorRef.current.innerHTML);
    if (editorRef.current.innerHTML !== safe) {
      editorRef.current.innerHTML = safe;
    }
    onChange({ ...note, content: safe });
  };

  const applyFormat = (tagName: 'b' | 'i' | 'u'): void => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const wrapper = document.createElement(tagName);
    try {
      range.surroundContents(wrapper);
    } catch {
      const selectedText = range.toString();
      wrapper.textContent = selectedText;
      range.deleteContents();
      range.insertNode(wrapper);
    }

    syncEditorContent();
  };

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
        <button onClick={() => applyFormat('b')}>Bold</button>
        <button onClick={() => applyFormat('i')}>Italic</button>
        <button onClick={() => applyFormat('u')}>Underline</button>
      </div>
      <div
        ref={editorRef}
        className="rich-input"
        contentEditable
        suppressContentEditableWarning
        onInput={syncEditorContent}
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
