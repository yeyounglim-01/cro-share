'use client';

import { useRef, useEffect, useState } from 'react';
import { drawCrochetClover } from '@/lib/crochet/drawCrochetClover';

const TEXT_PATTERN = `🍀 네잎클로버 모티프

패턴: mr, (ch3, dc5 bo, ch3, sl st) × 4

사용 기법
  mr     – 매직원형코 (Magic Ring)
  ch     – 사슬코 (Chain)
  dc     – 한길긴코 (Double Crochet)
  bo     – 반지 안으로 (into Ring)
  sl st  – 빼뜨기 (Slip Stitch)

뜨는 순서
① 매직원형코를 만든다.
② *(사슬 3코, 한길긴코 5코 [반지 안],
     사슬 3코, 빼뜨기) × 4회 반복
③ 반지를 조여 실 끝을 정리한다.

크기: 약 4~5cm
재료: 코바늘 2/0호, 면사 약 2g`;

export default function CrochetSection() {
  const thumbRef = useRef<HTMLCanvasElement>(null);
  const fullRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (thumbRef.current) drawCrochetClover(thumbRef.current);
  }, []);

  useEffect(() => {
    if (open && fullRef.current) drawCrochetClover(fullRef.current);
  }, [open]);

  return (
    <>
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>
            코바늘 도안 샘플
          </h2>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold"
            style={{ background: 'var(--color-sage)', color: 'white', fontFamily: 'var(--font-body)' }}>
            Beta
          </span>
        </div>

        <button
          onClick={() => setOpen(true)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="text-left rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            background: 'var(--color-paper)',
            border: '1.5px solid var(--color-warm-border)',
            boxShadow: hovered ? '0 12px 40px rgba(92,51,23,0.15)' : '0 3px 12px rgba(92,51,23,0.06)',
            transform: hovered ? 'translateY(-4px)' : 'none',
            cursor: 'pointer',
            display: 'inline-block',
            maxWidth: 220,
          }}>
          {/* 썸네일 캔버스 (600×600 → CSS 200×200으로 축소) */}
          <div style={{ position: 'relative', width: 200, height: 200, overflow: 'hidden' }}>
            <canvas ref={thumbRef}
              style={{ display: 'block', width: 200, height: 200, imageRendering: 'auto' }} />
            {/* hover overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(43,139,212,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.2s',
            }}>
              <span className="text-white text-sm font-bold px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(43,139,212,0.75)', fontFamily: 'var(--font-body)' }}>
                도안 보기
              </span>
            </div>
            {/* mode badge */}
            <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(92,184,92,0.9)', color: 'white', fontFamily: 'var(--font-body)' }}>
              코바늘
            </span>
          </div>

          <div className="p-3">
            <p className="font-bold text-sm"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>
              네잎클로버 모티프
            </p>
            <p className="text-xs mt-0.5"
              style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
              (ch3, dc5 bo, ch3, sl st) × 4
            </p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {['코바늘', '모티프', '초급'].map(t => (
                <span key={t} className="text-xs px-1.5 py-0.5 rounded-md"
                  style={{ background: 'var(--color-blush)', color: 'var(--color-rose-dark)', fontFamily: 'var(--font-body)' }}>
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </button>
      </div>

      {/* ── 모달 ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(60,30,10,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}>
          <div className="w-full max-w-3xl rounded-3xl overflow-hidden"
            style={{
              background: 'var(--color-paper)',
              boxShadow: '0 20px 60px rgba(60,30,10,0.3)',
              maxHeight: '90vh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}>

            {/* 헤더 */}
            <div className="flex items-center justify-between p-5 pb-0">
              <div>
                <h2 className="text-2xl font-bold"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>
                  네잎클로버 모티프 🍀
                </h2>
                <p className="text-sm mt-0.5"
                  style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
                  mr, (ch3, dc5 bo, ch3, sl st) × 4
                </p>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg transition-all hover:rotate-90"
                style={{ background: 'var(--color-warm-gray)', border: 'none', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {/* 본문: 도안 + 텍스트 패턴 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
              {/* 도안 캔버스 */}
              <div>
                <p className="text-xs font-bold mb-2"
                  style={{ color: 'var(--color-ink-mid)', fontFamily: 'var(--font-body)' }}>
                  코바늘 기호 도안
                </p>
                <div className="rounded-2xl overflow-hidden"
                  style={{ border: '1.5px solid var(--color-warm-border)', background: '#fff' }}>
                  <canvas ref={fullRef}
                    style={{ display: 'block', width: '100%', height: 'auto' }} />
                </div>
              </div>

              {/* 텍스트 패턴 */}
              <div>
                <p className="text-xs font-bold mb-2"
                  style={{ color: 'var(--color-ink-mid)', fontFamily: 'var(--font-body)' }}>
                  텍스트 도안
                </p>
                <div className="rounded-2xl p-4"
                  style={{
                    background: 'var(--color-warm-gray)',
                    border: '1.5px solid var(--color-warm-border)',
                    minHeight: 240,
                  }}>
                  <pre className="text-sm whitespace-pre-wrap leading-relaxed"
                    style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>
                    {TEXT_PATTERN}
                  </pre>
                </div>

                {/* 범례 */}
                <div className="mt-3 flex flex-wrap gap-3">
                  {[
                    { color: '#5CB85C', label: '매직원형코' },
                    { color: '#2B8BD4', label: '사슬·한길긴코' },
                    { color: '#C040C8', label: '시작 사슬' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                      <span className="text-xs" style={{ color: 'var(--color-ink-mid)', fontFamily: 'var(--font-body)' }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
