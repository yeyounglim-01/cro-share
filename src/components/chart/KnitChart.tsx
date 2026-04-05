'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ChartData, ChartConfig } from '@/types/chart';

interface Props {
  chartData: ChartData;
  config: ChartConfig;
}

export default function KnitChart({ chartData, config }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const cellSize = config.cellSize;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, cells, palette } = chartData;
    const legendW = config.showRowNumbers ? 36 : 0;
    const totalW = width * cellSize + legendW;
    const totalH = height * cellSize;

    canvas.width = totalW;
    canvas.height = totalH;

    // Background
    ctx.fillStyle = '#FDFAF5';
    ctx.fillRect(0, 0, totalW, totalH);

    // Cells
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const ci = cells[row][col];
        ctx.fillStyle = palette[ci]?.hex ?? '#ccc';
        ctx.fillRect(legendW + col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }

    // Grid lines
    if (config.showGrid) {
      ctx.strokeStyle = 'rgba(61,43,31,0.12)';
      ctx.lineWidth = 0.5;
      for (let c = 0; c <= width; c++) {
        ctx.beginPath();
        ctx.moveTo(legendW + c * cellSize, 0);
        ctx.lineTo(legendW + c * cellSize, totalH);
        ctx.stroke();
      }
      for (let r = 0; r <= height; r++) {
        ctx.beginPath();
        ctx.moveTo(legendW, r * cellSize);
        ctx.lineTo(legendW + width * cellSize, r * cellSize);
        ctx.stroke();
      }
    }

    // Major grid lines every 10
    ctx.strokeStyle = 'rgba(61,43,31,0.25)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= width; c += 10) {
      ctx.beginPath();
      ctx.moveTo(legendW + c * cellSize, 0);
      ctx.lineTo(legendW + c * cellSize, totalH);
      ctx.stroke();
    }
    for (let r = 0; r <= height; r += 10) {
      ctx.beginPath();
      ctx.moveTo(legendW, r * cellSize);
      ctx.lineTo(legendW + width * cellSize, r * cellSize);
      ctx.stroke();
    }

    // Row numbers
    if (config.showRowNumbers) {
      const fontSize = Math.max(8, Math.min(11, cellSize * 0.8));
      ctx.font = `${fontSize}px Nunito, sans-serif`;
      ctx.fillStyle = '#7A6055';
      ctx.textAlign = 'right';
      for (let r = 0; r < height; r++) {
        if (r === 0 || (r + 1) % 5 === 0) {
          ctx.fillText(String(r + 1), legendW - 3, r * cellSize + cellSize * 0.72);
        }
      }
    }
  }, [chartData, config, cellSize]);

  useEffect(() => { draw(); }, [draw]);

  // Wheel zoom
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(Math.max(z * delta, 0.3), 6));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  };
  const onMouseUp = () => { isDragging.current = false; };

  return (
    <div className="relative w-full">
      <div className="flex gap-2 mb-3 items-center">
        <button onClick={() => setZoom(z => Math.min(z * 1.2, 6))}
          className="px-3 py-1.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
          style={{ background: 'var(--color-paper)', border: '1.5px solid var(--color-warm-border)', color: 'var(--color-ink)', cursor: 'pointer' }}>
          +
        </button>
        <button onClick={() => setZoom(z => Math.max(z * 0.8, 0.3))}
          className="px-3 py-1.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
          style={{ background: 'var(--color-paper)', border: '1.5px solid var(--color-warm-border)', color: 'var(--color-ink)', cursor: 'pointer' }}>
          -
        </button>
        <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
          className="px-3 py-1.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
          style={{ background: 'var(--color-paper)', border: '1.5px solid var(--color-warm-border)', color: 'var(--color-ink-light)', cursor: 'pointer' }}>
          초기화
        </button>
        <span className="text-xs ml-1" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <div
        ref={containerRef}
        className="overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing"
        style={{
          height: 480,
          background: 'var(--color-cream)',
          border: '1.5px solid var(--color-warm-border)',
          boxShadow: '0 4px 24px rgba(61,43,31,0.08)',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: 'top left',
          display: 'inline-block',
          padding: '16px',
        }}>
          <canvas ref={canvasRef} style={{ display: 'block', imageRendering: 'pixelated' }} />
        </div>
      </div>

      <p className="text-xs mt-2 text-center" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
        마우스 휠로 확대/축소 · 드래그로 이동
      </p>
    </div>
  );
}
