export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface Entry {
  id: number;
  title?: string;
  description: string;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  duration?: number;
  skills: string[];
  created_at: string;
}

export interface Stats {
  totalEntries: number;
  thisWeek: number;
  skillsLogged: number;
  currentStreak: number;
  topSkills: { skill_name: string; count: string }[];
  weekActivity: { date: string; count: string }[];
}

export interface CreateEntryPayload {
  title?: string;
  description: string;
  date: string;
  mood: number;
  duration?: number;
  skills: string[];
}
