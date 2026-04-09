'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageToggle from './LanguageToggle';

export default function Header() {
  const path = usePathname();

  return (
    <header className="navbar sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-warm-border shadow-sm" style={{ borderColor: 'var(--color-warm-border)' }}>
      <div className="navbar-start">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base shadow-md"
            style={{
              background: 'linear-gradient(135deg, #C97B6B 0%, #D4A896 100%)',
            }}
          >
            🧶
          </div>
          <span className="text-lg font-bold font-serif" style={{ color: 'var(--color-ink)' }}>
            Cro-share
          </span>
        </Link>
      </div>

      <div className="navbar-center">
        {/* 네비게이션 */}
        <nav className="flex gap-1">
          {[
            { href: '/', label: '갤러리' },
            { href: '/editor', label: '패턴 만들기' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`btn btn-ghost btn-sm no-underline text-xs font-bold ${
                path === href ? 'bg-rose-light' : ''
              }`}
              style={{
                color: path === href ? 'var(--color-rose-dark)' : 'var(--color-ink-mid)',
                fontFamily: 'var(--font-body)',
                textTransform: 'none',
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
          시작하기
        </Link>
      </div>
    </header>
  );
}
