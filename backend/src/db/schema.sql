-- CoachDash Database Schema
-- Run this against your PostgreSQL database to set up all tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  password    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entries table (daily dev logs)
CREATE TABLE IF NOT EXISTS entries (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255),
  description TEXT NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  mood        INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
  duration    NUMERIC(4,1),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entry skills table (tags on each entry)
CREATE TABLE IF NOT EXISTS entry_skills (
  id          SERIAL PRIMARY KEY,
  entry_id    INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  skill_name  VARCHAR(100) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
CREATE INDEX IF NOT EXISTS idx_entry_skills_entry_id ON entry_skills(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_skills_skill_name ON entry_skills(skill_name);
