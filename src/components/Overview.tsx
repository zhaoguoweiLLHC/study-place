'use client';

import { AppData } from '@/lib/types';
import PointsCard from './PointsCard';

interface OverviewProps {
   AppData;
}

export default function Overview({ data }: OverviewProps) {
  // 计算今日学习时长
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = data.records.filter((r) => r.createdAt === today);
  const todayStudyTime = todayRecords.reduce((sum, r) => sum + r.duration, 0);
  const todayPoints = todayRecords.reduce((sum, r) => sum + r.points, 0);

  // 格式化时长
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  // 获取最近学习记录
  const recentRecords = data.records.slice(0, 5);

  return (
    <>
      <header className="page-header">
        <h1>学习概览</h1>
        <p className="page-subtitle">坚持学习，积累积分，兑换奖励</p>
      </header>

      {/* 积分卡片 */}
      <PointsCard stats={data.stats} />

      {/* 统计网格 */}
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

      {/* 今日概览 */}
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

      {/* 最近记录 */}
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
                <div className="recent-record-chapter">{record.chapterName}</div>
                <div className="recent-record-meta">
                  <span>⏱️ {formatDuration(record.duration)}</span>
                  <span>+{record.points} 💎</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 积分规则说明 */}
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
