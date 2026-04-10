'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { GalleryItem } from '@/lib/gallery/store';
import KnitSymbolChart from '@/components/chart/KnitSymbolChart';
import { useKnitChartStore } from '@/hooks/useKnitChartState';

interface Props {
  item: GalleryItem;
  onClose: () => void;
}

export default function PatternModal({ item, onClose }: Props) {
  const router = useRouter();
  const setChart = useKnitChartStore(s => s.setChart);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const handleEdit = useCallback(() => {
    setChart(item.chart);
    onClose();
    router.push('/editor');
  }, [item.chart, setChart, onClose, router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(60,30,10,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-3xl"
        style={{
          background: 'var(--color-paper)',
          boxShadow: '0 20px 60px rgba(60,30,10,0.3)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          <div>
            <h2 className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>
              {item.title}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
              @{item.author} · {item.createdAt}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-circle btn-ghost btn-sm"
          >
            ✕
          </button>
        </div>

        {/* Chart */}
        <div className="p-5">
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--color-warm-gray)', border: '1.5px solid var(--color-warm-border)' }}>
            <KnitSymbolChart chartData={item.chart} />
          </div>
        </div>

        {/* Info */}
        <div className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '코 수', value: `${item.chart.width}코` },
              { label: '단 수', value: `${item.chart.height}단` },
              { label: '좋아요', value: `${item.likes}` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-3 rounded-2xl"
                style={{ background: 'var(--color-blush)' }}>
                <p className="text-xs" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>{label}</p>
                <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>{value}</p>
              </div>
            ))}
          </div>

          {item.description && (
            <p className="text-sm leading-relaxed"
              style={{ color: 'var(--color-ink-mid)', fontFamily: 'var(--font-body)' }}>
              {item.description}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {item.tags.map(tag => (
              <span key={tag} className="text-sm px-3 py-1 rounded-full"
                style={{ background: 'var(--color-rose-light)', color: 'var(--color-rose-dark)', fontFamily: 'var(--font-body)' }}>
                #{tag}
              </span>
            ))}
          </div>

          {/* Yarn palette */}
          {item.chart.yarnPalette.length > 0 && (
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-ink-mid)', fontFamily: 'var(--font-body)' }}>
                실 색상
              </p>
              <div className="flex flex-wrap gap-2">
                {item.chart.yarnPalette.map(y => (
                  <div key={y.id} className="flex items-center gap-1.5 px-2 py-1 rounded-xl"
                    style={{ background: 'var(--color-warm-gray)', border: '1px solid var(--color-warm-border)' }}>
                    <div className="w-4 h-4 rounded" style={{ background: y.color, border: '1px solid rgba(0,0,0,0.1)' }}/>
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>{y.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleEdit}
            className="btn btn-primary w-full text-sm font-bold"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            이 패턴으로 편집하기 →
          </button>
        </div>
      </div>
    </div>
  );
}
