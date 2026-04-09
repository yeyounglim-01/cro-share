'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import PatternCard from '@/components/gallery/PatternCard';
import PatternModal from '@/components/gallery/PatternModal';
import CrochetSection from '@/components/crochet/CrochetSection';
import { loadGallery, toggleLike, type GalleryItem } from '@/lib/gallery/store';

const DIFFICULTY_TABS = ['전체', '초급', '중급', '고급'];
const PATTERN_TYPES = ['체크', '레이스', '케이블', '컬러워크', '노르딕', '모티프'];

// 글자별 애니메이션 설정
const CHAR_ANIM = [
  { tx: '-120px', ty: '-40px', rot: '-25deg', delay: '0s' },
  { tx: '-60px', ty: '-80px', rot: '15deg', delay: '0.05s' },
  { tx: '-20px', ty: '60px', rot: '-10deg', delay: '0.1s' },
  { tx: '10px', ty: '-30px', rot: '5deg', delay: '0.12s' },
  { tx: '50px', ty: '-70px', rot: '-20deg', delay: '0.18s' },
  { tx: '80px', ty: '50px', rot: '12deg', delay: '0.22s' },
  { tx: '120px', ty: '-20px', rot: '-8deg', delay: '0.28s' },
  { tx: '80px', ty: '60px', rot: '18deg', delay: '0.32s' },
  { tx: '40px', ty: '-50px', rot: '-15deg', delay: '0.36s' },
];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('전체');
  const [selectedType, setSelectedType] = useState('체크');
  const [search, setSearch] = useState('');
  const [modalItem, setModalItem] = useState<GalleryItem | null>(null);
  const [heroVisible, setHeroVisible] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setItems(loadGallery()); }, []);

  // Hero 섹션 가시성 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const handleLike = useCallback((id: string) => {
    const updated = toggleLike(id);
    setItems(prev => prev.map(item => {
      const found = updated.find(u => u.id === id);
      if (item.id === id && found) return found;
      if (item.id === id) {
        return { ...item, likedByMe: !item.likedByMe, likes: item.likedByMe ? item.likes - 1 : item.likes + 1 };
      }
      return item;
    }));
  }, []);

  const filtered = items.filter(item => {
    const matchDiff = selectedDifficulty === '전체' || item.tags.includes(selectedDifficulty);
    const matchType = selectedType === '전체' || item.tags.includes(selectedType);
    const matchSearch = !search || item.title.includes(search) || item.author.includes(search) || item.tags.some(t => t.includes(search));
    return matchDiff && matchType && matchSearch;
  });

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh' }}>
      <Header />

      {/* ── Hero ── */}
      <div
        ref={heroRef}
        style={{
          background: 'linear-gradient(150deg, #FFF4EF 0%, #FDE8F2 40%, #EEE8FF 75%, #E8F2FF 100%)',
          borderBottom: '1px solid var(--color-warm-border)',
          padding: '56px 24px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 장식 이모지 */}
        {[
          { t: '8%', l: '6%', s: 44, op: 0.13, r: -12 },
          { t: '20%', l: '18%', s: 28, op: 0.09, r: 8 },
          { t: '60%', l: '3%', s: 36, op: 0.1, r: 5 },
          { t: '10%', r: '7%', s: 40, op: 0.12, r2: 10 },
          { t: '55%', r: '5%', s: 32, op: 0.1, r2: -6 },
          { t: '30%', r: '20%', s: 26, op: 0.08, r2: 14 },
        ].map((d, i) => (
          <span key={i} style={{
            position: 'absolute',
            top: d.t, left: 'l' in d ? d.l : undefined, right: 'r%' in d ? (d as {r?: string}).r : undefined,
            fontSize: d.s,
            opacity: d.op,
            transform: `rotate(${(d as {r?: number; r2?: number}).r ?? (d as {r2?: number}).r2 ?? 0}deg)`,
            pointerEvents: 'none',
            userSelect: 'none',
          }}>🧶</span>
        ))}

        {/* 뱃지 */}
        <span style={{
          display: 'inline-block',
          background: 'white',
          border: '1.5px solid var(--color-warm-border)',
          borderRadius: 20,
          padding: '4px 14px',
          fontSize: 12, fontWeight: 700,
          color: 'var(--color-rose-dark)',
          fontFamily: 'var(--font-body)',
          marginBottom: 18,
          boxShadow: '0 2px 8px rgba(201,123,107,0.1)',
        }}>
          ✦ 대바늘 · 코바늘 패턴 메이커
        </span>

        <h1 style={{
          fontSize: 'clamp(2rem, 6vw, 3.2rem)',
          fontFamily: 'var(--font-serif)',
          color: 'var(--color-ink)',
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 12,
        }}>
          {'Cro-share'.split('').map((char, i) => (
            <span
              key={i}
              className="hero-char"
              style={{
                '--tx': CHAR_ANIM[i].tx,
                '--ty': CHAR_ANIM[i].ty,
                '--rot': CHAR_ANIM[i].rot,
                animationDelay: CHAR_ANIM[i].delay,
              } as React.CSSProperties}
            >
              {char}
            </span>
          ))}
        </h1>

        <p style={{
          fontSize: 15,
          color: 'var(--color-ink-mid)',
          fontFamily: 'var(--font-body)',
          marginBottom: 28,
          maxWidth: 400,
          marginInline: 'auto',
          lineHeight: 1.6,
        }}>
          이미지로 컬러워크 도안을 만들거나<br />
          기호로 직접 뜨개 패턴을 그려보세요
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/editor" className="btn btn-primary">
            ✦ 패턴 만들기
          </Link>
          <span style={{ fontSize: 13, color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
            {items.length}개 패턴 공유 중
          </span>
        </div>
      </div>

      {/* ── 카테고리 섹션 ── */}
      <div
        className={`sticky top-16 z-40 bg-cream/95 backdrop-blur-sm border-b border-warm-border transition-all duration-300 ${
          heroVisible
            ? 'opacity-0 -translate-y-2 pointer-events-none'
            : 'opacity-100 translate-y-0'
        }`}
        style={{ borderColor: 'var(--color-warm-border)' }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 24px' }}>
          {/* 검색창 */}
          <div className="mb-6">
            <label className="input input-bordered flex items-center gap-2 text-sm" style={{ background: 'white' }}>
              <span className="text-lg">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="패턴 이름, 작가, 태그 검색..."
                className="grow outline-none"
                style={{ fontFamily: 'var(--font-body)' }}
              />
            </label>
          </div>

          {/* 패턴 유형 섹션 */}
          <div className="mb-6">
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-ink-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              패턴 유형
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {PATTERN_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`category-link ${selectedType === type ? 'active' : ''}`}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 난이도 탭 섹션 */}
          <div className="flex items-center gap-2 border-b border-warm-border pb-3" style={{ borderColor: 'var(--color-warm-border)' }}>
            {DIFFICULTY_TABS.map(level => (
              <button
                key={level}
                onClick={() => setSelectedDifficulty(level)}
                className={`difficulty-tab ${selectedDifficulty === level ? 'active' : ''}`}
              >
                {level}
              </button>
            ))}
            <span className="text-xs ml-auto" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
              {filtered.length}개
            </span>
          </div>
        </div>
      </div>

      {/* ── 메인 컨텐츠 ── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* 마소느리 그리드 */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🧶</div>
            <p style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--color-ink)', marginBottom: 8 }}>
              패턴을 찾을 수 없어요
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
              다른 검색어나 태그로 시도해보세요
            </p>
          </div>
        ) : (
          <div className="masonry-grid">
            {filtered.map(item => (
              <PatternCard key={item.id} item={item} onLike={handleLike} onOpen={setModalItem} />
            ))}
          </div>
        )}

        {/* 코바늘 샘플 섹션 */}
        <CrochetSection />

        {/* ── 패턴 공유 CTA ── */}
        <div style={{
          marginTop: 48,
          borderRadius: 28,
          padding: '44px 32px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #FFF0E8 0%, #F8E4F4 50%, #EEE8FF 100%)',
          border: '1.5px solid var(--color-warm-border)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* 배경 장식 */}
          <span style={{
            position: 'absolute', right: 24, bottom: 16,
            fontSize: 80, opacity: 0.06,
            fontFamily: 'var(--font-sketch)',
            pointerEvents: 'none', userSelect: 'none',
          }}>🧶</span>

          <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
          <h2 style={{
            fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-serif)',
            color: 'var(--color-ink)', marginBottom: 8,
          }}>
            당신의 패턴을 공유해보세요
          </h2>
          <p style={{
            fontSize: 13, color: 'var(--color-ink-mid)',
            fontFamily: 'var(--font-body)', marginBottom: 24, lineHeight: 1.6,
          }}>
            직접 만든 도안을 갤러리에 올리고 다른 뜨개인들과 함께해요
          </p>
          <Link href="/editor" className="btn btn-primary">
            패턴 만들기 →
          </Link>
        </div>
      </div>

      {/* ── 푸터 ── */}
      <footer style={{
        borderTop: '1px solid var(--color-warm-border)',
        padding: '20px 24px',
        textAlign: 'center',
        fontFamily: 'var(--font-body)',
      }}>
        <p style={{ fontSize: 13, color: 'var(--color-ink-light)' }}>
          Cro-share 🧶 대바늘 · 코바늘 패턴 메이커 · 무료 서비스
        </p>
      </footer>

      {/* 모달 */}
      {modalItem && (
        <PatternModal item={modalItem} onClose={() => setModalItem(null)} />
      )}
    </div>
  );
}
