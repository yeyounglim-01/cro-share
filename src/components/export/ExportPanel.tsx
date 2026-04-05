'use client';

import { useState } from 'react';
import { useKnitChartStore } from '@/hooks/useKnitChartState';
import { formatFullPattern } from '@/lib/knitting/patternGenerator';

export default function ExportPanel() {
  const { chart, language } = useKnitChartStore();
  const [filename, setFilename] = useState('my-knit-pattern');
  const [isExporting, setIsExporting] = useState(false);

  if (!chart) return null;

  const handleTxt = () => {
    const text = formatFullPattern(chart, language);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePng = async () => {
    setIsExporting(true);
    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) return;
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${filename}.png`; a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } finally {
      setIsExporting(false);
    }
  };

  const cardStyle = {
    background: 'var(--color-sage-light)',
    border: '1.5px solid var(--color-sage)',
    borderRadius: '1rem',
    padding: '1rem',
  };

  return (
    <div style={cardStyle} className="space-y-3">
      <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}>
        {language === 'ko' ? '저장하기' : 'Export'}
      </h3>

      <div>
        <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-ink-mid)', fontFamily: 'var(--font-body)' }}>
          {language === 'ko' ? '파일명' : 'Filename'}
        </label>
        <input value={filename} onChange={e => setFilename(e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: 'white', border: '1.5px solid var(--color-warm-border)', color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }} />
      </div>

      <div className="flex gap-2">
        <button onClick={handlePng} disabled={isExporting}
          className="flex-1 py-2.5 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: 'var(--color-rose)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 3px 12px rgba(201,123,107,0.35)' }}>
          📥 PNG
        </button>
        <button onClick={handleTxt}
          className="flex-1 py-2.5 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5"
          style={{ background: 'white', color: 'var(--color-ink-mid)', border: '1.5px solid var(--color-warm-border)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          📄 {language === 'ko' ? '텍스트' : 'TXT'}
        </button>
      </div>
    </div>
  );
}
