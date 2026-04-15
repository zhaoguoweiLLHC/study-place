'use client';

import { useState } from 'react';
import { Reward, Redemption, UserStats } from '@/lib/types';

interface RewardsProps {
  rewards: Reward[];
  redemptions: Redemption[];
  stats: UserStats;
  onRedeem: (rewardId: number) => void;
  onAddReward: (reward: { name: string; description: string; cost: number; icon: string }) => void;
  onDeleteReward: (id: number) => void;
}

export default function Rewards({
  rewards,
  redemptions,
  stats,
  onRedeem,
  onAddReward,
  onDeleteReward,
}: RewardsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReward, setNewReward] = useState({
    name: '',
    description: '',
    cost: 50,
    icon: '🎁',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReward(newReward);
    setNewReward({ name: '', description: '', cost: 50, icon: '🎁' });
    setShowAddForm(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="rewards-container">
      {/* 积分显示 */}
      <div className="rewards-points-bar">
        <div className="rewards-points-info">
          <span className="rewards-points-label">可用积分</span>
          <span className="rewards-points-value">{stats.availablePoints} 💎</span>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '取消' : '添加奖励'}
        </button>
      </div>

      {/* 添加奖励表单 */}
      {showAddForm && (
        <form className="add-reward-form" onSubmit={handleAddSubmit}>
          <div className="form-row">
            <input
              type="text"
              className="form-input"
              placeholder="奖励名称"
              value={newReward.name}
              onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
              required
            />
            <input
              type="number"
              className="form-input"
              placeholder="所需积分"
              min="1"
              value={newReward.cost}
              onChange={(e) => setNewReward({ ...newReward, cost: Number(e.target.value) })}
              required
            />
          </div>
          <input
            type="text"
            className="form-input"
            placeholder="描述"
            value={newReward.description}
            onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
          />
          <div className="icon-selector">
            {['🎮', '📺', '🧋', '😴', '🍔', '📚', '🎵', '🏃', '🎁'].map((icon) => (
              <button
                key={icon}
                type="button"
                className={`icon-option ${newReward.icon === icon ? 'selected' : ''}`}
                onClick={() => setNewReward({ ...newReward, icon })}
              >
                {icon}
              </button>
            ))}
          </div>
          <button type="submit" className="btn-primary">
            添加奖励
          </button>
        </form>
      )}

      {/* 奖励列表 */}
      <div className="rewards-grid">
        {rewards.map((reward) => {
          const canAfford = stats.availablePoints >= reward.cost;
          return (
            <div key={reward.id} className={`reward-card ${!canAfford ? 'disabled' : ''}`}>
              <div className="reward-icon">{reward.icon}</div>
              <div className="reward-info">
                <div className="reward-name">{reward.name}</div>
                <div className="reward-desc">{reward.description}</div>
                <div className="reward-cost">
                  <span className={canAfford ? 'affordable' : 'not-affordable'}>
                    {reward.cost} 💎
                  </span>
                </div>
              </div>
              <div className="reward-actions">
                <button
                  className="btn-primary"
                  disabled={!canAfford}
                  onClick={() => {
                    if (confirm(`确定要兑换「${reward.name}」吗？需要消耗 ${reward.cost} 积分。`)) {
                      onRedeem(reward.id);
                    }
                  }}
                >
                  兑换
                </button>
                <button
                  className="btn-icon delete"
                  onClick={() => {
                    if (confirm('确定要删除这个奖励吗？')) {
                      onDeleteReward(reward.id);
                    }
                  }}
                  title="删除奖励"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 兑换记录 */}
      {redemptions.length > 0 && (
        <div className="redemptions-section">
          <h3 className="section-title">兑换记录</h3>
          <div className="redemptions-list">
            {redemptions.slice(0, 10).map((redemption) => (
              <div key={redemption.id} className="redemption-item">
                <span className="redemption-name">{redemption.rewardName}</span>
                <span className="redemption-cost">-{redemption.cost} 💎</span>
                <span className="redemption-date">{formatDate(redemption.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
