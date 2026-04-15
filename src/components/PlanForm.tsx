'use client';

interface PlanFormProps {
  plan: { title: string; description: string; date: string } | null;
  onSubmit: (data: { title: string; description: string; date: string }) => void;
  onCancel: () => void;
}

export default function PlanForm({ plan, onSubmit, onCancel }: PlanFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const title = (form.elements.namedItem('planTitle') as HTMLInputElement).value;
        const date = (form.elements.namedItem('planDate') as HTMLInputElement).value;
        const description = (form.elements.namedItem('planDescription') as HTMLTextAreaElement).value;

        onSubmit({ title, date, description });
      }}
    >
      <div className="form-group">
        <label className="form-label">计划标题</label>
        <input type="text" name="planTitle" className="form-input" defaultValue={plan?.title || ''} required />
      </div>
      <div className="form-group">
        <label className="form-label">计划日期</label>
        <input type="date" name="planDate" className="form-input" defaultValue={plan?.date || ''} required />
      </div>
      <div className="form-group">
        <label className="form-label">描述</label>
        <textarea name="planDescription" className="form-textarea" defaultValue={plan?.description || ''} />
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