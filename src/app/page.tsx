'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import PatternCard from '@/components/gallery/PatternCard';
import PatternModal from '@/components/gallery/PatternModal';
import CrochetSection from '@/components/crochet/CrochetSection';
import { loadGallery, toggleLike, type GalleryItem } from '@/lib/gallery/store';

const ALL_TAGS = ['전체', '초급', '중급', '고급', '체크', '레이스', '케이블', '컬러워크', '노르딕', '모티프'];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedTag, setSelectedTag] = useState('전체');
  const [search, setSearch] = useState('');
  const [modalItem, setModalItem] = useState<GalleryItem | null>(null);

  useEffect(() => { setItems(loadGallery()); }, []);

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
    const matchTag = selectedTag === '전체' || item.tags.includes(selectedTag);
    const matchSearch = !search || item.title.includes(search) || item.author.includes(search) || item.tags.some(t => t.includes(search));
    return matchTag && matchSearch;
  });

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh' }}>
      <Header />

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(150deg, #FFF4EF 0%, #FDE8F2 40%, #EEE8FF 75%, #E8F2FF 100%)',
        borderBottom: '1px solid var(--color-warm-border)',
        padding: '56px 24px 48px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
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
          Cro-share
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/editor" style={{
            background: 'var(--color-rose)',
            color: 'white',
            padding: '13px 30px',
            borderRadius: 100,
            fontWeight: 700, fontSize: 14,
            fontFamily: 'var(--font-body)',
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(201,123,107,0.38)',
            transition: 'transform 0.15s',
            display: 'inline-block',
          }}>
            ✦ 패턴 만들기
          </Link>
          <span style={{ fontSize: 13, color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
            {items.length}개 패턴 공유 중
          </span>
        </div>
      </div>

      {/* ── 검색 + 태그 필터 ── */}
      <div style={{
        position: 'sticky', top: 64, zIndex: 40,
        background: 'rgba(250,246,241,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--color-warm-border)',
        padding: '12px 24px',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* 검색창 */}
          <div style={{ position: 'relative', maxWidth: 340, marginBottom: 10 }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              fontSize: 15, pointerEvents: 'none',
            }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="패턴 이름, 작가, 태그 검색..."
              style={{
                width: '100%',
                paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                borderRadius: 100,
                border: '1.5px solid var(--color-warm-border)',
                background: 'white',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-ink)',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(92,51,23,0.05)',
              }}
            />
          </div>

          {/* 태그 칩 */}
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
            {ALL_TAGS.map(tag => (
              <button key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 100,
                  fontSize: 12, fontWeight: 700,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: selectedTag === tag ? 'var(--color-rose)' : 'white',
                  color: selectedTag === tag ? 'white' : 'var(--color-ink-mid)',
                  border: `1.5px solid ${selectedTag === tag ? 'var(--color-rose)' : 'var(--color-warm-border)'}`,
                  boxShadow: selectedTag === tag ? '0 3px 10px rgba(201,123,107,0.28)' : 'none',
                }}>
                {tag}
              </button>
            ))}
            <span style={{ fontSize: 12, color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)', marginLeft: 4 }}>
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
          <Link href="/editor" style={{
            display: 'inline-block',
            background: 'var(--color-rose)',
            color: 'white',
            padding: '13px 32px',
            borderRadius: 100,
            fontWeight: 700, fontSize: 14,
            fontFamily: 'var(--font-body)',
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(201,123,107,0.35)',
          }}>
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
