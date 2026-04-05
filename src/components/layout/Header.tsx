'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageToggle from './LanguageToggle';

export default function Header() {
  const path = usePathname();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(250,246,241,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-warm-border)',
      boxShadow: '0 1px 12px rgba(92,51,23,0.06)',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* 로고 */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #C97B6B 0%, #D4A896 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
            boxShadow: '0 3px 10px rgba(201,123,107,0.3)',
          }}>
            🧶
          </div>
          <span style={{
            fontSize: 20, fontWeight: 700,
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-ink)',
          }}>
            Cro-share
          </span>
        </Link>

        {/* 네비게이션 */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[
            { href: '/', label: '갤러리' },
            { href: '/editor', label: '패턴 만들기' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{
              padding: '7px 16px',
              borderRadius: 100,
              fontSize: 13, fontWeight: 700,
              fontFamily: 'var(--font-body)',
              textDecoration: 'none',
              transition: 'all 0.15s',
              background: path === href ? 'var(--color-rose-light)' : 'transparent',
              color: path === href ? 'var(--color-rose-dark)' : 'var(--color-ink-mid)',
            }}>
              {label}
            </Link>
          ))}

          <LanguageToggle />

          <Link href="/editor" style={{
            marginLeft: 4,
            padding: '8px 20px',
            borderRadius: 100,
            fontSize: 13, fontWeight: 700,
            fontFamily: 'var(--font-body)',
            textDecoration: 'none',
            background: 'var(--color-rose)',
            color: 'white',
            boxShadow: '0 3px 12px rgba(201,123,107,0.35)',
          }}>
            시작하기
          </Link>
        </nav>
      </div>
    </header>
  );
}
