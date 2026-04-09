'use client';

import { useState } from 'react';
import type { GalleryItem } from '@/lib/gallery/store';
import KnitSymbolChart from '@/components/chart/KnitSymbolChart';

interface Props {
  item: GalleryItem;
  onLike: (id: string) => void;
  onOpen: (item: GalleryItem) => void;
}

export default function PatternCard({ item, onLike, onOpen }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="card card-compact bg-base-100 shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(item)}
    >
      {/* ── 썸네일 영역 ── */}
      <div className="relative aspect-square overflow-hidden" style={{ background: 'var(--color-warm-gray)' }}>
        <KnitSymbolChart chartData={item.chart} compact />

        {/* 어두운 오버레이 */}
        <div
          className={`absolute inset-0 bg-black/20 transition-opacity duration-200 pointer-events-none ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* 좋아요 버튼 */}
        <button
          onClick={e => { e.stopPropagation(); onLike(item.id); }}
          className={`btn btn-ghost btn-sm gap-1 absolute top-2 right-2 transition-opacity duration-150 ${
            hovered || item.likedByMe ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span>{item.likedByMe ? '❤️' : '🤍'}</span>
          <span className="text-xs font-bold" style={{ color: item.likedByMe ? 'var(--color-rose)' : '#999' }}>
            {item.likes}
          </span>
        </button>

        {/* 모드 배지 */}
        <span
          className="badge badge-sm absolute bottom-2 left-2"
          style={{
            background: item.chart.mode === 'image' ? 'rgba(201,123,107,0.9)' : 'rgba(150,110,190,0.9)',
            color: 'white',
            fontSize: '11px',
            fontWeight: '700',
            fontFamily: 'var(--font-body)',
            borderColor: 'transparent',
          }}
        >
          {item.chart.mode === 'image' ? '컬러워크' : '도트'}
        </span>
      </div>

      {/* ── 텍스트 영역 ── */}
      <div className="card-body p-3">
        <p
          className="font-bold text-sm font-serif truncate"
          style={{ color: 'var(--color-ink)', marginBottom: '3px' }}
        >
          {item.title}
        </p>
        <p className="text-xs" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
          @{item.author}
        </p>
      </div>
    </div>
  );
}
