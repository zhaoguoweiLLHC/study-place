'use client';

import { StudyRecord } from '@/lib/types';

interface StudyRecordsProps {
  records: StudyRecord[];
  onDelete: (id: number) => void;
}

export default function StudyRecords({ records, onDelete }: StudyRecordsProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'book':
        return { icon: '📚', label: '书籍' };
      case 'video':
        return { icon: '🎥', label: '视频' };
      case 'practice':
        return { icon: '✏️', label: '练习' };
      default:
        return { icon: '📝', label: '其他' };
    }
  };

  // 按日期分组
  const groupedRecords = records.reduce((acc, record) => {
    const date = record.createdAt;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, StudyRecord[]>);

  // 排序日期（最新的在前）
  const sortedDates = Object.keys(groupedRecords).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="records-container">
      {sortedDates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>还没有学习记录</p>
          <p className="empty-hint">开始学习并记录你的第一条学习记录吧！</p>
        </div>
      ) : (
        sortedDates.map((date) => (
          <div key={date} className="record-date-group">
            <div className="record-date-header">
              <span className="record-date">{formatDate(date)}</span>
              <span className="record-count">{groupedRecords[date].length} 条记录</span>
            </div>
            <div className="records-list">
              {groupedRecords[date].map((record) => {
                const typeInfo = getTypeInfo(record.type);
                return (
                  <div key={record.id} className="record-card">
                    <div className="record-header">
                      <div className="record-type-badge">
                        <span>{typeInfo.icon}</span>
                        <span>{typeInfo.label}</span>
                      </div>
                      <div className="record-points">+{record.points} 💎</div>
                    </div>
                    <div className="record-content">{record.title}</div>
                    <div className="record-details">
                      {record.type === 'book' && record.bookName && (
                        <div className="record-detail-item">
                          <span className="detail-label">📖 {record.bookName}</span>
                          <span className="detail-value">
                            第 {record.currentPage} / {record.totalPages} 页
                          </span>
                        </div>
                      )}
                      {record.type === 'video' && record.videoName && (
                        <div className="record-detail-item">
                          <span className="detail-label">🎬 {record.videoName}</span>
                          <span className="detail-value">进度 {record.videoProgress}%</span>
                        </div>
                      )}
                    </div>
                    <div className="record-footer">
                      <div className="record-meta">
                        <span className="record-duration">⏱️ {formatDuration(record.duration)}</span>
                      </div>
                      <button
                        className="btn-icon delete"
                        onClick={() => onDelete(record.id)}
                        title="删除记录"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}