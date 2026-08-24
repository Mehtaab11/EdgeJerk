'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook that protects a page from unauthenticated access.
 * Checks the session on mount and redirects to /login if not authenticated.
 * Returns { isLoading, isAuthenticated } so the page can show a loading state.
 */
export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  return { isLoading, isAuthenticated };
}
