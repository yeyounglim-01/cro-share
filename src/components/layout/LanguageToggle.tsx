'use client';

import { useKnitChartStore } from '@/hooks/useKnitChartState';

export default function LanguageToggle() {
  const { language, setLanguage } = useKnitChartStore();
  const isKo = language === 'ko';

  return (
    <button
      onClick={() => setLanguage(isKo ? 'en' : 'ko')}
      className="relative flex items-center rounded-full cursor-pointer border-none"
      style={{
        background: 'var(--color-warm-gray)',
        border: '1px solid var(--color-warm-border)',
        width: 80,
        height: 30,
        padding: 0,
      }}
    >
      {/* 슬라이딩 pill */}
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: isKo ? 2 : 42,
          width: 36,
          height: 22,
          background: 'var(--color-rose)',
          borderRadius: 999,
          transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 4px rgba(201,123,107,0.3)',
        }}
      />
      {/* 한국어 텍스트 */}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          width: '50%',
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'var(--font-body)',
          color: isKo ? 'white' : 'var(--color-ink-light)',
          transition: 'color 0.2s',
        }}
      >
        KO
      </span>
      {/* EN 텍스트 */}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          width: '50%',
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'var(--font-body)',
          color: !isKo ? 'white' : 'var(--color-ink-light)',
          transition: 'color 0.2s',
        }}
      >
        EN
      </span>
    </button>
  );
}
