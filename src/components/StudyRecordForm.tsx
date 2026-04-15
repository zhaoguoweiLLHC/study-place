'use client';

import { useState } from 'react';
import { StudyType, POINTS_RULES } from '@/lib/types';

interface StudyRecordFormData {
  type: StudyType;
  title: string;
  duration: number;
  bookName?: string;
  totalPages?: number;
  currentPage?: number;
  videoName?: string;
  videoProgress?: number;
}

interface StudyRecordFormProps {
  onSubmit: ( StudyRecordFormData) => void;
  onCancel: () => void;
}

export default function StudyRecordForm({ onSubmit, onCancel }: StudyRecordFormProps) {
  const [type, setType] = useState<StudyType>('book');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [bookName, setBookName] = useState('');
  const [totalPages, setTotalPages] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [videoName, setVideoName] = useState('');
  const [videoProgress, setVideoProgress] = useState(0);

  const handleTypeChange = (newType: StudyType) => {
    setType(newType);
    if (newType !== 'book') {
      setBookName('');
      setTotalPages(100);
      setCurrentPage(1);
    }
    if (newType !== 'video') {
      setVideoName('');
      setVideoProgress(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: StudyRecordFormData = {
      type,
      title,
      duration,
    };

    if (type === 'book') {
      data.bookName = bookName;
      data.totalPages = totalPages;
      data.currentPage = currentPage;
    } else if (type === 'video') {
      data.videoName = videoName;
      data.videoProgress = videoProgress;
    }

    onSubmit(data);
  };

  const calculatePoints = () => {
    let points = POINTS_RULES.RECORD_BASE + duration * POINTS_RULES.PER_MINUTE;
    if (type === 'book' && currentPage > 0) {
      points += POINTS_RULES.BOOK_BONUS;
    }
    if (type === 'video' && videoProgress === 100) {
      points += POINTS_RULES.VIDEO_COMPLETE_BONUS;
    }
    return points;
  };

  const typeOptions = [
    { value: 'book', label: '书籍', icon: '📚' },
    { value: 'video', label: '视频', icon: '🎥' },
    { value: 'practice', label: '练习', icon: '✏️' },
    { value: 'other', label: '其他', icon: '📝' },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">学习类型</label>
        <div className="type-selector">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`type-option ${type === option.value ? 'selected' : ''}`}
              onClick={() => handleTypeChange(option.value as StudyType)}
            >
              <span className="type-icon">{option.icon}</span>
              <span className="type-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {type === 'book' && (
        <>
          <div className="form-group">
            <label className="form-label">书籍名称</label>
            <input
              type="text"
              className="form-input"
              placeholder="例如：高等数学"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">总页数</label>
              <input
                type="number"
                className="form-input"
                min="1"
                value={totalPages}
                onChange={(e) => setTotalPages(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">当前页</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
              />
            </div>
          </div>
        </>
      )}

      {type === 'video' && (
        <>
          <div className="form-group">
            <label className="form-label">视频名称</label>
            <input
              type="text"
              className="form-input"
              placeholder="例如：数学分析第一讲"
              value={videoName}
              onChange={(e) => setVideoName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">观看进度: {videoProgress}%</label>
            <input
              type="range"
              className="progress-slider"
              min="0"
              max="100"
              value={videoProgress}
              onChange={(e) => setVideoProgress(Number(e.target.value))}
              style={{ background: `linear-gradient(to right, #5B8DEF ${videoProgress}%, #E8ECF0 ${videoProgress}%)` }}
            />
            <div className="progress-markers">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </>
      )}

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
            onChange={(e) => setDuration(Number(e.target.value))}
          />
          <div className="duration-value">
            <input
              type="number"
              className="form-input duration-input"
              min="1"
              max="480"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
            <span>分钟</span>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">学习内容/心得</label>
        <textarea
          className="form-textarea"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="记录你今天学习的内容、心得、疑问..."
          rows={4}
          required
        />
      </div>

      <div className="points-preview">
        <div className="points-preview-title">💡 预计可获得积分</div>
        <div className="points-preview-value">+{calculatePoints()} 积分</div>
        <div className="points-preview-detail">
          基础 {POINTS_RULES.RECORD_BASE} 分 + 时长 {duration * POINTS_RULES.PER_MINUTE} 分
          {type === 'book' && currentPage > 0 && ` + 书籍 ${POINTS_RULES.BOOK_BONUS} 分`}
          {type === 'video' && videoProgress === 100 && ` + 完成 ${POINTS_RULES.VIDEO_COMPLETE_BONUS} 分`}
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