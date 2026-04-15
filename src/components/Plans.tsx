'use client';

import { Plan } from '@/lib/types';

interface PlansProps {
  plans: Plan[];
  onAdd: () => void;
  onEdit: (plan: Plan) => void;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function Plans({ plans, onAdd, onEdit, onComplete, onDelete }: PlansProps) {
  const pending = plans.filter((p) => !p.completed).sort((a, b) => a.date.localeCompare(b.date));
  const completed = plans.filter((p) => p.completed).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <header className="page-header">
        <h1>复习计划</h1>
        <button className="btn-primary" onClick={onAdd}>
          + 添加计划
        </button>
      </header>
      <div className="plans-container">
        <div>
          <h3 className="plans-section-title">待完成</h3>
          {pending.length > 0 ? (
            pending.map((plan) => (
              <div key={plan.id} className="plan-card">
                <div className="plan-info">
                  <div className="plan-title">{plan.title}</div>
                  <div className="plan-date">
                    {plan.date} · {plan.description || '无描述'}
                  </div>
                </div>
                <div className="question-actions">
                  <button className="btn-icon success" onClick={() => onComplete(plan.id)} title="完成">
                    ✓
                  </button>
                  <button className="btn-icon" onClick={() => onEdit(plan)}>
                    ✏️
                  </button>
                  <button className="btn-icon" onClick={() => onDelete(plan.id)}>
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-text">暂无计划</p>
          )}
        </div>
        <div>
          <h3 className="plans-section-title">已完成</h3>
          {completed.length > 0 ? (
            completed.map((plan) => (
              <div key={plan.id} className="plan-card completed">
                <div className="plan-info">
                  <div className="plan-title">{plan.title}</div>
                  <div className="plan-date">
                    {plan.date} · {plan.description || '无描述'}
                  </div>
                </div>
                <button className="btn-icon" onClick={() => onDelete(plan.id)}>
                  🗑️
                </button>
              </div>
            ))
          ) : (
            <p className="empty-text">暂无已完成计划</p>
          )}
        </div>
      </div>
    </>
  );
}