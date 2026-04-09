'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import CroShareSVG from '@/components/hero/CroShareSVG';
import PatternCard from '@/components/gallery/PatternCard';
import PatternModal from '@/components/gallery/PatternModal';
import CrochetSection from '@/components/crochet/CrochetSection';
import { loadGallery, toggleLike, type GalleryItem } from '@/lib/gallery/store';

const DIFFICULTY_TABS = ['전체', '초급', '중급', '고급'];
const PATTERN_TYPES = ['체크', '레이스', '케이블', '컬러워크', '노르딕', '모티프'];

export default function GalleryPage() {
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #FFFCFA 0%, #FFF5F0 40%, #F8F0FF 100%)',
          opacity: heroOpacity,
          transform: `translateY(-${heroTranslateY}px)`,
          pointerEvents: heroOpacity < 0.05 ? 'none' : 'auto',
          transition: 'opacity 0.1s linear, transform 0.1s linear',
        }}
      >
        <CroShareSVG />
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
