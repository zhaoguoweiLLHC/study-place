import fs from 'fs';
import path from 'path';
import { AppData, UserStats, DEFAULT_REWARDS } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'study.json');
const INITIAL_FILE = path.join(process.cwd(), 'data', 'initial.json');

const defaultStats: UserStats = {
  totalPoints: 0,
  availablePoints: 0,
  totalStudyTime: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  totalRecords: 0,
  completedChapters: 0,
};

export function ensureDataFile(): void {
  if (!fs.existsSync(DATA_FILE)) {
    if (fs.existsSync(INITIAL_FILE)) {
      const initialData = JSON.parse(fs.readFileSync(INITIAL_FILE, 'utf-8'));
      const data: AppData = {
        chapters: initialData.chapters.map((c: any) => ({
          id: c.id,
          name: c.name,
          status: 'pending',
          studyDate: null,
        })),
        notes: [],
        questions: [],
        plans: [],
        records: [],
        rewards: DEFAULT_REWARDS,
        redemptions: [],
        stats: { ...defaultStats },
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } else {
      const data: AppData = {
        chapters: [],
        notes: [],
        questions: [],
        plans: [],
        records: [],
        rewards: DEFAULT_REWARDS,
        redemptions: [],
        stats: { ...defaultStats },
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    }
  }
}

export function readData(): AppData {
  ensureDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

export function writeData(data: AppData): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
