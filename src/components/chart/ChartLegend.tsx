'use client';

import type { PaletteColor } from '@/types/chart';

export default function ChartLegend({ palette }: { palette: PaletteColor[] }) {
  return (
    <div>
      <h3 className="text-xl mb-3" style={{ fontFamily: 'var(--font-sketch)', color: 'var(--color-ink)' }}>
        색상 범례
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {palette.map(color => (
          <div key={color.index} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
            style={{ background: 'var(--color-paper)', border: '1.5px solid var(--color-warm-border)' }}>
            <div className="w-6 h-6 rounded-lg border flex-shrink-0"
              style={{ background: color.hex, borderColor: 'rgba(61,43,31,0.15)' }} />
            <div className="min-w-0">
              <p className="text-sm font-bold" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>
                {color.symbol} {color.label}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
                {color.hex.toUpperCase()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
