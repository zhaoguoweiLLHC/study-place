'use client';

import { useState } from 'react';
import { Chapter, POINTS_RULES } from '@/lib/types';

interface StudyRecordFormProps {
  chapters: Chapter[];
  onSubmit: (data: { chapterId: string; chapterName: string; content: string; duration: number }) => void;
  onCancel: () => void;
}

export default function StudyRecordForm({ chapters, onSubmit, onCancel }: StudyRecordFormProps) {
  const [chapterId, setChapterId] = useState('');
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState(30);
  const [estimatedPoints, setEstimatedPoints] = useState(POINTS_RULES.RECORD_BASE + 30 * POINTS_RULES.PER_MINUTE);

  const handleChapterChange = (id: string) => {
    setChapterId(id);
    const chapter = chapters.find((c) => c.id === id);
    if (chapter && chapter.name) {
      // 自动填充章节名称到内容开头
      if (!content) {
        setContent(`学习章节：${chapter.name}\n\n`);
      }
    }
  };

  const handleDurationChange = (value: number) => {
    setDuration(value);
    // 预估积分 = 基础分 + 时长分 + 首次奖励（无法预估）+ 连续奖励（无法预估）
    const basePoints = POINTS_RULES.RECORD_BASE + value * POINTS_RULES.PER_MINUTE;
    setEstimatedPoints(basePoints);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!chapter) return;

    onSubmit({
      chapterId,
      chapterName: chapter.name,
      content,
      duration,
    });
  };

  // 按单元分组章节
  const units = chapters.reduce((acc, chapter) => {
    const unitId = chapter.id.split('-')[0];
    if (!acc[unitId]) {
      acc[unitId] = [];
    }
    acc[unitId].push(chapter);
    return acc;
  }, {} as Record<string, Chapter[]>);

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">选择章节</label>
        <select
          className="form-select"
          value={chapterId}
          onChange={(e) => handleChapterChange(e.target.value)}
          required
        >
          <option value="">请选择章节</option>
          {Object.entries(units).map(([unitId, unitChapters]) => (
            <optgroup key={unitId} label={`第${unitId}单元`}>
              {unitChapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.name} {chapter.status === 'completed' ? '✓' : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">学习时长（分钟）</label>
        <div className="duration-input-group">
          <input
            type="range"
            className="duration-slider"
            min="5"
            max="180"
            step="5"
            value={duration}
            onChange={(e) => handleDurationChange(Number(e.target.value))}
          />
          <div className="duration-value">
            <input
              type="number"
              className="form-input duration-input"
              min="1"
              max="480"
              value={duration}
              onChange={(e) => handleDurationChange(Number(e.target.value))}
            />
            <span>分钟</span>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">学习内容</label>
        <textarea
          className="form-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="记录你今天学习的内容、心得、疑问..."
          rows={6}
          required
        />
      </div>

      <div className="points-preview">
        <div className="points-preview-title">💡 预计可获得积分</div>
        <div className="points-preview-value">+{estimatedPoints} 积分</div>
        <div className="points-preview-detail">
          基础记录 {POINTS_RULES.RECORD_BASE} 分 + 学习时长 {duration * POINTS_RULES.PER_MINUTE} 分
          {estimatedPoints > POINTS_RULES.RECORD_BASE + duration * POINTS_RULES.PER_MINUTE && ' + 额外奖励'}
        </div>
        <div className="points-preview-hint">
          每日首次记录额外 +{POINTS_RULES.FIRST_RECORD_OF_DAY} 分，连续学习还有加成奖励！
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          取消
        </button>
        <button type="submit" className="btn-primary">
          保存记录
        </button>
      </div>
    </form>
  );
}
