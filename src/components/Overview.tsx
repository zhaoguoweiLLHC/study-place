'use client';

import { AppData } from '@/lib/types';

interface OverviewProps {
   AppData;
}

export default function Overview({ data }: OverviewProps) {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = data.records.filter((r) => r.createdAt === today);
  const todayStudyTime = todayRecords.reduce((sum, r) => sum + r.duration, 0);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  const recentRecords = data.records.slice(0, 5);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book': return '📚';
      case 'video': return '🎥';
      case 'practice': return '✏️';
      default: return '📝';
    }
  };

  return (
    <>
      <header className="page-header">
        <h1>学习概览</h1>
        <p className="page-subtitle">坚持学习，每天进步一点点</p>
      </header>

      {/* 今日学习 - 突出显示 */}
      <div className="today-highlight">
        <div className="today-date">
          <span className="today-weekday">{['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date().getDay()]}</span>
          <span className="today-date-num">{new Date().getDate()}</span>
        </div>
        <div className="today-main">
          <div className="today-time">
            <span className="today-time-value">{formatDuration(todayStudyTime)}</span>
            <span className="today-time-label">今日学习</span>
          </div>
          <div className="today-divider"></div>
          <div className="today-records-count">
            <span className="today-count-value">{todayRecords.length}</span>
            <span className="today-count-label">条记录</span>
          </div>
        </div>
        {data.stats.currentStreak > 0 && (
          <div className="streak-badge">
            <span className="streak-icon">🔥</span>
            <span className="streak-text">连续学习 {data.stats.currentStreak} 天</span>
          </div>
        )}
      </div>

      {/* 学习统计 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <span className="stat-value">{formatDuration(data.stats.totalStudyTime)}</span>
            <span className="stat-label">累计学习时长</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <span className="stat-value">{data.stats.totalRecords}</span>
            <span className="stat-label">学习记录</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <span className="stat-value">{data.stats.longestStreak}</span>
            <span className="stat-label">最长连续天数</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💎</div>
          <div className="stat-info">
            <span className="stat-value">{data.stats.availablePoints}</span>
            <span className="stat-label">可用积分</span>
          </div>
        </div>
      </div>

      {/* 学习类型分布 */}
      <div className="study-type-stats">
        <h3 className="section-title">📊 学习类型分布</h3>
        <div className="type-stats-grid">
          <div className="type-stat-item">
            <span className="type-stat-icon">📚</span>
            <div className="type-stat-info">
              <span className="type-stat-value">{formatDuration(data.stats.bookTime)}</span>
              <span className="type-stat-label">书籍学习</span>
            </div>
          </div>
          <div className="type-stat-item">
            <span className="type-stat-icon">🎥</span>
            <div className="type-stat-info">
              <span className="type-stat-value">{formatDuration(data.stats.videoTime)}</span>
              <span className="type-stat-label">视频学习</span>
            </div>
          </div>
          <div className="type-stat-item">
            <span className="type-stat-icon">✏️</span>
            <div className="type-stat-info">
              <span className="type-stat-value">{formatDuration(data.stats.practiceTime)}</span>
              <span className="type-stat-label">练习时间</span>
            </div>
          </div>
          <div className="type-stat-item">
            <span className="type-stat-icon">📝</span>
            <div className="type-stat-info">
              <span className="type-stat-value">{formatDuration(data.stats.otherTime)}</span>
              <span className="type-stat-label">其他学习</span>
            </div>
          </div>
        </div>
      </div>

      {/* 最近学习记录 */}
      <div className="recent-records">
        <h3 className="section-title">📝 最近学习记录</h3>
        {recentRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>还没有学习记录</p>
            <p className="empty-hint">开始学习并记录你的第一条学习记录吧！</p>
          </div>
        ) : (
          <div className="recent-records-list">
            {recentRecords.map((record) => (
              <div key={record.id} className="recent-record-item">
                <div className="recent-record-type">{getTypeIcon(record.type)}</div>
                <div className="recent-record-info">
                  <div className="recent-record-title">{record.title || (record.type === 'book' ? record.bookName : record.videoName) || '学习记录'}</div>
                  <div className="recent-record-meta">
                    <span>⏱️ {formatDuration(record.duration)}</span>
                    <span className="record-date-text">{record.createdAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
