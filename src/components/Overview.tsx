'use client';

import { AppData } from '@/lib/types';
import PointsCard from './PointsCard';

interface OverviewProps {
   AppData;
}

export default function Overview({ data }: OverviewProps) {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = data.records.filter((r) => r.createdAt === today);
  const todayStudyTime = todayRecords.reduce((sum, r) => sum + r.duration, 0);
  const todayPoints = todayRecords.reduce((sum, r) => sum + r.points, 0);

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
        <p className="page-subtitle">坚持学习，积累积分，兑换奖励</p>
      </header>

      <PointsCard stats={data.stats} />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💎</div>
          <div className="stat-info">
            <span className="stat-value">{data.stats.totalPoints}</span>
            <span className="stat-label">累计积分</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <span className="stat-value">{formatDuration(data.stats.totalStudyTime)}</span>
            <span className="stat-label">总学习时长</span>
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
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <span className="stat-value">{data.stats.currentStreak}</span>
            <span className="stat-label">连续学习天数</span>
          </div>
        </div>
      </div>

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

      <div className="today-overview">
        <h3 className="section-title">📅 今日学习</h3>
        <div className="today-stats">
          <div className="today-stat">
            <span className="today-value">{formatDuration(todayStudyTime)}</span>
            <span className="today-label">学习时长</span>
          </div>
          <div className="today-stat">
            <span className="today-value">+{todayPoints}</span>
            <span className="today-label">获得积分</span>
          </div>
          <div className="today-stat">
            <span className="today-value">{todayRecords.length}</span>
            <span className="today-label">学习记录</span>
          </div>
        </div>
      </div>

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
                    <span>+{record.points} 💎</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="points-rules">
        <h3 className="section-title">💡 积分规则</h3>
        <div className="rules-list">
          <div className="rule-item">
            <span className="rule-icon">📝</span>
            <span className="rule-text">记录学习内容</span>
            <span className="rule-points">+10分</span>
          </div>
          <div className="rule-item">
            <span className="rule-icon">⏱️</span>
            <span className="rule-text">每分钟学习</span>
            <span className="rule-points">+1分</span>
          </div>
          <div className="rule-item">
            <span className="rule-icon">📚</span>
            <span className="rule-text">书籍学习</span>
            <span className="rule-points">+2分</span>
          </div>
          <div className="rule-item">
            <span className="rule-icon">🎬</span>
            <span className="rule-text">视频完成</span>
            <span className="rule-points">+15分</span>
          </div>
          <div className="rule-item">
            <span className="rule-icon">🌅</span>
            <span className="rule-text">每日首次记录</span>
            <span className="rule-points">+20分</span>
          </div>
          <div className="rule-item">
            <span className="rule-icon">🔥</span>
            <span className="rule-text">连续学习（每天）</span>
            <span className="rule-points">+5分/天</span>
          </div>
        </div>
      </div>
    </>
  );
}
