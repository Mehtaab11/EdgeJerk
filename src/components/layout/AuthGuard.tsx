'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/**
 * Routes that don't require authentication.
 */
const PUBLIC_ROUTES = ['/login', '/onboarding'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, checkSession } = useAuthStore();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Run the auth check once on mount
  useEffect(() => {
    checkSession().then(() => setInitialCheckDone(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle redirects after initial check completes
  useEffect(() => {
    if (!initialCheckDone) return;

    if (!isAuthenticated && !isPublicRoute(pathname)) {
      router.replace('/login');
    } else if (isAuthenticated && pathname === '/login') {
      router.replace('/');
    }
  }, [initialCheckDone, isAuthenticated, pathname, router]);

  // Still doing the initial auth check — show loading (but let public routes render)
  if (!initialCheckDone) {
    if (isPublicRoute(pathname)) {
      return <>{children}</>;
    }
    return (
      <div className="min-h-screen bg-[#f0f3fa] dark:bg-[#070a14] flex items-center justify-center">
        <div className="text-slate-400 font-mono text-xs animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  // After initial check: unauthenticated on protected route — don't render children
  if (!isAuthenticated && !isPublicRoute(pathname)) {
    return (
      <div className="min-h-screen bg-[#f0f3fa] dark:bg-[#070a14] flex items-center justify-center">
        <div className="text-slate-400 font-mono text-xs animate-pulse">
          Redirecting...
        </div>
      </div>
    );
  }

  // All good — render children
  return <>{children}</>;
}
