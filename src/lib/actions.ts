'use server';

import { revalidatePath } from 'next/cache';
import { readData, writeData } from './data';
import { POINTS_RULES } from './types';

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
    // 今天已经学习过
    return { streak: 0, isFirstToday: false };
  } else if (diffDays === 1) {
    // 连续学习
    return { streak: 1, isFirstToday: true };
  } else {
    // 中断了，重新开始
    return { streak: 1, isFirstToday: true };
  }
}

// 创建学习记录并计算积分
export async function createStudyRecord(record: {
  chapterId: string;
  chapterName: string;
  content: string;
  duration: number;
}) {
  const data = readData();
  const today = new Date().toISOString().split('T')[0];

  // 计算积分
  let points = POINTS_RULES.RECORD_BASE;
  points += record.duration * POINTS_RULES.PER_MINUTE;

  // 检查连续学习
  const { streak, isFirstToday } = calculateStreak(data.stats.lastStudyDate, today);

  if (isFirstToday) {
    points += POINTS_RULES.FIRST_RECORD_OF_DAY;
    // 更新连续学习天数
    const newStreak = data.stats.currentStreak + streak;
    data.stats.currentStreak = newStreak;
    if (newStreak > data.stats.longestStreak) {
      data.stats.longestStreak = newStreak;
    }
    // 连续学习奖励
    points += newStreak * POINTS_RULES.STREAK_BONUS;
  }

  // 更新统计数据
  data.stats.totalPoints += points;
  data.stats.availablePoints += points;
  data.stats.totalStudyTime += record.duration;
  data.stats.totalRecords += 1;
  data.stats.lastStudyDate = today;

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
    // 退回积分
    data.stats.totalPoints -= record.points;
    data.stats.availablePoints -= record.points;
    data.stats.totalStudyTime -= record.duration;
    data.stats.totalRecords -= 1;

    data.records.splice(recordIndex, 1);
    writeData(data);
    revalidatePath('/');
    return { success: true, pointsReturned: record.points };
  }
  return { success: false };
}

// 更新章节状态
export async function updateChapterStatus(id: string, status: 'pending' | 'studying' | 'completed') {
  const data = readData();
  const chapter = data.chapters.find((c) => c.id === id);

  if (chapter) {
    const wasCompleted = chapter.status === 'completed';
    chapter.status = status;
    chapter.studyDate = status === 'completed' ? new Date().toISOString().split('T')[0] : null;

    // 完成章节奖励积分
    if (status === 'completed' && !wasCompleted) {
      data.stats.totalPoints += POINTS_RULES.COMPLETE_CHAPTER;
      data.stats.availablePoints += POINTS_RULES.COMPLETE_CHAPTER;
      data.stats.completedChapters += 1;
    } else if (wasCompleted && status !== 'completed') {
      // 取消完成，扣除积分
      data.stats.totalPoints -= POINTS_RULES.COMPLETE_CHAPTER;
      data.stats.availablePoints -= POINTS_RULES.COMPLETE_CHAPTER;
      data.stats.completedChapters -= 1;
    }

    writeData(data);
    revalidatePath('/');
    return { chapter, stats: data.stats };
  }
  return null;
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

  // 扣除积分
  data.stats.availablePoints -= reward.cost;

  // 创建兑换记录
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
export async function addReward(reward: { name: string; description: string; cost: number; icon: string }) {
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

// 创建笔记
export async function createNote(note: { title: string; content: string; chapter: string; tags: string[] }) {
  const data = readData();
  const newNote = {
    id: Date.now(),
    ...note,
    createdAt: new Date().toISOString().split('T')[0],
  };
  data.notes.unshift(newNote);
  writeData(data);
  revalidatePath('/');
  return newNote;
}

// 更新笔记
export async function updateNote(id: number, note: Partial<{ title: string; content: string; chapter: string; tags: string[] }>) {
  const data = readData();
  const index = data.notes.findIndex((n) => n.id === id);
  if (index !== -1) {
    data.notes[index] = { ...data.notes[index], ...note };
    writeData(data);
    revalidatePath('/');
    return data.notes[index];
  }
  return null;
}

// 删除笔记
export async function deleteNote(id: number) {
  const data = readData();
  const index = data.notes.findIndex((n) => n.id === id);
  if (index !== -1) {
    data.notes.splice(index, 1);
    writeData(data);
    revalidatePath('/');
    return { success: true };
  }
  return { success: false };
}

// 创建错题
export async function createQuestion(question: { type: string; question: string; answer: string; wrongAnswer: string; explanation: string; chapter: string }) {
  const data = readData();
  const newQuestion = {
    id: Date.now(),
    ...question,
    mastered: false,
    createdAt: new Date().toISOString().split('T')[0],
  };
  data.questions.unshift(newQuestion);
  writeData(data);
  revalidatePath('/');
  return newQuestion;
}

// 更新错题
export async function updateQuestion(id: number, question: Partial<{ type: string; question: string; answer: string; wrongAnswer: string; explanation: string; chapter: string; mastered: boolean }>) {
  const data = readData();
  const index = data.questions.findIndex((q) => q.id === id);
  if (index !== -1) {
    data.questions[index] = { ...data.questions[index], ...question };
    writeData(data);
    revalidatePath('/');
    return data.questions[index];
  }
  return null;
}

// 删除错题
export async function deleteQuestion(id: number) {
  const data = readData();
  const index = data.questions.findIndex((q) => q.id === id);
  if (index !== -1) {
    data.questions.splice(index, 1);
    writeData(data);
    revalidatePath('/');
    return { success: true };
  }
  return { success: false };
}

// 创建计划
export async function createPlan(plan: { title: string; description: string; date: string }) {
  const data = readData();
  const newPlan = {
    id: Date.now(),
    ...plan,
    completed: false,
    createdAt: new Date().toISOString().split('T')[0],
  };
  data.plans.unshift(newPlan);
  writeData(data);
  revalidatePath('/');
  return newPlan;
}

// 更新计划
export async function updatePlan(id: number, plan: Partial<{ title: string; description: string; date: string; completed: boolean }>) {
  const data = readData();
  const index = data.plans.findIndex((p) => p.id === id);
  if (index !== -1) {
    data.plans[index] = { ...data.plans[index], ...plan };
    writeData(data);
    revalidatePath('/');
    return data.plans[index];
  }
  return null;
}

// 删除计划
export async function deletePlan(id: number) {
  const data = readData();
  const index = data.plans.findIndex((p) => p.id === id);
  if (index !== -1) {
    data.plans.splice(index, 1);
    writeData(data);
    revalidatePath('/');
    return { success: true };
  }
  return { success: false };
}
