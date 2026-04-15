'use client';

interface ChapterStatusFormProps {
  chapter: { id: string; name: string; status: string };
  onSubmit: (status: string) => void;
  onCancel: () => void;
}

export default function ChapterStatusForm({ chapter, onSubmit, onCancel }: ChapterStatusFormProps) {
  return (
    <div>
      <div className="form-group">
        <label className="form-label">学习状态</label>
        <select id="chapterStatus" className="form-select" defaultValue={chapter.status}>
          <option value="pending">未学</option>
          <option value="studying">学习中</option>
          <option value="completed">已完成</option>
        </select>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          取消
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            const status = (document.getElementById('chapterStatus') as HTMLSelectElement).value;
            onSubmit(status);
          }}
        >
          保存
        </button>
      </div>
    </div>
  );
}