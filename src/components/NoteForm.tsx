'use client';

import { Chapter } from '@/lib/types';

interface NoteFormProps {
  note: { title: string; content: string; chapter: string; tags: string[] } | null;
  chapters: Chapter[];
  onSubmit: (data: { title: string; content: string; chapter: string; tags: string[] }) => void;
  onCancel: () => void;
}

export default function NoteForm({ note, chapters, onSubmit, onCancel }: NoteFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const title = (form.elements.namedItem('noteTitle') as HTMLInputElement).value;
        const chapter = (form.elements.namedItem('noteChapter') as HTMLSelectElement).value;
        const content = (form.elements.namedItem('noteContent') as HTMLTextAreaElement).value;
        const tags = (form.elements.namedItem('noteTags') as HTMLInputElement).value
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t);

        onSubmit({ title, chapter, content, tags });
      }}
    >
      <div className="form-group">
        <label className="form-label">标题</label>
        <input type="text" name="noteTitle" className="form-input" defaultValue={note?.title || ''} required />
      </div>
      <div className="form-group">
        <label className="form-label">所属章节</label>
        <select name="noteChapter" className="form-select" defaultValue={note?.chapter || ''} required>
          <option value="">选择章节</option>
          {chapters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">内容</label>
        <textarea name="noteContent" className="form-textarea" defaultValue={note?.content || ''} required />
      </div>
      <div className="form-group">
        <label className="form-label">标签（用逗号分隔）</label>
        <input
          type="text"
          name="noteTags"
          className="form-input"
          defaultValue={note?.tags.join(', ') || ''}
          placeholder="重点, 易错"
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          取消
        </button>
        <button type="submit" className="btn-primary">
          保存
        </button>
      </div>
    </form>
  );
}