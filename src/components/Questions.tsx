'use client';

import { Question, Chapter } from '@/lib/types';

interface QuestionsProps {
  questions: Question[];
  chapters: Chapter[];
  chapterFilter: string;
  statusFilter: string;
  onChapterFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onAdd: () => void;
  onEdit: (question: Question) => void;
  onDelete: (id: number) => void;
  onMarkMastered: (id: number) => void;
}

export default function Questions({
  questions,
  chapters,
  chapterFilter,
  statusFilter,
  onChapterFilterChange,
  onStatusFilterChange,
  onAdd,
  onEdit,
  onDelete,
  onMarkMastered,
}: QuestionsProps) {
  const getChapterName = (chapterId: string) => {
    return chapters.find((c) => c.id === chapterId)?.name || '未知章节';
  };

  let filteredQuestions = [...questions];
  if (chapterFilter) {
    filteredQuestions = filteredQuestions.filter((q) => q.chapter === chapterFilter);
  }
  if (statusFilter) {
    const mastered = statusFilter === 'mastered';
    filteredQuestions = filteredQuestions.filter((q) => q.mastered === mastered);
  }

  return (
    <>
      <header className="page-header">
        <h1>错题本</h1>
        <button className="btn-primary" onClick={onAdd}>
          + 添加错题
        </button>
      </header>
      <div className="questions-filters">
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
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="">所有状态</option>
          <option value="unmastered">未掌握</option>
          <option value="mastered">已掌握</option>
        </select>
      </div>
      <div className="questions-list">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => (
            <div key={q.id} className="question-card">
              <div className="question-header">
                <span className="question-title">
                  {q.type} - {q.question.substring(0, 30)}
                  {q.question.length > 30 ? '...' : ''}
                </span>
                <span className={`tag ${q.mastered ? '' : 'important'}`}>
                  {q.mastered ? '已掌握' : '未掌握'}
                </span>
              </div>
              <div className="note-content">
                <p>
                  <strong>正确答案：</strong>
                  {q.answer}
                </p>
                <p>
                  <strong>我的答案：</strong>
                  {q.wrongAnswer}
                </p>
                <p>
                  <strong>解析：</strong>
                  {q.explanation}
                </p>
              </div>
              <div className="question-footer">
                <span className="question-meta">
                  {getChapterName(q.chapter)} · {q.createdAt}
                </span>
                <div className="question-actions">
                  {!q.mastered && (
                    <button className="btn-icon success" onClick={() => onMarkMastered(q.id)} title="标记已掌握">
                      ✓
                    </button>
                  )}
                  <button className="btn-icon" onClick={() => onEdit(q)}>
                    ✏️
                  </button>
                  <button className="btn-icon" onClick={() => onDelete(q.id)}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-text">暂无错题</p>
        )}
      </div>
    </>
  );
}