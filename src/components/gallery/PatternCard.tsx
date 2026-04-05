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
      className="pin-card"
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        background: '#FFF',
        boxShadow: '0 2px 10px rgba(92,51,23,0.08)',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(item)}
    >
      {/* ── 썸네일 영역 ── */}
      <div style={{ position: 'relative', background: 'var(--color-warm-gray)' }}>
        <KnitSymbolChart chartData={item.chart} compact />

        {/* 어두운 오버레이 */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(60,30,10,0.18)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s',
          pointerEvents: 'none',
        }} />

        {/* 좋아요 버튼 (hover 또는 이미 liked) */}
        <button
          onClick={e => { e.stopPropagation(); onLike(item.id); }}
          style={{
            position: 'absolute', top: 10, right: 10,
            background: 'white',
            border: 'none',
            borderRadius: 20,
            padding: '5px 10px',
            display: 'flex', alignItems: 'center', gap: 4,
            cursor: 'pointer',
            opacity: hovered || item.likedByMe ? 1 : 0,
            transition: 'opacity 0.15s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            fontSize: 13,
          }}>
          <span>{item.likedByMe ? '❤️' : '🤍'}</span>
          <span style={{
            fontWeight: 700, fontSize: 12,
            color: item.likedByMe ? 'var(--color-rose)' : '#999',
            fontFamily: 'var(--font-body)',
          }}>
            {item.likes}
          </span>
        </button>

        {/* 모드 배지 */}
        <span style={{
          position: 'absolute', bottom: 8, left: 8,
          background: item.chart.mode === 'image'
            ? 'rgba(201,123,107,0.9)' : 'rgba(150,110,190,0.9)',
          color: 'white',
          padding: '2px 8px',
          borderRadius: 10,
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'var(--font-body)',
        }}>
          {item.chart.mode === 'image' ? '컬러워크' : '도트'}
        </span>
      </div>

      {/* ── 텍스트 영역 ── */}
      <div style={{ padding: '10px 14px 13px' }}>
        <p style={{
          fontWeight: 700, fontSize: 14,
          color: 'var(--color-ink)',
          fontFamily: 'var(--font-serif)',
          marginBottom: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {item.title}
        </p>
        <p style={{
          fontSize: 12,
          color: 'var(--color-ink-light)',
          fontFamily: 'var(--font-body)',
        }}>
          @{item.author}
        </p>
      </div>
    </div>
  );
}
