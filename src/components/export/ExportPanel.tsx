'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useKnitChartStore } from '@/hooks/useKnitChartState';
import { formatFullPattern } from '@/lib/knitting/patternGenerator';
import { saveToGallery } from '@/lib/gallery/store';

export default function ExportPanel() {
  const { chart, language } = useKnitChartStore();
  const [filename, setFilename] = useState('my-knit-pattern');
  const [isExporting, setIsExporting] = useState(false);
  const [shared, setShared] = useState(false);

  if (!chart) return null;

  const handleTxt = () => {
    const text = formatFullPattern(chart, language);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePng = async () => {
    setIsExporting(true);
    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) return;
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${filename}.png`; a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
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
    setTimeout(() => setShared(false), 2000);
  };

  const handlePdf = async () => {
    setIsExporting(true);
    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) return;

      // A4 크기 (210mm × 297mm = 595px × 842px at 72dpi)
      const pageWidth = 210; // mm
      const pageHeight = 297; // mm
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // 차트 이미지 변환
      const chartImage = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 20; // 좌우 여백 10mm
      const imgHeight = (imgWidth * canvas.height) / canvas.width;

      let yPos = 10; // 상단 여백

      // 제목
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(chart.name, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      // 기본 정보
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const infoKo = `격자: ${chart.width}코 × ${chart.height}단 | 게이지: ${chart.gaugeStitches || 20}코, ${chart.gaugeRows || 28}단`;
      const infoEn = `Grid: ${chart.width} stitches × ${chart.height} rows | Gauge: ${chart.gaugeStitches || 20} st, ${chart.gaugeRows || 28} rows`;
      pdf.text(language === 'ko' ? infoKo : infoEn, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;

      // 색상 팔레트
      if (chart.yarnPalette.length > 0) {
        pdf.setFontSize(9);
        const paletteText = chart.yarnPalette.map(y => `${y.label}(${y.id})`).join(', ');
        pdf.text(paletteText, pageWidth / 2, yPos, { align: 'center' });
        yPos += 4;
      }

      yPos += 2;

      // 이미지 삽입 (한 페이지에 맞추기)
      if (yPos + imgHeight > pageHeight - 10) {
        // 이미지가 한 페이지를 넘으면 축소
        const scaleFactor = (pageHeight - yPos - 10) / imgHeight;
        const newImgHeight = imgHeight * scaleFactor;
        const newImgWidth = imgWidth * scaleFactor;
        pdf.addImage(chartImage, 'PNG', (pageWidth - newImgWidth) / 2, yPos, newImgWidth, newImgHeight);
      } else {
        pdf.addImage(chartImage, 'PNG', (pageWidth - imgWidth) / 2, yPos, imgWidth, imgHeight);
      }

      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const cardStyle = {
    background: 'var(--color-blush)',
    border: '1.5px solid var(--color-warm-border)',
    borderRadius: '1rem',
    padding: '1rem',
  };

  return (
    <div style={cardStyle} className="space-y-3">
      <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>
        {language === 'ko' ? '저장하기' : 'Export'}
      </h3>

      <div>
        <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-ink-mid)', fontFamily: 'var(--font-body)' }}>
          {language === 'ko' ? '파일명' : 'Filename'}
        </label>
        <input value={filename} onChange={e => setFilename(e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: 'white', border: '1.5px solid var(--color-warm-border)', color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleShare}
          className="py-2.5 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5"
          style={{ background: shared ? 'var(--color-sage)' : 'var(--color-rose-light)', color: shared ? 'white' : 'var(--color-rose-dark)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          {shared ? '✓ 공유됨!' : '🔗 공유'}
        </button>
        <button onClick={handlePdf} disabled={isExporting}
          className="py-2.5 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: 'var(--color-rose)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 3px 12px rgba(201,123,107,0.35)' }}>
          📋 PDF
        </button>
        <button onClick={handlePng} disabled={isExporting}
          className="py-2.5 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: 'white', color: 'var(--color-ink-mid)', border: '1.5px solid var(--color-warm-border)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          📥 PNG
        </button>
        <button onClick={handleTxt}
          className="py-2.5 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5"
          style={{ background: 'white', color: 'var(--color-ink-mid)', border: '1.5px solid var(--color-warm-border)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          📄 {language === 'ko' ? '텍스트' : 'TXT'}
        </button>
      </div>
    </div>
  );
}
