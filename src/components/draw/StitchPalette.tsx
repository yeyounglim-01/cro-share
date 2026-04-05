'use client';

import { useState, useEffect, useRef } from 'react';
import { STITCHES, STITCH_CATEGORIES } from '@/lib/knitting/stitchLibrary';
import { drawStitchSymbol } from '@/lib/knitting/drawStitchSymbol';
import { useKnitChartStore } from '@/hooks/useKnitChartState';
import type { StitchCategory } from '@/types/knit';

/** 도안과 동일한 방식으로 기호를 미니 캔버스에 렌더링 */
function StitchIcon({ id, bgColor, fgColor }: { id: string; bgColor: string; fgColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = 22, h = 26;
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    drawStitchSymbol(ctx, id, 0, 0, w, h, fgColor);
  }, [id, bgColor, fgColor]);
  return <canvas ref={canvasRef} style={{ width: 22, height: 26, display: 'block', imageRendering: 'pixelated' }} />;
}

interface StitchPaletteProps {
  horizontal?: boolean;
}

export default function StitchPalette({ horizontal = false }: StitchPaletteProps) {
  const { selectedStitchId, setSelectedStitchId, language } = useKnitChartStore();
  const [activeCategory, setActiveCategory] = useState<StitchCategory>('basic');

  const filtered = STITCHES.filter(s => s.category === activeCategory);
  const selectedStitch = STITCHES.find(x => x.id === selectedStitchId);

  /* ── 가로 스트립 모드 ── */
  if (horizontal) {
    return (
      <div className="flex items-center gap-0 overflow-x-auto" style={{ minHeight: 52 }}>
        {/* 카테고리 탭 */}
        <div className="flex items-center gap-1 px-3 flex-shrink-0"
          style={{ borderRight: '1.5px solid var(--color-warm-border)', height: 52 }}>
          {STITCH_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className="px-2 py-1 rounded-lg text-xs font-bold transition-all"
              style={{
                background: activeCategory === cat.id ? 'var(--color-rose)' : 'transparent',
                color: activeCategory === cat.id ? 'white' : 'var(--color-ink-mid)',
                border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap',
              }}>
              {language === 'ko' ? cat.labelKo : cat.labelEn}
            </button>
          ))}
        </div>

        {/* 기호 아이콘 가로 나열 */}
        <div className="flex items-center gap-1 px-3 overflow-x-auto flex-1">
          {filtered.map(stitch => {
            const isSelected = selectedStitchId === stitch.id;
            return (
              <button key={stitch.id} onClick={() => setSelectedStitchId(stitch.id)}
                title={`${language === 'ko' ? stitch.descKo : stitch.descEn} (${language === 'ko' ? stitch.abbrevKo : stitch.abbrevEn})`}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg flex-shrink-0 transition-all duration-150"
                style={{
                  background: isSelected ? 'var(--color-rose-light)' : 'transparent',
                  border: `1.5px solid ${isSelected ? 'var(--color-rose)' : 'transparent'}`,
                  cursor: 'pointer',
                }}>
                <StitchIcon id={stitch.id} bgColor={stitch.bgColor} fgColor={stitch.fgColor} />
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-ink-mid)', fontFamily: 'var(--font-body)' }}>
                  {language === 'ko' ? stitch.abbrevKo : stitch.abbrevEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* 선택된 기호 정보 */}
        {selectedStitch && (
          <div className="flex items-center gap-2 px-3 flex-shrink-0"
            style={{ borderLeft: '1.5px solid var(--color-warm-border)', height: 52 }}>
            <StitchIcon id={selectedStitch.id} bgColor={selectedStitch.bgColor} fgColor={selectedStitch.fgColor} />
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                {language === 'ko' ? selectedStitch.descKo : selectedStitch.descEn}
              </p>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
                {language === 'ko' ? selectedStitch.abbrevKo : selectedStitch.abbrevEn}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── 세로 패널 모드 (기존) ── */
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}>
        {language === 'ko' ? '기호 선택' : 'Stitch Palette'}
      </h3>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        {STITCH_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className="px-3 py-1 rounded-full text-xs font-bold transition-all"
            style={{
              background: activeCategory === cat.id ? 'var(--color-rose)' : 'var(--color-warm-gray)',
              color: activeCategory === cat.id ? 'white' : 'var(--color-ink-mid)',
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>
            {language === 'ko' ? cat.labelKo : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Stitch grid */}
      <div className="grid grid-cols-3 gap-2">
        {filtered.map(stitch => {
          const isSelected = selectedStitchId === stitch.id;
          return (
            <button key={stitch.id} onClick={() => setSelectedStitchId(stitch.id)}
              title={language === 'ko' ? stitch.descKo : stitch.descEn}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5"
              style={{
                background: isSelected ? 'var(--color-rose-light)' : 'var(--color-paper)',
                border: `2px solid ${isSelected ? 'var(--color-rose)' : 'var(--color-warm-border)'}`,
                cursor: 'pointer',
                boxShadow: isSelected ? '0 2px 8px rgba(201,123,107,0.25)' : 'none',
              }}>
              <StitchIcon id={stitch.id} bgColor={stitch.bgColor} fgColor={stitch.fgColor} />
              <span className="text-xs font-bold text-center leading-tight"
                style={{ color: 'var(--color-ink-mid)', fontFamily: 'var(--font-body)' }}>
                {language === 'ko' ? stitch.abbrevKo : stitch.abbrevEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected stitch info */}
      {selectedStitch && (
        <div className="rounded-xl p-3" style={{ background: 'var(--color-blush)', border: '1px solid var(--color-warm-border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <StitchIcon id={selectedStitch.id} bgColor={selectedStitch.bgColor} fgColor={selectedStitch.fgColor} />
            <p className="text-sm font-bold" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>
              {language === 'ko' ? selectedStitch.descKo : selectedStitch.descEn}
            </p>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-mid)', fontFamily: 'var(--font-body)' }}>
            {language === 'ko' ? `약어: ${selectedStitch.abbrevKo}` : `Abbrev: ${selectedStitch.abbrevEn}`}
          </p>
        </div>
      )}
    </div>
  );
}
