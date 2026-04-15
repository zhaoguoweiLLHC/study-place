'use client';

import { Chapter } from '@/lib/types';

interface QuestionFormProps {
  question: {
    type: string;
    question: string;
    answer: string;
    wrongAnswer: string;
    explanation: string;
    chapter: string;
  } | null;
  chapters: Chapter[];
  onSubmit: (data: {
    type: string;
    question: string;
    answer: string;
    wrongAnswer: string;
    explanation: string;
    chapter: string;
  }) => void;
  onCancel: () => void;
}

export default function QuestionForm({ question, chapters, onSubmit, onCancel }: QuestionFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const type = (form.elements.namedItem('questionType') as HTMLSelectElement).value;
        const chapter = (form.elements.namedItem('questionChapter') as HTMLSelectElement).value;
        const questionText = (form.elements.namedItem('questionContent') as HTMLTextAreaElement).value;
        const answer = (form.elements.namedItem('questionAnswer') as HTMLInputElement).value;
        const wrongAnswer = (form.elements.namedItem('questionWrongAnswer') as HTMLInputElement).value;
        const explanation = (form.elements.namedItem('questionExplanation') as HTMLTextAreaElement).value;

        onSubmit({ type, chapter, question: questionText, answer, wrongAnswer, explanation });
      }}
    >
      <div className="form-group">
        <label className="form-label">题目类型</label>
        <select name="questionType" className="form-select" defaultValue={question?.type || '选择题'} required>
          <option value="选择题">选择题</option>
          <option value="填空题">填空题</option>
          <option value="解答题">解答题</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">所属章节</label>
        <select name="questionChapter" className="form-select" defaultValue={question?.chapter || ''} required>
          <option value="">选择章节</option>
          {chapters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">题目内容</label>
        <textarea name="questionContent" className="form-textarea" defaultValue={question?.question || ''} required />
      </div>
      <div className="form-group">
        <label className="form-label">正确答案</label>
        <input type="text" name="questionAnswer" className="form-input" defaultValue={question?.answer || ''} required />
      </div>
      <div className="form-group">
        <label className="form-label">我的答案</label>
        <input
          type="text"
          name="questionWrongAnswer"
          className="form-input"
          defaultValue={question?.wrongAnswer || ''}
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">解析</label>
        <textarea
          name="questionExplanation"
          className="form-textarea"
          defaultValue={question?.explanation || ''}
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