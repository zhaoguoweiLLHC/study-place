'use client';

import { Note, Chapter } from '@/lib/types';

interface NotesProps {
  notes: Note[];
  chapters: Chapter[];
  search: string;
  chapterFilter: string;
  onSearchChange: (value: string) => void;
  onChapterFilterChange: (value: string) => void;
  onAdd: () => void;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
}

export default function Notes({
  notes,
  chapters,
  search,
  chapterFilter,
  onSearchChange,
  onChapterFilterChange,
  onAdd,
  onEdit,
  onDelete,
}: NotesProps) {
  const getChapterName = (chapterId: string) => {
    return chapters.find((c) => c.id === chapterId)?.name || '未知章节';
  };

  let filteredNotes = [...notes];
  if (search) {
    const s = search.toLowerCase();
    filteredNotes = filteredNotes.filter(
      (n) => n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s)
    );
  }
  if (chapterFilter) {
    filteredNotes = filteredNotes.filter((n) => n.chapter === chapterFilter);
  }

  return (
    <>
      <header className="page-header">
        <h1>学习笔记</h1>
        <button className="btn-primary" onClick={onAdd}>
          + 添加笔记
        </button>
      </header>
      <div className="notes-filters">
        <input
          type="text"
          className="search-input"
          placeholder="搜索笔记..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <select
          className="filter-select"
          value={chapterFilter}
          onChange={(e) => onChapterFilterChange(e.target.value)}
        >
          <option value="">所有章节</option>
          {chapters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="notes-list">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div key={note.id} className="note-card">
              <div className="note-header">
                <span className="note-title">{note.title}</span>
                <div className="note-tags">
                  {(note.tags || []).map((tag) => (
                    <span key={tag} className={`tag ${tag === '重点' || tag === '易错' ? 'important' : ''}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="note-content">{note.content}</div>
              <div className="note-footer">
                <span className="note-meta">
                  {getChapterName(note.chapter)} · {note.createdAt}
                </span>
                <div className="note-actions">
                  <button className="btn-icon" onClick={() => onEdit(note)}>
                    ✏️
                  </button>
                  <button className="btn-icon" onClick={() => onDelete(note.id)}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-text">暂无笔记</p>
        )}
      </div>
    </>
  );
}