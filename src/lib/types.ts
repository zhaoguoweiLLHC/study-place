// 学习类型
export type StudyType = 'book' | 'video' | 'practice' | 'other';

// 学习记录
export interface StudyRecord {
  id: number;
  type: StudyType; // 学习类型
  title: string; // 学习标题/内容
  duration: number; // 学习时长（分钟）
  points: number; // 获得的积分
  // 书籍类型特有字段
  bookName?: string; // 书籍名称
  totalPages?: number; // 总页数
  currentPage?: number; // 当前页
  // 视频类型特有字段
  videoName?: string; // 视频名称
  videoProgress?: number; // 视频进度（百分比）
  createdAt: string;
}

// 奖励
export interface Reward {
  id: number;
  name: string;
  description: string;
  cost: number; // 所需积分
  icon: string;
  category: 'entertainment' | 'food' | 'rest' | 'other'; // 奖励分类
}

// 兑换记录
export interface Redemption {
  id: number;
  rewardId: number;
  rewardName: string;
  cost: number;
  createdAt: string;
}

// 用户统计
export interface UserStats {
  totalPoints: number; // 总积分
  availablePoints: number; // 可用积分
  totalStudyTime: number; // 总学习时长（分钟）
  currentStreak: number; // 当前连续学习天数
  longestStreak: number; // 最长连续学习天数
  lastStudyDate: string | null; // 最后学习日期
  totalRecords: number; // 总学习记录数
  // 学习类型统计
  bookTime: number; // 书籍学习时长
  videoTime: number; // 视频学习时长
  practiceTime: number; // 练习时长
  otherTime: number; // 其他学习时长
}

// 应用数据
export interface AppData {
  records: StudyRecord[];
  rewards: Reward[];
  redemptions: Redemption[];
  stats: UserStats;
}

// 默认奖励配置
export const DEFAULT_REWARDS: Reward[] = [
  // 娱乐类
  { id: 1, name: '30分钟游戏时间', description: '兑换30分钟游戏时间', cost: 50, icon: '🎮', category: 'entertainment' },
  { id: 2, name: '1小时游戏时间', description: '兑换1小时游戏时间', cost: 90, icon: '🎮', category: 'entertainment' },
  { id: 3, name: '看一集动漫', description: '兑换看一集动漫的时间', cost: 60, icon: '📺', category: 'entertainment' },
  { id: 4, name: '看一部电影', description: '兑换看一部电影的时间', cost: 150, icon: '🎬', category: 'entertainment' },
  { id: 5, name: '刷短视频30分钟', description: '兑换刷短视频的时间', cost: 40, icon: '📱', category: 'entertainment' },
  // 餐饮类
  { id: 6, name: '一杯奶茶', description: '奖励自己一杯奶茶', cost: 100, icon: '🧋', category: 'food' },
  { id: 7, name: '一杯咖啡', description: '奖励自己一杯咖啡', cost: 80, icon: '☕', category: 'food' },
  { id: 8, name: '一顿外卖', description: '奖励自己一顿外卖', cost: 200, icon: '🍔', category: 'food' },
  { id: 9, name: '一份甜点', description: '奖励自己一份甜点', cost: 120, icon: '🍰', category: 'food' },
  // 休息类
  { id: 10, name: '休息半天', description: '兑换半天的自由时间', cost: 300, icon: '😴', category: 'rest' },
  { id: 11, name: '睡个懒觉', description: '允许明天睡到自然醒', cost: 80, icon: '🛏️', category: 'rest' },
  { id: 12, name: '放松一小时', description: '什么都不做，放松一小时', cost: 100, icon: '🧘', category: 'rest' },
  // 其他
  { id: 13, name: '买一本新书', description: '奖励自己买一本想看的书', cost: 250, icon: '📚', category: 'other' },
  { id: 14, name: '买一个小礼物', description: '奖励自己一个小礼物', cost: 180, icon: '🎁', category: 'other' },
];

// 积分规则
export const POINTS_RULES = {
  RECORD_BASE: 10, // 基础记录积分
  PER_MINUTE: 1, // 每分钟学习积分
  STREAK_BONUS: 5, // 连续学习每日奖励
  FIRST_RECORD_OF_DAY: 20, // 每日首次记录奖励
  BOOK_BONUS: 2, // 书籍学习额外积分/页
  VIDEO_COMPLETE_BONUS: 15, // 视频完成奖励
};