'use client';

import { useState } from 'react';
import { useKnitChartStore } from '@/hooks/useKnitChartState';

interface Props {
  onClose: () => void;
}

export default function HowToModal({ onClose }: Props) {
  const { language } = useKnitChartStore();
  const isKo = language === 'ko';

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
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(92,51,23,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>
            {isKo ? 'Cro-share 사용 가이드' : 'Cro-share Guide'}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-ink-light)',
            }}>
            ×
          </button>
        </div>

        {/* 섹션들 */}
        <div className="space-y-4">
          {sections.map((sec, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--color-cream)',
                border: '1.5px solid var(--color-warm-border)',
                borderRadius: '0.75rem',
                padding: '1rem',
              }}>
              <div className="flex items-start gap-3">
                <span style={{ fontSize: '2rem', flexShrink: 0 }}>{sec.icon}</span>
                <div>
                  <h3
                    className="font-bold mb-1"
                    style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>
                    {isKo ? sec.titleKo : sec.titleEn}
                  </h3>
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: 'var(--color-ink-mid)',
                      lineHeight: 1.5,
                    }}>
                    {isKo ? sec.descKo : sec.descEn}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-lg font-bold text-sm"
          style={{
            background: 'var(--color-rose)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}>
          {isKo ? '닫기' : 'Close'}
        </button>
      </div>
    </div>
  );
}
