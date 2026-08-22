'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export function NavigationHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, checkSession, logout } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const navLinks = [
    { href: '/', label: 'DASHBOARD' },
    { href: '/trades', label: 'TRADE_LOG' },
    { href: '/trades/new', label: '+ LOG TRADE' },
    { href: '/analytics', label: 'ANALYTICS' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="flex justify-between items-center w-full px-4 h-12 bg-[#0a0f1e] border-b border-[#2d3748] sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-mono text-sm font-bold text-[#dfff00] tracking-tighter">
          TRADER_LOG_V1
        </Link>
        <div className="h-4 w-px bg-[#2d3748]"></div>
        <nav className="flex items-center gap-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-[11px] font-bold tracking-wider uppercase transition-colors px-2 py-1 ${
                  isActive
                    ? 'text-[#dfff00] border-b-2 border-[#dfff00]'
                    : 'text-[#8b949e] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono text-[#8b949e]">
        <div className="flex items-center gap-2 border border-[#2d3748] px-2 py-1 bg-[#111624]">
          <span className="w-2 h-2 rounded-full bg-[#40e56c] inline-block"></span>
          <span className="text-[10px] text-[#e5e7eb] font-sans font-bold tracking-wider">
            SYS_ONLINE
          </span>
        </div>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <span className="text-[#8b949e]">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-[11px] font-sans font-bold uppercase text-[#ff6b6b] hover:text-red-400 underline"
            >
              LOGOUT
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-[11px] font-sans font-bold uppercase text-[#dfff00] hover:underline"
          >
            CONNECT
          </Link>
        )}
      </div>
    </header>
  );
}
