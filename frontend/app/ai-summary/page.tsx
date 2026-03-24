'use client';

import { useState } from 'react';
import { streamAISummary } from '@/lib/api';

export default function AISummaryPage() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setSummary('');
    setDone(false);
    setError(null);
    setLoading(true);

    await streamAISummary(
      (chunk) => setSummary((prev) => prev + chunk),
      () => {
        setLoading(false);
        setDone(true);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
  };

  // Convert markdown-like text to JSX with basic formatting
  const renderSummary = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-lg font-semibold text-text-primary mt-6 mb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-xl font-bold text-text-primary mt-6 mb-2">{line.slice(2)}</h1>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-text-primary mt-4 mb-1">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith('- ')) {
        return (
          <div key={i} className="flex gap-2 my-1">
            <span className="text-accent mt-1 flex-shrink-0">•</span>
            <span>{line.slice(2)}</span>
          </div>
        );
      }
      if (line === '') {
        return <div key={i} className="h-2" />;
      }
      // Inline bold
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="my-0.5 leading-relaxed">
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j} className="font-semibold text-text-primary">{part}</strong> : part
          )}
        </p>
      );
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">AI Weekly Summary</h1>
        <p className="text-text-secondary text-sm mt-1">
          Get a personalised coaching summary based on your last 7 days of work
        </p>
      </div>

      {/* Generate button */}
      {!loading && !summary && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-accent-muted rounded-full flex items-center justify-center mx-auto mb-6 pulse-glow">
            <span className="text-4xl">🤖</span>
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">Ready to get coached?</h2>
          <p className="text-text-secondary text-sm mb-8 max-w-sm mx-auto">
            Claude will analyse your last 7 days of entries and tell you what you're improving at,
            what to focus on, and something you did well.
          </p>
          <button
            onClick={generate}
            className="bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Generate weekly summary
          </button>
        </div>
      )}

      {/* Loading / streaming */}
      {(loading || summary) && (
        <div className="bg-bg-card border border-bg-border rounded-xl p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-bg-border">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              loading ? 'bg-accent-muted animate-pulse' : 'bg-accent-muted'
            }`}>
              🤖
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Your AI Coach</p>
              <p className="text-xs text-text-muted">
                {loading ? 'Analysing your last 7 days…' : done ? 'Summary complete' : ''}
              </p>
            </div>
            {loading && (
              <div className="ml-auto w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            )}
            {done && (
              <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Done
              </span>
            )}
          </div>

          {/* Summary text */}
          <div className="prose-ai text-text-secondary text-sm">
            {renderSummary(summary)}
            {loading && (
              <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 animate-pulse" />
            )}
          </div>

          {/* Regenerate */}
          {done && (
            <div className="mt-6 pt-4 border-t border-bg-border">
              <button
                onClick={generate}
                className="text-accent hover:text-accent-hover text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Regenerate
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          <p className="font-medium">Failed to generate summary</p>
          <p className="text-red-400/70 mt-1">{error}</p>
          <button onClick={generate} className="text-accent text-xs mt-3 hover:underline">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
