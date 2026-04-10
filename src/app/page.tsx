'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import PatternCard from '@/components/gallery/PatternCard';
import PatternModal from '@/components/gallery/PatternModal';
import CrochetSection from '@/components/crochet/CrochetSection';
import { loadGallery, toggleLike, type GalleryItem } from '@/lib/gallery/store';
import { useKnitChartStore } from '@/hooks/useKnitChartState';

export default function GalleryPage() {
  const { language } = useKnitChartStore();
  const isKo = language === 'ko';

  const DIFFICULTY_TABS = isKo
    ? ['전체', '초급', '중급', '고급']
    : ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const PATTERN_TYPES = isKo
    ? ['체크', '레이스', '케이블', '컬러워크', '노르딕', '모티프']
    : ['Check', 'Lace', 'Cable', 'Colorwork', 'Nordic', 'Motif'];
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('전체');
  const [selectedType, setSelectedType] = useState('체크');
  const [search, setSearch] = useState('');
  const [modalItem, setModalItem] = useState<GalleryItem | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => { setItems(loadGallery()); }, []);

  // Apple 스타일 스크롤 효과
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Apple 스타일 스크롤 opacity 계산
  const heroOpacity = Math.max(0, 1 - scrollY / 350);
  const heroTranslateY = scrollY * 0.3;

  return (
    <div style={{ background: 'var(--color-cream)' }}>
      <Header />

      {/* ── Apple 스타일 풀스크린 Hero ── */}
      <section
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10,
          overflow: 'hidden',
          background: '#FFFCFA',
          opacity: heroOpacity,
          transform: `translateY(-${heroTranslateY}px)`,
          pointerEvents: heroOpacity < 0.05 ? 'none' : 'auto',
          transition: 'opacity 0.1s linear, transform 0.1s linear',
        }}
      >
        {/* 뜨개실 영상 배경 */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.9,
          }}
        >
          <source src="/videos/cro-share-yarn.mp4" type="video/mp4" />
        </video>
      </section>

      {/* ── 갤러리 섹션 (Hero 위로 올라옴) ── */}
      <div style={{ paddingTop: '100vh', position: 'relative', zIndex: 20 }}>

        {/* ── 카테고리 섹션 ── */}
        <div className="sticky top-16 z-40 bg-cream/95 backdrop-blur-sm border-b border-warm-border" style={{ borderColor: 'var(--color-warm-border)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 24px' }}>
          {/* 검색창 */}
          <div className="mb-6">
            <label className="input input-bordered flex items-center gap-2 text-sm" style={{ background: 'white' }}>
              <span className="text-lg">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isKo ? '패턴 이름, 작가, 태그 검색...' : 'Search patterns, authors, tags...'}
                className="grow outline-none"
                style={{ fontFamily: 'var(--font-body)' }}
              />
            </label>
          </div>

          {/* 패턴 유형 섹션 */}
          <div className="mb-6">
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-ink-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isKo ? '패턴 유형' : 'PATTERN TYPE'}
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
            <p style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-body)', color: 'var(--color-ink)', marginBottom: 8 }}>
              {isKo ? '패턴을 찾을 수 없어요' : 'No patterns found'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
              {isKo ? '다른 검색어나 태그로 시도해보세요' : 'Try different keywords or tags'}
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

        {/* ── Footer CTA ── */}
        <div style={{
          marginTop: 48,
          borderTop: '1px solid var(--color-warm-border)',
          padding: '32px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <img src="/logo.png" alt="Cro-share" style={{ height: 40 }} />
          <Link href="/editor" className="btn btn-primary btn-sm">
            {isKo ? '시작하기 →' : 'Get Started →'}
          </Link>
        </div>
      </div>
      </div>

      {/* 모달 */}
      {modalItem && (
        <PatternModal item={modalItem} onClose={() => setModalItem(null)} />
      )}
    </div>
  );
}
