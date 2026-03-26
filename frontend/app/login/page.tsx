'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI, setToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await authAPI.login(email, password);
      setToken(token);
      localStorage.setItem('coachdash_user', JSON.stringify(user));
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    setError(null);
    try {
      const { token, user } = await authAPI.login('demo@coachdash.app', 'Demo1234');
      setToken(token);
      localStorage.setItem('coachdash_user', JSON.stringify(user));
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <span className="font-semibold text-text-primary text-lg tracking-tight">CoachDash</span>
        </div>

        <div className="bg-bg-card border border-bg-border rounded-2xl p-7">
          <h1 className="text-xl font-semibold text-text-primary mb-1">Welcome back</h1>
          <p className="text-text-secondary text-sm mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-bg-elevated border border-bg-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-bg-elevated border border-bg-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-bg-border" />
            </div>
            <div className="relative flex justify-center text-xs text-text-muted">
              <span className="bg-bg-card px-3">or</span>
            </div>
          </div>

          <button
            onClick={handleDemo}
            disabled={demoLoading}
            className="w-full bg-bg-elevated hover:bg-bg-border disabled:opacity-50 disabled:cursor-not-allowed text-text-primary font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 border border-bg-border"
          >
            {demoLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
                Loading demo...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Try Demo
              </>
            )}
          </button>
        </div>

        <p className="text-center text-text-muted text-sm mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-accent hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}