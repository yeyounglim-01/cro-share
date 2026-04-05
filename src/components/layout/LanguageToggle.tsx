'use client';

import { useKnitChartStore } from '@/hooks/useKnitChartState';

export default function LanguageToggle() {
  const { language, setLanguage } = useKnitChartStore();

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl"
      style={{ background: 'var(--color-warm-gray)', border: '1px solid var(--color-warm-border)' }}>
      {(['ko', 'en'] as const).map(lang => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className="px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200"
          style={{
            background: language === lang ? 'var(--color-rose)' : 'transparent',
            color: language === lang ? 'white' : 'var(--color-ink-light)',
            fontFamily: 'var(--font-body)',
            border: 'none',
            cursor: 'pointer',
          }}>
          {lang === 'ko' ? '한국어' : 'EN'}
        </button>
      ))}
    </div>
  );
}
