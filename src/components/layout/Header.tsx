'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageToggle from './LanguageToggle';
import { useKnitChartStore } from '@/hooks/useKnitChartState';

export default function Header() {
  const path = usePathname();
  const { language } = useKnitChartStore();
  const isKo = language === 'ko';

  const navItems = isKo
    ? [
        { href: '/', label: '갤러리' },
        { href: '/editor', label: '패턴 만들기' },
      ]
    : [
        { href: '/', label: 'Gallery' },
        { href: '/editor', label: 'Create Pattern' },
      ];

  const startButtonText = isKo ? '시작하기' : 'Get Started';

  return (
    <header className="navbar sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-warm-border shadow-sm" style={{ borderColor: 'var(--color-warm-border)' }}>
      <div className="navbar-start">
        {/* 로고 이미지 */}
        <Link href="/" className="flex items-center no-underline">
          <img
            src="/logo.png"
            alt="Cro-share"
            className="h-10 object-contain"
          />
        </Link>
      </div>

      <div className="navbar-center">
        {/* 네비게이션 */}
        <nav className="flex gap-6">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="no-underline text-xs font-bold transition-colors"
              style={{
                color: path === href ? 'var(--color-rose-dark)' : 'var(--color-ink-mid)',
                fontFamily: 'var(--font-body)',
                fontWeight: path === href ? 700 : 600,
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="navbar-end flex gap-2">
        <LanguageToggle />
        <Link href="/editor" className="btn btn-primary btn-sm text-xs font-bold">
          {startButtonText}
        </Link>
      </div>
    </header>
  );
}
