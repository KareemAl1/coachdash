'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { useEffect } from 'react';

const AUTH_ROUTES = ['/login', '/register'];
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    const ping = () => fetch(`${API_URL}/health`).catch(() => {});
    ping();
    const interval = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}