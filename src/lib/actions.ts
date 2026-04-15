'use server';

import { revalidatePath } from 'next/cache';
import { readData, writeData } from './data';
import { POINTS_RULES, StudyType } from './types';

// 计算连续学习天数
function calculateStreak(lastStudyDate: string | null, currentDate: string): { streak: number; isFirstToday: boolean } {
  if (!lastStudyDate) {
    return { streak: 1, isFirstToday: true };
  }

  const last = new Date(lastStudyDate);
  const current = new Date(currentDate);
  const diffTime = current.getTime() - last.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { streak: 0, isFirstToday: false };
  } else if (diffDays === 1) {
    return { streak: 1, isFirstToday: true };
  } else {
    return { streak: 1, isFirstToday: true };
  }
}

// 创建学习记录并计算积分
export async function createStudyRecord(record: {
  type: StudyType;
  title: string;
  duration: number;
  bookName?: string;
  totalPages?: number;
  currentPage?: number;
  videoName?: string;
  videoProgress?: number;
}) {
  const data = readData();
  const today = new Date().toISOString().split('T')[0];

  // 计算积分
  let points = POINTS_RULES.RECORD_BASE;
  points += record.duration * POINTS_RULES.PER_MINUTE;

  // 书籍类型额外积分（每页2分）
  if (record.type === 'book' && record.currentPage && record.totalPages) {
    points += POINTS_RULES.BOOK_BONUS;
  }

  // 视频完成奖励
  if (record.type === 'video' && record.videoProgress === 100) {
    points += POINTS_RULES.VIDEO_COMPLETE_BONUS;
  }

  // 检查连续学习
  const { streak, isFirstToday } = calculateStreak(data.stats.lastStudyDate, today);

  if (isFirstToday) {
    points += POINTS_RULES.FIRST_RECORD_OF_DAY;
    const newStreak = data.stats.currentStreak + streak;
    data.stats.currentStreak = newStreak;
    if (newStreak > data.stats.longestStreak) {
      data.stats.longestStreak = newStreak;
    }
    points += newStreak * POINTS_RULES.STREAK_BONUS;
  }

  // 更新统计数据
  data.stats.totalPoints += points;
  data.stats.availablePoints += points;
  data.stats.totalStudyTime += record.duration;
  data.stats.totalRecords += 1;
  data.stats.lastStudyDate = today;

  // 更新学习类型统计
  switch (record.type) {
    case 'book':
      data.stats.bookTime += record.duration;
      break;
    case 'video':
      data.stats.videoTime += record.duration;
      break;
    case 'practice':
      data.stats.practiceTime += record.duration;
      break;
    default:
      data.stats.otherTime += record.duration;
  }

  // 创建记录
  const newRecord = {
    id: Date.now(),
    ...record,
    points,
    createdAt: today,
  };
  data.records.unshift(newRecord);

  writeData(data);
  revalidatePath('/');
  return { record: newRecord, pointsEarned: points, stats: data.stats };
}

// 删除学习记录（退回积分）
export async function deleteStudyRecord(id: number) {
  const data = readData();
  const recordIndex = data.records.findIndex((r) => r.id === id);

  if (recordIndex !== -1) {
    const record = data.records[recordIndex];
    data.stats.totalPoints -= record.points;
    data.stats.availablePoints -= record.points;
    data.stats.totalStudyTime -= record.duration;
    data.stats.totalRecords -= 1;

    // 更新学习类型统计
    switch (record.type) {
      case 'book':
        data.stats.bookTime -= record.duration;
        break;
      case 'video':
        data.stats.videoTime -= record.duration;
        break;
      case 'practice':
        data.stats.practiceTime -= record.duration;
        break;
      default:
        data.stats.otherTime -= record.duration;
    }

    data.records.splice(recordIndex, 1);
    writeData(data);
    revalidatePath('/');
    return { success: true, pointsReturned: record.points };
  }
  return { success: false };
}

// 兑换奖励
export async function redeemReward(rewardId: number) {
  const data = readData();
  const reward = data.rewards.find((r) => r.id === rewardId);

  if (!reward) {
    return { success: false, error: '奖励不存在' };
  }

  if (data.stats.availablePoints < reward.cost) {
    return { success: false, error: '积分不足' };
  }

  data.stats.availablePoints -= reward.cost;

  const redemption = {
    id: Date.now(),
    rewardId: reward.id,
    rewardName: reward.name,
    cost: reward.cost,
    createdAt: new Date().toISOString().split('T')[0],
  };
  data.redemptions.unshift(redemption);

  writeData(data);
  revalidatePath('/');
  return { success: true, redemption, stats: data.stats };
}

// 添加自定义奖励
export async function addReward(reward: { name: string; description: string; cost: number; icon: string; category: 'entertainment' | 'food' | 'rest' | 'other' }) {
  const data = readData();
  const newReward = {
    id: Date.now(),
    ...reward,
  };
  data.rewards.push(newReward);
  writeData(data);
  revalidatePath('/');
  return newReward;
}

// 删除奖励
export async function deleteReward(id: number) {
  const data = readData();
  const index = data.rewards.findIndex((r) => r.id === id);
  if (index !== -1) {
    data.rewards.splice(index, 1);
    writeData(data);
    revalidatePath('/');
    return { success: true };
  }
  return { success: false };
}

// 导出数据
export async function exportData() {
  return readData();
}

// 导入数据
export async function importData(data: Parameters<typeof writeData>[0]) {
  writeData(data);
  revalidatePath('/');
  return { success: true };
}