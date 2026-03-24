'use client';

import { useEffect, useState } from 'react';
import { entriesAPI } from '@/lib/api';
import { Entry } from '@/types';
import EntryCard from '@/components/EntryCard';

const SKILL_OPTIONS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Express',
  'PostgreSQL', 'MongoDB', 'CSS', 'Tailwind', 'Git', 'Docker', 'AWS',
];

export default function HistoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [skillFilter, setSkillFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await entriesAPI.list({
        skill: skillFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await entriesAPI.delete(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert('Failed to delete entry');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">History</h1>
        <p className="text-text-secondary text-sm mt-1">All your logged entries</p>
      </div>

      {/* Filters */}
      <div className="bg-bg-card border border-bg-border rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-text-muted mb-1.5">Filter by skill</label>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            >
              <option value="">All skills</option>
              {SKILL_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1.5">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1.5">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadEntries}
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Filter
            </button>
            <button
              onClick={() => {
                setSkillFilter('');
                setFromDate('');
                setToDate('');
                setTimeout(loadEntries, 0);
              }}
              className="bg-bg-elevated border border-bg-border text-text-secondary hover:text-text-primary text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Entry count */}
      {!loading && (
        <p className="text-text-muted text-xs mb-4">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} found
        </p>
      )}

      {/* Entries list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted text-4xl mb-3">📂</p>
          <p className="text-text-secondary">No entries found.</p>
          <p className="text-text-muted text-sm mt-1">Try adjusting your filters, or log a new entry.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={() => handleDelete(entry.id)}
              expanded
            />
          ))}
        </div>
      )}
    </div>
  );
}
