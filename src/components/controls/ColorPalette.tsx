'use client';

import { useRef } from 'react';
import { useChartStore } from '@/hooks/useChartState';
import { hexToRgb } from '@/lib/utils/colorUtils';

export default function ColorPalette() {
  const { chartData, updatePaletteColor } = useChartStore();
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  if (!chartData) return null;

  return (
    <div>
      <h3 className="text-xl mb-3" style={{ fontFamily: 'var(--font-sketch)', color: 'var(--color-ink)' }}>
        색상 팔레트
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {chartData.palette.map(color => (
          <div
            key={color.index}
            className="flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all duration-150 hover:scale-105"
            style={{
              background: 'var(--color-cream)',
              border: '1.5px solid var(--color-warm-border)',
            }}
            onClick={() => inputRefs.current[color.index]?.click()}
            title="클릭해서 색상 변경"
          >
            <div
              className="w-8 h-8 rounded-lg flex-shrink-0 border"
              style={{ background: color.hex, borderColor: 'rgba(61,43,31,0.15)' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>
                {color.symbol} {color.label}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
                {color.hex.toUpperCase()}
              </p>
            </div>
            <input
              type="color"
              value={color.hex}
              className="sr-only"
              ref={el => { inputRefs.current[color.index] = el; }}
              onChange={e => {
                const hex = e.target.value;
                updatePaletteColor(color.index, { hex, rgb: hexToRgb(hex) });
              }}
            />
          </div>
        ))}
      </div>
      <p className="text-xs mt-2" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
        색상 칸을 클릭하면 직접 수정할 수 있어요
      </p>
    </div>
  );
}
