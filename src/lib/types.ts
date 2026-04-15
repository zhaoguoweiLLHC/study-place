export interface Chapter {
  id: string;
  name: string;
  status: 'pending' | 'studying' | 'completed';
  studyDate: string | null;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  chapter: string;
  tags: string[];
  createdAt: string;
}

export interface Question {
  id: number;
  type: string;
  question: string;
  answer: string;
  wrongAnswer: string;
  explanation: string;
  chapter: string;
  mastered: boolean;
  createdAt: string;
}

export interface Plan {
  id: number;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  createdAt: string;
}

export interface StudyRecord {
  id: number;
  chapterId: string;
  chapterName: string;
  content: string;
  duration: number; // 学习时长（分钟）
  points: number; // 获得的积分
  createdAt: string;
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  cost: number; // 所需积分
  icon: string;
}

export interface Redemption {
  id: number;
  rewardId: number;
  rewardName: string;
  cost: number;
  createdAt: string;
}

export interface UserStats {
  totalPoints: number; // 总积分
  availablePoints: number; // 可用积分
  totalStudyTime: number; // 总学习时长（分钟）
  currentStreak: number; // 当前连续学习天数
  longestStreak: number; // 最长连续学习天数
  lastStudyDate: string | null; // 最后学习日期
  totalRecords: number; // 总学习记录数
  completedChapters: number; // 已完成章节数
}

export interface AppData {
  chapters: Chapter[];
  notes: Note[];
  questions: Question[];
  plans: Plan[];
  records: StudyRecord[];
  rewards: Reward[];
  redemptions: Redemption[];
  stats: UserStats;
}

// 默认奖励配置
export const DEFAULT_REWARDS: Reward[] = [
  { id: 1, name: '30分钟游戏时间', description: '兑换30分钟游戏时间', cost: 50, icon: '🎮' },
  { id: 2, name: '1小时游戏时间', description: '兑换1小时游戏时间', cost: 90, icon: '🎮' },
  { id: 3, name: '看一集动漫', description: '兑换看一集动漫的时间', cost: 60, icon: '📺' },
  { id: 4, name: '买一杯奶茶', description: '奖励自己一杯奶茶', cost: 100, icon: '🧋' },
  { id: 5, name: '休息半天', description: '兑换半天的自由时间', cost: 200, icon: '😴' },
];

// 积分规则
export const POINTS_RULES = {
  RECORD_BASE: 10, // 基础记录积分
  PER_MINUTE: 1, // 每分钟学习积分
  COMPLETE_CHAPTER: 50, // 完成章节奖励
  STREAK_BONUS: 5, // 连续学习每日奖励
  FIRST_RECORD_OF_DAY: 20, // 每日首次记录奖励
};
