'use client';

import { useState } from 'react';
import { useKnitChartStore } from '@/hooks/useKnitChartState';

interface Props {
  onClose: () => void;
}

export default function HowToModal({ onClose }: Props) {
  const { language } = useKnitChartStore();
  const isKo = language === 'ko';
  const [step, setStep] = useState(0);

  const sections = [
    {
      icon: '🖼️',
      titleKo: '이미지로 시작하기',
      titleEn: 'Start from Image',
      descKo: '사진을 업로드하면 자동으로 뜨개질 패턴으로 변환됩니다.',
      descEn: 'Upload a photo to automatically convert it into a knitting pattern.',
    },
    {
      icon: '✏️',
      titleKo: '직접 그리기',
      titleEn: 'Draw Pattern',
      descKo: '빈 격자에 기호를 직접 배치해서 패턴을 만들 수 있습니다.',
      descEn: 'Create your pattern by placing symbols on a blank grid.',
    },
    {
      icon: '🎨',
      titleKo: '색상 선택 및 편집',
      titleEn: 'Select Colors',
      descKo: '뜨개질 실의 색상을 선택하고 변경할 수 있습니다. 색상을 클릭해 편집하세요.',
      descEn: 'Select yarn colors and edit them. Click on a color swatch to customize.',
    },
    {
      icon: '✏️🪣',
      titleKo: '그리기 도구',
      titleEn: 'Drawing Tools',
      descKo: '연필(자유 그리기)과 페인트(색상 채우기) 중 선택할 수 있습니다.',
      descEn: 'Choose between pencil (freehand) and paint (fill) tools.',
    },
    {
      icon: '↔↕✦',
      titleKo: '대칭 모드',
      titleEn: 'Symmetry Mode',
      descKo: '좌우, 상하, 또는 전체 대칭으로 자동 미러링됩니다.',
      descEn: 'Auto-mirror your design: horizontal, vertical, or both.',
    },
    {
      icon: '🎯',
      titleKo: '진행도 추적',
      titleEn: 'Progress Tracking',
      descKo: '뜨개질을 하면서 현재 단을 표시해 놓고 추적할 수 있습니다.',
      descEn: 'Track which row you\'re currently knitting with a highlight.',
    },
    {
      icon: '📥',
      titleKo: '내보내기',
      titleEn: 'Export',
      descKo: 'PDF, PNG, 텍스트 등 다양한 형식으로 패턴을 저장할 수 있습니다.',
      descEn: 'Save your pattern as PDF, PNG, TXT, or share to gallery.',
    },
    {
      icon: '📄',
      titleKo: '텍스트 패턴',
      titleEn: 'Pattern Text',
      descKo: '왼쪽 패널에서 패턴의 텍스트 형식 설명을 확인할 수 있습니다.',
      descEn: 'View and edit the text-based pattern description in the left panel.',
    },
  ];

  const total = sections.length;
  const current = sections[step];
  const isFirst = step === 0;
  const isLast = step === total - 1;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}>
      <div
        style={{
          background: 'white',
          borderRadius: '1.25rem',
          padding: '2rem',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 10px 40px rgba(92,51,23,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}>

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>
            {isKo ? 'Cro-share 사용 가이드' : 'Cro-share Guide'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-ink-light)',
              fontSize: '1.5rem',
              fontWeight: 700,
              lineHeight: 1,
            }}>
            ×
          </button>
        </div>

        {/* 슬라이드 카드 */}
        <div
          style={{
            background: 'var(--color-cream)',
            border: '1.5px solid var(--color-warm-border)',
            borderRadius: '1rem',
            padding: '2rem 1.5rem',
            minHeight: 180,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '1rem',
          }}>
          <span style={{ fontSize: '3rem', lineHeight: 1 }}>{current.icon}</span>
          <h3
            className="font-bold text-lg"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>
            {isKo ? current.titleKo : current.titleEn}
          </h3>
          <p
            className="text-sm"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-ink-mid)',
              lineHeight: 1.6,
              maxWidth: 320,
            }}>
            {isKo ? current.descKo : current.descEn}
          </p>
        </div>

        {/* 단계 표시 점 */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {sections.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setStep(idx)}
              style={{
                width: idx === step ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: idx === step ? 'var(--color-rose)' : 'var(--color-warm-border)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </div>

        {/* 이전 / 다음 버튼 */}
        <div className="flex items-center justify-between mt-5 gap-3">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={isFirst}
            style={{
              flex: 1,
              padding: '0.65rem 0',
              borderRadius: '0.75rem',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: isFirst ? 'not-allowed' : 'pointer',
              border: '1.5px solid var(--color-warm-border)',
              background: isFirst ? 'var(--color-warm-gray)' : 'var(--color-paper)',
              color: isFirst ? 'var(--color-ink-light)' : 'var(--color-ink)',
              transition: 'all 0.15s',
            }}>
            ← {isKo ? '이전' : 'Prev'}
          </button>

          <span style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-ink-light)',
            flexShrink: 0,
          }}>
            {step + 1} / {total}
          </span>

          {isLast ? (
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.65rem 0',
                borderRadius: '0.75rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                border: 'none',
                background: 'var(--color-rose)',
                color: 'white',
                transition: 'all 0.15s',
              }}>
              {isKo ? '시작하기 ✓' : 'Get Started ✓'}
            </button>
          ) : (
            <button
              onClick={() => setStep(s => s + 1)}
              style={{
                flex: 1,
                padding: '0.65rem 0',
                borderRadius: '0.75rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                border: 'none',
                background: 'var(--color-rose)',
                color: 'white',
                transition: 'all 0.15s',
              }}>
              {isKo ? '다음' : 'Next'} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
