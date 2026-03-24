'use client';

import { useEffect, useState } from 'react';
import { entriesAPI } from '@/lib/api';
import { Stats, Entry } from '@/types';
import StatCard from '@/components/StatCard';
import ActivityChart from '@/components/ActivityChart';
import SkillBar from '@/components/SkillBar';
import EntryCard from '@/components/EntryCard';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, entriesData] = await Promise.all([
          entriesAPI.stats(),
          entriesAPI.list(),
        ]);
        setStats(statsData);
        setRecentEntries(entriesData.slice(0, 3));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center max-w-sm">
          <p className="text-red-400 font-medium">Failed to load dashboard</p>
          <p className="text-text-secondary text-sm mt-1">{error}</p>
          <p className="text-text-muted text-xs mt-3">Make sure the backend is running and you are logged in.</p>
        </div>
      </div>
    );
  }

  const maxSkillCount = stats?.topSkills?.[0]
    ? parseInt(stats.topSkills[0].count)
    : 1;

  return (
    <div className="p-6 lg:p-8 fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link
          href="/log"
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors pulse-glow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Log today
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total entries"
          value={stats?.totalEntries ?? 0}
          icon="📝"
          trend={stats?.thisWeek ? `+${stats.thisWeek} this week` : undefined}
        />
        <StatCard
          label="Current streak"
          value={`${stats?.currentStreak ?? 0}d`}
          icon="🔥"
          highlight={!!stats?.currentStreak && stats.currentStreak >= 3}
        />
        <StatCard
          label="Skills tracked"
          value={stats?.skillsLogged ?? 0}
          icon="🛠"
        />
        <StatCard
          label="This week"
          value={stats?.thisWeek ?? 0}
          icon="📅"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Activity chart */}
        <div className="lg:col-span-2 bg-bg-card border border-bg-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Weekly Activity
          </h2>
          <ActivityChart data={stats?.weekActivity ?? []} />
        </div>

        {/* Top skills */}
        <div className="bg-bg-card border border-bg-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Top Skills
          </h2>
          {stats?.topSkills && stats.topSkills.length > 0 ? (
            <div className="space-y-3">
              {stats.topSkills.slice(0, 6).map((skill) => (
                <SkillBar
                  key={skill.skill_name}
                  name={skill.skill_name}
                  count={parseInt(skill.count)}
                  max={maxSkillCount}
                />
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">No skills logged yet.</p>
          )}
        </div>
      </div>

      {/* Recent entries */}
      <div className="bg-bg-card border border-bg-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Recent Entries
          </h2>
          <Link href="/history" className="text-accent hover:text-accent-hover text-xs font-medium transition-colors">
            View all →
          </Link>
        </div>
        {recentEntries.length > 0 ? (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-muted text-sm">No entries yet.</p>
            <Link href="/log" className="text-accent text-sm mt-2 inline-block hover:underline">
              Log your first entry →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
