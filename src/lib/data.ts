import fs from 'fs';
import path from 'path';
import { AppData, UserStats, DEFAULT_REWARDS } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'study.json');

const defaultStats: UserStats = {
  totalPoints: 0,
  availablePoints: 0,
  totalStudyTime: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  totalRecords: 0,
  bookTime: 0,
  videoTime: 0,
  practiceTime: 0,
  otherTime: 0,
};

export function ensureDataFile(): void {
  if (!fs.existsSync(DATA_FILE)) {
    const data: AppData = {
      records: [],
      rewards: DEFAULT_REWARDS,
      redemptions: [],
      stats: { ...defaultStats },
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }
}

export function readData(): AppData {
  ensureDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

export function writeData( AppData): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}