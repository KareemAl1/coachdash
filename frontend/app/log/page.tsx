'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { entriesAPI } from '@/lib/api';

const SUGGESTED_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Express',
  'PostgreSQL', 'MongoDB', 'CSS', 'Tailwind', 'Git', 'Docker',
  'AWS', 'Testing', 'GraphQL', 'Python', 'Algorithms', 'System Design',
  'Backend', 'Frontend', 'DevOps', 'UI/UX',
];

const MOOD_OPTIONS = [
  { value: 1, emoji: '😔', label: 'Rough day' },
  { value: 2, emoji: '😐', label: 'Okay' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 4, emoji: '😊', label: 'Great' },
  { value: 5, emoji: '🚀', label: 'Crushing it' },
];

export default function LogEntryPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState<number>(3);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setCustomSkill('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please write what you worked on today.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await entriesAPI.create({
        title: title.trim() || undefined,
        description,
        date,
        mood,
        duration: duration ? parseFloat(duration) : undefined,
        skills,
      });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto fade-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">Create New Log</h1>
        <p className="text-text-secondary text-sm mt-1">
          Capture your daily wins and keep the streak alive.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Title */}
        <div className="bg-bg-card border border-bg-border rounded-xl p-5">
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Title <span className="text-text-muted font-normal normal-case">— optional</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Refactored Auth Logic"
            className="w-full bg-bg-elevated border border-bg-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Skills */}
        <div className="bg-bg-card border border-bg-border rounded-xl p-5">
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Skills Involved
            {skills.length > 0 && (
              <span className="ml-2 bg-accent-muted text-accent text-xs px-2 py-0.5 rounded-full normal-case font-medium">
                {skills.length} selected
              </span>
            )}
          </label>

          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTED_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  skills.includes(skill)
                    ? 'border-accent bg-accent-muted text-accent'
                    : 'border-bg-border text-text-secondary hover:border-text-muted'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>

          {/* Custom skill */}
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
              placeholder="Add custom skill…"
              className="flex-1 bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="button"
              onClick={addCustomSkill}
              className="px-3 py-2 bg-bg-elevated border border-bg-border rounded-lg text-text-secondary hover:border-accent hover:text-accent transition-all text-sm"
            >
              Add
            </button>
          </div>

          {/* Custom skills */}
          {skills.filter((s) => !SUGGESTED_SKILLS.includes(s)).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.filter((s) => !SUGGESTED_SKILLS.includes(s)).map((skill) => (
                <span key={skill} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-accent bg-accent-muted text-accent">
                  {skill}
                  <button type="button" onClick={() => toggleSkill(skill)} className="hover:text-white transition-colors">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Duration + Date row */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Duration
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="0"
                className="w-full bg-bg-elevated border border-bg-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
              />
              <span className="text-text-muted text-sm flex-shrink-0">hrs</span>
            </div>
          </div>

          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-bg-elevated border border-bg-border rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div className="bg-bg-card border border-bg-border rounded-xl p-5">
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            What did you build today?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you build today?"
            rows={5}
            className="w-full bg-bg-elevated border border-bg-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted text-sm resize-none focus:outline-none focus:border-accent transition-colors"
          />
          <p className="text-text-muted text-xs mt-2">
            {description.length} chars — more detail = better AI coaching
          </p>
        </div>

        {/* Mood */}
        <div className="bg-bg-card border border-bg-border rounded-xl p-5">
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            How did it feel?
          </label>
          <div className="flex gap-3">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMood(option.value)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg border transition-all ${
                  mood === option.value
                    ? 'border-accent bg-accent-muted'
                    : 'border-bg-border bg-bg-elevated hover:border-bg-border'
                }`}
              >
                <span className="text-xl">{option.emoji}</span>
                <span className="text-xs text-text-secondary hidden sm:block">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Save entry
            </>
          )}
        </button>
      </form>
    </div>
  );
}
