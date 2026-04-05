'use client';

import { useState, useCallback, useEffect } from 'react';
import Header from '@/components/layout/Header';
import ImageUploader from '@/components/upload/ImageUploader';
import StitchPalette from '@/components/draw/StitchPalette';
import KnitSymbolChart from '@/components/chart/KnitSymbolChart';
import PatternText from '@/components/pattern/PatternText';
import ExportPanel from '@/components/export/ExportPanel';
import { useKnitChartStore } from '@/hooks/useKnitChartState';
import { imageToColorChart } from '@/lib/imageProcessing/imageToColorChart';
import { useDrawTool } from '@/hooks/useDrawTool';
import { saveToGallery } from '@/lib/gallery/store';
import type { ChartCell } from '@/types/knit';

type AppMode = 'select' | 'image-upload' | 'draw-setup' | 'editor';

function SliderField({ label, value, min, max, onChange, format }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-sm font-semibold" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>{label}</label>
        <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
          style={{ background: 'var(--color-rose-light)', color: 'var(--color-rose)', fontFamily: 'var(--font-body)' }}>
          {format ? format(value) : value}
        </span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}

export default function EditorPage() {
  const [appMode, setAppMode] = useState<AppMode>('select');
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null); // 에디터 내 이미지 프리뷰용
  const { chart, setChart, isProcessing, setProcessing, gridWidth, gridHeight, colorCount,
    setGridWidth, setGridHeight, setColorCount, language, resetChart,
    updateYarnLabel, updateYarnColor, selectedYarnColor, setSelectedYarnColor,
    drawMode, setDrawMode, symmetryMode, setSymmetryMode } = useKnitChartStore();
  const { undo, redo } = useDrawTool();

  // 갤러리에서 "편집하기"로 진입한 경우 차트가 이미 스토어에 있으면 바로 에디터 모드로
  useEffect(() => {
    if (chart) setAppMode('editor');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [shared, setShared] = useState(false);

  const handleShare = useCallback(() => {
    if (!chart) return;
    saveToGallery({
      id: chart.id,
      chart,
      title: chart.name,
      author: '나',
      tags: [chart.mode === 'image' ? '컬러워크' : '도트', '내 패턴'],
      likes: 0,
      likedByMe: false,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  }, [chart]);

  // 이미지 선택 즉시 자동 생성 — 비율 보존 격자 크기 자동 계산
  const handleImageReady = useCallback(async (img: HTMLImageElement) => {
    setLoadedImage(img);
    setImageSrc(img.src);

    // 이미지 비율에 맞게 격자 크기 자동 설정
    const ratio = img.naturalWidth / img.naturalHeight;
    const MAX = 40;
    let autoW: number, autoH: number;
    if (ratio >= 1) {
      autoW = MAX;
      autoH = Math.max(10, Math.min(80, Math.round(MAX / ratio)));
    } else {
      autoH = MAX;
      autoW = Math.max(10, Math.min(80, Math.round(MAX * ratio)));
    }
    setGridWidth(autoW);
    setGridHeight(autoH);

    setProcessing(true);
    setAppMode('image-upload');
    try {
      const data = await imageToColorChart(img, autoW, autoH, colorCount);
      setChart(data);
      if (data.yarnPalette.length > 0) setSelectedYarnColor(data.yarnPalette[0].color);
      setAppMode('editor');
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  }, [colorCount, setChart, setProcessing, setSelectedYarnColor, setGridWidth, setGridHeight]);

  const handleGenerateFromImage = useCallback(async () => {
    if (!loadedImage) return;
    setProcessing(true);
    try {
      const data = await imageToColorChart(loadedImage, gridWidth, gridHeight, colorCount);
      setChart(data);
      if (data.yarnPalette.length > 0) setSelectedYarnColor(data.yarnPalette[0].color);
      setAppMode('editor');
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  }, [loadedImage, gridWidth, gridHeight, colorCount, setChart, setProcessing, setSelectedYarnColor]);

  const handleCreateBlank = useCallback(() => {
    const cells: ChartCell[][] = Array.from({ length: gridHeight }, () =>
      Array.from({ length: gridWidth }, () => ({ stitchId: 'k' }))
    );
    setChart({
      id: crypto.randomUUID(),
      name: '새 패턴',
      mode: 'draw',
      width: gridWidth,
      height: gridHeight,
      cells,
      yarnPalette: [],
    });
    setAppMode('editor');
  }, [gridWidth, gridHeight, setChart]);

  // Ctrl+Z undo / Ctrl+Y or Ctrl+Shift+Z redo
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [undo, redo]);

  const cardStyle = {
    background: 'var(--color-paper)',
    border: '1.5px solid var(--color-warm-border)',
    borderRadius: '1.25rem',
    padding: '1.25rem',
    boxShadow: '0 3px 16px rgba(92,51,23,0.06)',
  };

  const toolbarBtnStyle = {
    background: 'var(--color-warm-gray)',
    border: '1.5px solid var(--color-warm-border)',
    color: 'var(--color-ink-mid)',
    cursor: 'pointer',
    borderRadius: '0.5rem',
    width: 32, height: 32,
    fontWeight: 700, fontSize: '1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.15s',
  } as React.CSSProperties;

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh' }}>
      <Header />

      {/* ── 에디터 — 가로 나열형 레이아웃 ── */}
      {appMode === 'editor' && chart && (
        <div>
          {/* 툴바 */}
          <div className="flex items-center justify-between px-4 py-2 gap-3 flex-wrap"
            style={{ background: 'var(--color-paper)', borderBottom: '1.5px solid var(--color-warm-border)' }}>
            <div className="flex items-center gap-3">
              <button onClick={() => { resetChart(); setAppMode('select'); setLoadedImage(null); setImageSrc(null); }}
                className="text-sm font-semibold"
                style={{ color: 'var(--color-ink-light)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                ← 새 패턴
              </button>
              <span className="font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}>
                {chart.name}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: chart.mode === 'image' ? 'var(--color-rose-light)' : 'var(--color-lavender-light)', color: 'var(--color-ink-mid)', fontFamily: 'var(--font-body)' }}>
                {chart.mode === 'image' ? '컬러워크' : '도트 그리기'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* 그리기 모드 */}
              <div className="flex rounded-lg overflow-hidden"
                style={{ border: '1.5px solid var(--color-warm-border)' }}>
                {([
                  { mode: 'pencil', icon: '✏️', tip: '그리기 (클릭·드래그)' },
                  { mode: 'fill',   icon: '🪣', tip: '채우기 (인접 색상 채우기)' },
                ] as const).map(({ mode, icon, tip }) => (
                  <button key={mode} onClick={() => setDrawMode(mode)} title={tip}
                    style={{
                      ...toolbarBtnStyle,
                      width: 34, height: 30, borderRadius: 0, border: 'none',
                      background: drawMode === mode ? 'var(--color-rose-light)' : 'var(--color-warm-gray)',
                      color: drawMode === mode ? 'var(--color-rose-dark)' : 'var(--color-ink-mid)',
                    }}>
                    {icon}
                  </button>
                ))}
              </div>

              {/* 대칭 모드 */}
              <div className="flex rounded-lg overflow-hidden"
                style={{ border: '1.5px solid var(--color-warm-border)' }}>
                {([
                  { mode: 'none',       icon: '✕',  tip: '대칭 없음' },
                  { mode: 'horizontal', icon: '↔',  tip: '좌우 대칭' },
                  { mode: 'vertical',   icon: '↕',  tip: '상하 대칭' },
                  { mode: 'both',       icon: '✦',  tip: '전체 대칭' },
                ] as const).map(({ mode, icon, tip }) => (
                  <button key={mode} onClick={() => setSymmetryMode(mode)} title={tip}
                    style={{
                      ...toolbarBtnStyle,
                      width: 30, height: 30, borderRadius: 0, border: 'none',
                      fontSize: '0.8rem',
                      background: symmetryMode === mode ? 'var(--color-lavender-light)' : 'var(--color-warm-gray)',
                      color: symmetryMode === mode ? '#6B4CA0' : 'var(--color-ink-mid)',
                    }}>
                    {icon}
                  </button>
                ))}
              </div>

              {chart.mode === 'image' && loadedImage && (
                <button onClick={() => setAppMode('image-upload')}
                  title={language === 'ko' ? '격자 크기·색상 수 변경 후 재생성' : 'Regenerate'}
                  className="text-xs font-bold px-2 h-8 rounded-lg"
                  style={{ background: 'var(--color-warm-gray)', border: '1.5px solid var(--color-warm-border)', color: 'var(--color-ink-mid)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  ⚙ {language === 'ko' ? '재설정' : 'Reset'}
                </button>
              )}
              <button onClick={undo} title="실행 취소 (Ctrl+Z)" style={toolbarBtnStyle}>↩</button>
              <button onClick={redo} title="다시 실행 (Ctrl+Y)" style={toolbarBtnStyle}>↪</button>
              <button onClick={handleShare}
                className="px-3 py-1.5 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5"
                style={{ background: shared ? 'var(--color-sage)' : 'var(--color-rose-light)', color: shared ? 'white' : 'var(--color-rose-dark)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                {shared ? '✓ 공유됨!' : '🔗 공유'}
              </button>
            </div>
          </div>

          {/* 기호 팔레트 수평 스트립 */}
          <div style={{ borderBottom: '1.5px solid var(--color-warm-border)', background: 'var(--color-paper)' }}>
            <StitchPalette horizontal />
          </div>

          {/* 실 색상 수평 스트립 */}
          {chart.yarnPalette.length > 0 && (
            <div className="flex items-center gap-4 px-4 py-2 overflow-x-auto"
              style={{ borderBottom: '1.5px solid var(--color-warm-border)', background: 'var(--color-paper)' }}>
              <span className="text-xs font-bold flex-shrink-0"
                style={{ color: 'var(--color-ink-mid)', fontFamily: 'var(--font-body)' }}>
                {language === 'ko' ? '실 선택' : 'Yarn'}
              </span>
              {chart.yarnPalette.map(yarn => {
                const isActive = selectedYarnColor === yarn.color;
                return (
                  <div key={yarn.id} className="flex items-center gap-1.5 flex-shrink-0">
                    {/* 클릭 = 이 실로 그리기 선택 */}
                    <button
                      onClick={() => setSelectedYarnColor(yarn.color)}
                      title={language === 'ko' ? `${yarn.label} 선택` : `Select ${yarn.label}`}
                      style={{
                        width: 22, height: 22, borderRadius: '0.375rem', padding: 0,
                        background: yarn.color, cursor: 'pointer', flexShrink: 0,
                        border: isActive ? '3px solid var(--color-ink)' : '2px solid rgba(92,51,23,0.2)',
                        boxShadow: isActive ? '0 0 0 2px var(--color-rose)' : 'none',
                        outline: 'none',
                      }}
                    />
                    {/* 색상 변경 피커 — 컬러휠 아이콘 클릭 */}
                    <label className="relative cursor-pointer flex-shrink-0"
                      title={language === 'ko' ? '색상 변경' : 'Change color'}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'var(--color-warm-gray)', border: '1px solid var(--color-warm-border)' }}>
                      <span style={{ fontSize: '0.65rem', lineHeight: 1, userSelect: 'none' }}>🎨</span>
                      <input type="color" value={yarn.color}
                        onChange={e => updateYarnColor(yarn.id, e.target.value)}
                        style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                    </label>
                    <input value={yarn.label} onChange={e => updateYarnLabel(yarn.id, e.target.value)}
                      className="text-xs font-semibold rounded-md px-1.5 py-0.5 outline-none"
                      style={{ width: 64, color: 'var(--color-ink)', fontFamily: 'var(--font-body)', background: 'var(--color-warm-gray)', border: '1px solid var(--color-warm-border)' }} />
                  </div>
                );
              })}
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
                {language === 'ko' ? '스와치 클릭 = 해당 실로 칠하기' : 'Click swatch = paint with that yarn'}
              </span>
            </div>
          )}

          {/* 메인 영역: 원본 이미지(있을 때) + 차트 */}
          <div className="flex gap-4 p-4 items-start">
            {chart.mode === 'image' && imageSrc && (
              <div className="flex-shrink-0 w-40"
                style={{ background: 'var(--color-paper)', border: '1.5px solid var(--color-warm-border)', borderRadius: '1rem', padding: '0.75rem', boxShadow: '0 3px 16px rgba(92,51,23,0.06)' }}>
                <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-ink-mid)', fontFamily: 'var(--font-body)' }}>
                  {language === 'ko' ? '원본 이미지' : 'Source'}
                </p>
                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-warm-border)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageSrc} alt="원본 이미지" style={{ width: '100%', display: 'block', objectFit: 'contain' }} />
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>
                  {language === 'ko' ? '색상 참고용' : 'Color reference'}
                </p>
              </div>
            )}
            <div className="flex-1"
              style={{ background: 'var(--color-paper)', border: '1.5px solid var(--color-warm-border)', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 3px 16px rgba(92,51,23,0.06)' }}>
              <KnitSymbolChart chartData={chart} editable={true} />
            </div>
          </div>

          {/* 하단 패널: 패턴 텍스트 + 내보내기 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-8">
            <div style={cardStyle}><PatternText /></div>
            <div style={cardStyle}><ExportPanel /></div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 pb-12 pt-6">

        {/* ── Mode Select ── */}
        {appMode === 'select' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold mb-3"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}>
                패턴 만들기
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
                시작 방법을 선택해주세요
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  mode: 'image-upload' as const,
                  icon: '🖼️',
                  titleKo: '이미지로 시작',
                  titleEn: 'Start from Image',
                  descKo: '사진이나 그림을 업로드하면 자동으로 컬러워크 패턴을 만들어줍니다.',
                  bg: 'var(--color-rose-light)',
                  border: 'var(--color-rose)',
                },
                {
                  mode: 'draw-setup' as const,
                  icon: '✏️',
                  titleKo: '직접 그리기',
                  titleEn: 'Draw Pattern',
                  descKo: '빈 격자에 기호를 직접 배치해서 나만의 뜨개 도안을 만들어보세요.',
                  bg: 'var(--color-lavender-light)',
                  border: '#C0A8E0',
                },
              ].map(opt => (
                <button key={opt.mode}
                  onClick={() => setAppMode(opt.mode)}
                  className="text-left p-7 rounded-3xl transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: opt.bg,
                    border: `2px solid ${opt.border}40`,
                    boxShadow: '0 4px 20px rgba(92,51,23,0.08)',
                    cursor: 'pointer',
                  }}>
                  <span className="text-5xl block mb-4">{opt.icon}</span>
                  <h3 className="text-xl font-bold mb-2"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}>
                    {language === 'ko' ? opt.titleKo : opt.titleEn}
                  </h3>
                  <p className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-ink-mid)', fontFamily: 'var(--font-body)' }}>
                    {opt.descKo}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Image Upload Step ── */}
        {appMode === 'image-upload' && (
          <div className="max-w-2xl mx-auto space-y-5">
            <button onClick={() => setAppMode(chart ? 'editor' : 'select')}
              className="text-sm font-semibold"
              style={{ color: 'var(--color-ink-light)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              ← {chart ? (language === 'ko' ? '편집으로' : 'Back to Editor') : (language === 'ko' ? '뒤로' : 'Back')}
            </button>
            {!loadedImage ? (
              <ImageUploader onReady={handleImageReady} />
            ) : (
              <div style={cardStyle} className="space-y-5">
                <div className="rounded-2xl overflow-hidden"
                  style={{ border: '1.5px solid var(--color-warm-border)', maxHeight: 200 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={loadedImage.src} alt="업로드된 이미지" className="w-full" style={{ display: 'block', objectFit: 'contain' }}/>
                </div>
                <SliderField label={language === 'ko' ? '격자 너비 (코 수)' : 'Grid Width (stitches)'}
                  value={gridWidth} min={10} max={80} onChange={setGridWidth} format={v => `${v}코`} />
                <SliderField label={language === 'ko' ? '격자 높이 (단 수)' : 'Grid Height (rows)'}
                  value={gridHeight} min={10} max={80} onChange={setGridHeight} format={v => `${v}단`} />
                <SliderField label={language === 'ko' ? '실 색상 수' : 'Yarn Colors'}
                  value={colorCount} min={2} max={10} onChange={setColorCount} format={v => `${v}가지`} />
                <div className="flex gap-3">
                  <button onClick={() => { setLoadedImage(null); }}
                    className="flex-1 py-2.5 rounded-2xl font-bold text-sm"
                    style={{ background: 'var(--color-warm-gray)', color: 'var(--color-ink-mid)', border: '1.5px solid var(--color-warm-border)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    다시 선택
                  </button>
                  <button onClick={handleGenerateFromImage} disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50"
                    style={{ background: 'var(--color-rose)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 4px 16px rgba(201,123,107,0.35)' }}>
                    {isProcessing ? '생성 중...' : '✦ 패턴 생성'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Draw Setup Step ── */}
        {appMode === 'draw-setup' && (
          <div className="max-w-lg mx-auto space-y-5">
            <button onClick={() => setAppMode('select')}
              className="text-sm font-semibold"
              style={{ color: 'var(--color-ink-light)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              ← 뒤로
            </button>
            <div style={cardStyle} className="space-y-5">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}>
                {language === 'ko' ? '격자 설정' : 'Grid Settings'}
              </h2>
              <SliderField label={language === 'ko' ? '격자 너비 (코 수)' : 'Grid Width (stitches)'}
                value={gridWidth} min={5} max={80} onChange={setGridWidth} format={v => `${v}코`} />
              <SliderField label={language === 'ko' ? '격자 높이 (단 수)' : 'Grid Height (rows)'}
                value={gridHeight} min={5} max={80} onChange={setGridHeight} format={v => `${v}단`} />
              <button onClick={handleCreateBlank}
                className="w-full py-3 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--color-rose)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 4px 16px rgba(201,123,107,0.35)' }}>
                ✦ 빈 격자 만들기
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
