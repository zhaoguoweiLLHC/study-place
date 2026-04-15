'use client';

import { UserStats } from '@/lib/types';

interface PointsCardProps {
  stats: UserStats;
}

export default function PointsCard({ stats }: PointsCardProps) {
  return (
    <div className="points-card">
      <div className="points-main">
        <div className="points-icon">💎</div>
        <div className="points-info">
          <div className="points-value">{stats.availablePoints}</div>
          <div className="points-label">可用积分</div>
        </div>
      </div>
      <div className="points-details">
        <div className="points-detail-item">
          <span className="detail-value">{stats.totalPoints}</span>
          <span className="detail-label">累计获得</span>
        </div>
        <div className="points-detail-item">
          <span className="detail-value">{stats.currentStreak}</span>
          <span className="detail-label">连续天数</span>
        </div>
        <div className="points-detail-item">
          <span className="detail-value">{stats.longestStreak}</span>
          <span className="detail-label">最长连续</span>
        </div>
      </div>
    </div>
  );
}
