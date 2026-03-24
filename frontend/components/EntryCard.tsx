import { Entry } from '@/types';

const MOOD_LABELS: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: '😔', label: 'Rough', color: 'text-red-400' },
  2: { emoji: '😐', label: 'Okay', color: 'text-orange-400' },
  3: { emoji: '🙂', label: 'Good', color: 'text-yellow-400' },
  4: { emoji: '😊', label: 'Great', color: 'text-green-400' },
  5: { emoji: '🚀', label: 'Crushing it', color: 'text-purple-400' },
};

interface EntryCardProps {
  entry: Entry;
  onDelete?: () => void;
  expanded?: boolean;
}

export default function EntryCard({ entry, onDelete, expanded = false }: EntryCardProps) {
  const mood = MOOD_LABELS[entry.mood] ?? MOOD_LABELS[3];

  const formattedDate = new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-bg-elevated border border-bg-border rounded-xl p-4 hover:border-accent/30 transition-all group">
      <div className="flex items-start gap-3">
        {/* Mood indicator */}
        <div className="flex-shrink-0 w-9 h-9 bg-bg-card rounded-lg flex items-center justify-center text-lg">
          {mood.emoji}
        </div>

        <div className="flex-1 min-w-0">
          {/* Date + mood + duration row */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs text-text-muted font-mono">{formattedDate}</span>
            <span className={`text-xs font-medium ${mood.color}`}>{mood.label}</span>
            {entry.duration && (
              <span className="text-xs text-text-muted">⏱ {entry.duration}h</span>
            )}
          </div>

          {/* Title */}
          {entry.title && (
            <p className="text-sm font-semibold text-text-primary mb-1">{entry.title}</p>
          )}

          {/* Description */}
          <p className={`text-sm text-text-secondary leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {entry.description}
          </p>

          {/* Skills */}
          {entry.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {entry.skills.slice(0, expanded ? undefined : 3).map((skill) => (
                <span key={skill} className="text-xs bg-accent-muted text-accent px-2 py-0.5 rounded-full">
                  {skill}
                </span>
              ))}
              {!expanded && entry.skills.length > 3 && (
                <span className="text-xs text-text-muted">+{entry.skills.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-text-muted hover:text-red-400 p-1"
            title="Delete entry"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
