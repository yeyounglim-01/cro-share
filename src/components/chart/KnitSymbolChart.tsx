'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { KnitChartData } from '@/types/knit';
import { getStitch } from '@/lib/knitting/stitchLibrary';
import { drawStitchSymbol } from '@/lib/knitting/drawStitchSymbol';
import { useDrawTool } from '@/hooks/useDrawTool';
import { useKnitChartStore } from '@/hooks/useKnitChartState';

const CELL_H = 22;  // 단 높이 (고정)
const LEGEND_W = 36;
const LEGEND_H = 22;

/** 배경색에 따라 기호를 그릴 대비색 계산 */
function contrastColor(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? 'rgba(60,30,10,0.7)' : 'rgba(255,255,255,0.85)';
}

interface Props {
  chartData: KnitChartData;
  editable?: boolean;
  compact?: boolean; // thumbnail mode
  gaugeStitches?: number;  // 기본 20
  gaugeRows?: number;      // 기본 28
}

export default function KnitSymbolChart({ chartData, editable = false, compact = false, gaugeStitches = 20, gaugeRows = 28 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 16, y: 16 });
  const [isPanMode, setIsPanMode] = useState(false); // Space 키 = 이동 모드
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const { startDraw, continueDraw, endDraw } = useDrawTool();
  // editable 모드(에디터)에서만 스토어를 구독해 실시간 업데이트 반영.
  // 갤러리 모달·썸네일에서는 항상 chartData prop 사용 (버그 방지)
  const storeChart = useKnitChartStore(s => editable ? s.chart : null);

  const displayChart = storeChart ?? chartData;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, cells, yarnPalette } = displayChart;
    // 게이지 반영 cellW 계산: CELL_H × (gaugeRows / gaugeStitches)
    const CELL_W = Math.round(CELL_H * (gaugeRows / gaugeStitches));
    const cw = compact ? Math.round(10 * (gaugeRows / gaugeStitches)) : CELL_W;
    const ch = compact ? 10 : CELL_H;
    const lw = compact ? 0 : LEGEND_W;
    const lh = compact ? 0 : LEGEND_H;
    const totalW = width * cw + lw;
    const totalH = height * ch + lh;

    canvas.width = totalW;
    canvas.height = totalH;

    ctx.fillStyle = '#FDFAF8';
    ctx.fillRect(0, 0, totalW, totalH);

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const cell = cells[row]?.[col];
        if (!cell) continue;
        const stitchId = cell.stitchId ?? 'k';
        const stitch = getStitch(stitchId);
        const px = lw + col * cw;
        const py = row * ch;

        // 배경 채우기
        let bg = stitch.bgColor;
        if (cell.yarnColor && stitchId !== 'ns') bg = cell.yarnColor;
        ctx.fillStyle = bg;
        ctx.fillRect(px, py, cw, ch);

        // 기호 그리기 — compact여도 yarnColor 없는 draw 패턴은 기호를 표시해야 썸네일이 보임
        const fg = cell.yarnColor ? contrastColor(cell.yarnColor) : stitch.fgColor;
        if (!compact || !cell.yarnColor) {
          drawStitchSymbol(ctx, stitchId, px, py, cw, ch, fg);
        }
      }
    }

    // 격자선
    if (!compact) {
      ctx.strokeStyle = 'rgba(92,51,23,0.1)';
      ctx.lineWidth = 0.5;
      for (let c = 0; c <= width; c++) {
        ctx.beginPath(); ctx.moveTo(lw + c * cw, 0); ctx.lineTo(lw + c * cw, height * ch); ctx.stroke();
      }
      for (let r = 0; r <= height; r++) {
        ctx.beginPath(); ctx.moveTo(lw, r * ch); ctx.lineTo(lw + width * cw, r * ch); ctx.stroke();
      }
      // 10칸 굵은 선
      ctx.strokeStyle = 'rgba(92,51,23,0.25)';
      ctx.lineWidth = 1;
      for (let c = 0; c <= width; c += 10) {
        ctx.beginPath(); ctx.moveTo(lw + c * cw, 0); ctx.lineTo(lw + c * cw, height * ch); ctx.stroke();
      }
      for (let r = 0; r <= height; r += 10) {
        ctx.beginPath(); ctx.moveTo(lw, r * ch); ctx.lineTo(lw + width * cw, r * ch); ctx.stroke();
      }
      // 단 번호
      ctx.font = '10px Nunito, sans-serif';
      ctx.fillStyle = '#8B5E3C';
      ctx.textAlign = 'right';
      for (let r = 0; r < height; r++) {
        const rowNum = height - r;
        if (rowNum === 1 || rowNum % 5 === 0) {
          ctx.fillText(String(rowNum), lw - 3, r * ch + ch * 0.68);
        }
      }
      // 코 번호
      ctx.textAlign = 'center';
      ctx.font = '9px Nunito, sans-serif';
      for (let c = 0; c < width; c++) {
        if ((c + 1) % 5 === 0 || c === 0) {
          ctx.fillText(String(c + 1), lw + c * cw + cw / 2, height * ch + 14);
        }
      }
      // 실 색상 범례
      if (yarnPalette.length > 0) {
        let lx = lw;
        for (const yarn of yarnPalette) {
          ctx.fillStyle = yarn.color;
          ctx.fillRect(lx, height * ch + 3, 10, 10);
          ctx.fillStyle = '#5C3317';
          ctx.font = '9px Nunito, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(yarn.label, lx + 13, height * ch + 12);
          lx += 55;
        }
      }
    } else {
      // compact: 얇은 격자선만
      ctx.strokeStyle = 'rgba(92,51,23,0.08)';
      ctx.lineWidth = 0.3;
      for (let c = 0; c <= width; c++) {
        ctx.beginPath(); ctx.moveTo(c * cw, 0); ctx.lineTo(c * cw, height * ch); ctx.stroke();
      }
      for (let r = 0; r <= height; r++) {
        ctx.beginPath(); ctx.moveTo(0, r * ch); ctx.lineTo(width * cw, r * ch); ctx.stroke();
      }
    }
  }, [displayChart, compact, gaugeStitches, gaugeRows]);

  useEffect(() => { draw(); }, [draw]);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(Math.max(z * (e.deltaY > 0 ? 0.9 : 1.1), 0.3), 8));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || compact) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel, compact]);

  // Space 키 누르는 동안 이동 모드 — html overflow:hidden으로 페이지 스크롤 완전 차단
  useEffect(() => {
    if (compact) return;
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        document.documentElement.style.overflow = 'hidden';
        setIsPanMode(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        document.documentElement.style.overflow = '';
        setIsPanMode(false);
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [compact]);

  const getCellFromEvent = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const CELL_W = Math.round(CELL_H * (gaugeRows / gaugeStitches));  // 게이지 반영
    const col = Math.floor(((e.clientX - rect.left) * scaleX - LEGEND_W) / CELL_W);
    const row = Math.floor(((e.clientY - rect.top) * scaleY) / CELL_H);
    if (col < 0 || col >= displayChart.width || row < 0 || row >= displayChart.height) return null;
    return { row, col };
  }, [displayChart, gaugeStitches, gaugeRows]);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // 이동 모드: Space 누른 채 드래그, 또는 비편집 모드
    if (!editable || isPanMode) {
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
      return;
    }
    const cell = getCellFromEvent(e);
    if (cell) startDraw(cell.row, cell.col, e.button === 2);
  }, [editable, isPanMode, offset, getCellFromEvent, startDraw]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if ((!editable || isPanMode) && isDragging.current) {
      setOffset({ x: dragStart.current.ox + e.clientX - dragStart.current.x, y: dragStart.current.oy + e.clientY - dragStart.current.y });
      return;
    }
    if (editable && !isPanMode) {
      const cell = getCellFromEvent(e);
      if (cell) continueDraw(cell.row, cell.col, e.buttons === 2);
    }
  }, [editable, isPanMode, getCellFromEvent, continueDraw]);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    if (editable) endDraw();
  }, [editable, endDraw]);

  if (compact) {
    return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', imageRendering: 'pixelated' }} />;
  }

  return (
    <div>
      <div className="flex gap-2 mb-3 items-center flex-wrap">
        {[{ label: '+', fn: () => setZoom(z => Math.min(z * 1.25, 8)) },
          { label: '−', fn: () => setZoom(z => Math.max(z * 0.8, 0.3)) },
          { label: '↺', fn: () => { setZoom(1); setOffset({ x: 16, y: 16 }); } }
        ].map(({ label, fn }) => (
          <button key={label} onClick={fn}
            className="w-8 h-8 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--color-paper)', border: '1.5px solid var(--color-warm-border)', color: 'var(--color-ink-mid)', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
        <span className="text-xs" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
          {Math.round(zoom * 100)}% · {displayChart.width}코 × {displayChart.height}단
        </span>
      </div>

      <div ref={containerRef}
        className="overflow-hidden rounded-2xl"
        style={{
          height: 520, cursor: editable ? (isPanMode ? 'grab' : 'crosshair') : 'grab',
          background: 'var(--color-warm-gray)',
          border: '1.5px solid var(--color-warm-border)',
          boxShadow: '0 4px 24px rgba(92,51,23,0.08)',
        }}
        onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
        <div style={{ transform: `translate(${offset.x}px,${offset.y}px) scale(${zoom})`, transformOrigin: 'top left', display: 'inline-block' }}>
          <canvas ref={canvasRef} style={{ display: 'block', imageRendering: 'pixelated' }}
            onMouseDown={onMouseDown} onMouseMove={onMouseMove}
            onContextMenu={e => e.preventDefault()} />
        </div>
      </div>

      <p className="text-xs mt-2 text-center" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
        {editable
          ? 'Space+드래그: 이동 · ✏️ 클릭·드래그: 그리기 · 🪣 클릭: 채우기 · 우클릭: 지우기'
          : '휠: 확대/축소 · 드래그: 이동'}
      </p>
    </div>
  );
}
