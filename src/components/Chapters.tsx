'use client';

import { useState } from 'react';
import { Chapter } from '@/lib/types';

const UNIT_NAMES: Record<string, string> = {
  '1': '第一章 集合与常用逻辑用语',
  '2': '第二章 一元二次函数、方程和不等式',
  '3': '第三章 函数的概念与性质',
  '4': '第四章 指数函数与对数函数',
  '5': '第五章 三角函数',
  '6': '第六章 平面向量',
  '7': '第七章 复数',
  '8': '第八章 立体几何',
  '9': '第九章 平面解析几何',
  '10': '第十章 计数原理',
  '11': '第十一章 概率',
};

interface ChaptersProps {
  chapters: Chapter[];
  onUpdateStatus: (id: string, status: 'pending' | 'studying' | 'completed') => void;
}

export default function Chapters({ chapters, onUpdateStatus }: ChaptersProps) {
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
    '3': true,
  });

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  // 按单元分组
  const units = chapters.reduce((acc, chapter) => {
    const unitId = chapter.id.split('-')[0];
    if (!acc[unitId]) {
      acc[unitId] = [];
    }
    acc[unitId].push(chapter);
    return acc;
  }, {} as Record<string, Chapter[]>);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'studying':
        return '📖';
      default:
        return '⭕';
    }
  };

  // 计算单元进度
  const getUnitProgress = (unitChapters: Chapter[]) => {
    const completed = unitChapters.filter((c) => c.status === 'completed').length;
    return { completed, total: unitChapters.length };
  };

  return (
    <>
      <header className="page-header">
        <h1>章节学习</h1>
        <p className="page-subtitle">完成章节学习可获得50积分奖励</p>
      </header>
      <div className="chapters-container">
        {Object.entries(units).map(([unitId, unitChapters]) => {
          const { completed, total } = getUnitProgress(unitChapters);
          const isExpanded = expandedUnits[unitId];

          return (
            <div key={unitId} className="chapter-unit">
              <div
                className={`unit-header ${isExpanded ? '' : 'collapsed'}`}
                onClick={() => toggleUnit(unitId)}
              >
                <span>{UNIT_NAMES[unitId] || `第${unitId}章`}</span>
                <div className="unit-progress">
                  <span className="progress-text">
                    {completed}/{total}
                  </span>
                  <span className={`toggle-icon ${isExpanded ? '' : 'collapsed'}`}>▼</span>
                </div>
              </div>
              <div className={`chapters-list ${isExpanded ? '' : 'collapsed'}`}>
                {unitChapters.map((chapter) => (
                  <div key={chapter.id} className="chapter-item">
                    <div className="chapter-info">
                      <span className="chapter-status-icon">{getStatusIcon(chapter.status)}</span>
                      <span className="chapter-name">{chapter.name}</span>
                    </div>
                    <div className="chapter-actions">
                      <select
                        className={`chapter-status-select status-${chapter.status}`}
                        value={chapter.status}
                        onChange={(e) =>
                          onUpdateStatus(chapter.id, e.target.value as 'pending' | 'studying' | 'completed')
                        }
                      >
                        <option value="pending">⭕ 未开始</option>
                        <option value="studying">📖 学习中</option>
                        <option value="completed">✅ 已完成 (+50分)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
