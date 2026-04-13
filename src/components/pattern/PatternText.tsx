'use client';

import { useMemo, useState } from 'react';
import { useKnitChartStore } from '@/hooks/useKnitChartState';
import { generatePatternRows, formatPatternRow } from '@/lib/knitting/patternGenerator';

export default function PatternText() {
  const { chart, language } = useKnitChartStore();
  const [copied, setCopied] = useState(false);

  const rows = useMemo(() => {
    if (!chart) return [];
    return generatePatternRows(chart);
  }, [chart]);

  const handleCopy = async () => {
    if (!chart) return;
    const text = rows.map(r => formatPatternRow(r, language, chart.yarnPalette)).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!chart || rows.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>
          {language === 'ko' ? '텍스트 패턴' : 'Pattern Instructions'}
        </h3>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
          style={{
            background: copied ? 'var(--color-sage)' : 'var(--color-warm-gray)',
            color: copied ? 'white' : 'var(--color-ink-mid)',
            border: '1.5px solid var(--color-warm-border)',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}>
          {copied ? (language === 'ko' ? '복사됨!' : 'Copied!') : (language === 'ko' ? '전체 복사' : 'Copy All')}
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ border: '1.5px solid var(--color-warm-border)', maxHeight: 320, overflowY: 'auto' }}>
        {rows.map(row => {
          const text = formatPatternRow(row, language, chart.yarnPalette);
          return (
            <div key={row.rowNum}
              className="px-4 py-2 text-sm border-b transition-colors hover:opacity-80"
              style={{
                background: row.isRS ? 'var(--color-paper)' : 'var(--color-warm-gray)',
                borderColor: 'var(--color-warm-border)',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-ink)',
              }}>
              {text}
            </div>
          );
        })}
      </div>

      <p className="text-xs mt-2" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
        {language === 'ko'
          ? '흰 배경 = 겉면(RS), 회색 배경 = 안면(WS)'
          : 'White = Right Side (RS), Gray = Wrong Side (WS)'}
      </p>
    </div>
  );
}
