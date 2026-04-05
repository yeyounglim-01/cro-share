'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

type SampleType = 'flower' | 'cat' | 'mountain';

const SAMPLES: { label: string; emoji: string; type: SampleType }[] = [
  { label: '꽃', emoji: '🌸', type: 'flower' },
  { label: '고양이', emoji: '🐱', type: 'cat' },
  { label: '산', emoji: '⛰️', type: 'mountain' },
];

/**
 * Canvas로 컬러워크에 최적화된 샘플 이미지 생성.
 * 외부 URL 없음 — CORS 이슈 없음. 5~6가지 뚜렷한 색상 영역으로 구성.
 */
function generateSampleImage(type: SampleType): string {
  const S = 240;
  const canvas = document.createElement('canvas');
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  const fill = (c: string) => { ctx.fillStyle = c; };
  const rect = (x: number, y: number, w: number, h: number) => ctx.fillRect(x, y, w, h);
  const circle = (x: number, y: number, r: number) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
  const poly = (...pts: number[]) => {
    ctx.beginPath();
    for (let i = 0; i < pts.length; i += 2) i === 0 ? ctx.moveTo(pts[i], pts[i+1]) : ctx.lineTo(pts[i], pts[i+1]);
    ctx.closePath(); ctx.fill();
  };

  if (type === 'flower') {
    // 하늘색 배경, 초록 잎, 빨간 꽃잎, 보라 꽃잎, 노란 중심 — 5색
    fill('#87CEEB'); rect(0, 0, S, S);            // 하늘
    fill('#4A8C3F'); rect(0, S*0.7, S, S*0.3);   // 초록 땅
    fill('#4A8C3F');                               // 줄기
    rect(S*0.46, S*0.4, S*0.08, S*0.32);
    poly(S*0.5, S*0.4, S*0.3, S*0.5, S*0.5, S*0.55); // 왼 잎
    poly(S*0.5, S*0.42, S*0.7, S*0.52, S*0.5, S*0.57); // 오른 잎
    const cx = S*0.5, cy = S*0.32;
    const pColors = ['#E83050','#C020A0','#E83050','#C020A0','#E83050','#C020A0'];
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI * 2) / 6;
      fill(pColors[i]);
      ctx.beginPath(); ctx.ellipse(cx + S*0.16*Math.cos(a), cy + S*0.16*Math.sin(a), S*0.07, S*0.13, a, 0, Math.PI*2); ctx.fill();
    }
    fill('#F5D020'); circle(cx, cy, S*0.1);
    fill('#E0A010'); circle(cx, cy, S*0.06);

  } else if (type === 'cat') {
    // 남색 배경, 주황 고양이 몸, 흰 배, 핑크 귀안, 갈색 얼굴 — 5색
    fill('#2B3A8F'); rect(0, 0, S, S);            // 남색 배경
    const cx = S*0.5, cy = S*0.52;
    fill('#E07820');                               // 주황 몸통
    ctx.beginPath(); ctx.ellipse(cx, cy+S*0.12, S*0.28, S*0.22, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy-S*0.04, S*0.22, 0, Math.PI*2); ctx.fill();
    // 귀
    poly(cx-S*0.15, cy-S*0.22, cx-S*0.24, cy-S*0.4, cx-S*0.06, cy-S*0.22);
    poly(cx+S*0.15, cy-S*0.22, cx+S*0.24, cy-S*0.4, cx+S*0.06, cy-S*0.22);
    fill('#FFB0A0');                               // 핑크 귀안
    poly(cx-S*0.14, cy-S*0.23, cx-S*0.21, cy-S*0.36, cx-S*0.08, cy-S*0.23);
    poly(cx+S*0.14, cy-S*0.23, cx+S*0.21, cy-S*0.36, cx+S*0.08, cy-S*0.23);
    fill('#FFF5E0');                               // 흰 배
    ctx.beginPath(); ctx.ellipse(cx, cy+S*0.16, S*0.13, S*0.15, 0, 0, Math.PI*2); ctx.fill();
    fill('#4A2810');                               // 갈색 눈+코
    circle(cx-S*0.09, cy-S*0.06, S*0.04);
    circle(cx+S*0.09, cy-S*0.06, S*0.04);
    ctx.beginPath(); ctx.moveTo(cx, cy+S*0.03); ctx.lineTo(cx-S*0.04, cy+S*0.07); ctx.lineTo(cx+S*0.04, cy+S*0.07); ctx.fill();

  } else {
    // 노을 배경 + 산 + 눈 + 초원 — 6색
    fill('#FF7040'); rect(0, 0, S, S);            // 주황 노을
    fill('#FFD080'); rect(0, S*0.55, S, S*0.45); // 노란 하늘 아랫단
    fill('#6040A0');                               // 보라 뒷산
    poly(0, S*0.75, S*0.35, S*0.35, S*0.7, S*0.75, S, S*0.6, S, S, 0, S);
    fill('#3A3060');                               // 남보라 앞산
    poly(S*0.15, S, S*0.52, S*0.28, S*0.88, S);
    fill('#EEF5FF');                               // 흰 설산
    poly(S*0.38, S*0.52, S*0.52, S*0.28, S*0.66, S*0.52, S*0.58, S*0.56, S*0.46, S*0.56);
    fill('#2A6030');                               // 초록 초원
    rect(0, S*0.78, S, S*0.22);
    fill('#1A4020');                               // 진초록 나무 실루엣
    for (let i = 0; i < 5; i++) {
      const tx = S*0.05 + i*S*0.22, ty = S*0.72;
      poly(tx, ty, tx+S*0.06, ty+S*0.12, tx-S*0.06, ty+S*0.12);
      poly(tx-S*0.03, ty+S*0.1, tx+S*0.08, ty+S*0.2, tx-S*0.08, ty+S*0.2);
    }
  }

  return canvas.toDataURL('image/jpeg', 0.92);
}

interface Props {
  onReady: (img: HTMLImageElement) => void;
}

export default function ImageUploader({ onReady }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((src: string) => {
    setLoading(true);
    setError(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      setLoading(false);
      onReady(img);
    };

    img.onerror = () => {
      // CORS 실패 시 crossOrigin 없이 재시도
      const img2 = new Image();
      img2.onload = () => {
        setLoading(false);
        onReady(img2);
      };
      img2.onerror = () => {
        setLoading(false);
        setError('이미지를 불러오지 못했어요. 다른 이미지를 시도해주세요.');
      };
      img2.src = src;
    };

    img.src = src;
  }, [onReady]);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => load(e.target?.result as string);
    reader.onerror = () => setError('파일을 읽지 못했어요.');
    reader.readAsDataURL(file);
  }, [load]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1,
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}>
          이미지 업로드
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
          원하는 디자인 이미지를 업로드하세요
        </p>
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="rounded-3xl p-10 text-center"
          style={{ background: 'var(--color-blush)', border: '2px dashed var(--color-rose)' }}>
          <div className="text-4xl mb-3 animate-spin inline-block">🧶</div>
          <p className="font-semibold" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>
            이미지 불러오는 중...
          </p>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="rounded-2xl p-4"
          style={{ background: '#FEE2E2', border: '1.5px solid #FCA5A5' }}>
          <p className="text-sm font-semibold" style={{ color: '#991B1B', fontFamily: 'var(--font-body)' }}>
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Drop zone */}
      {!loading && (
        <>
          <div {...getRootProps()}
            className="w-full rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-200 p-10 text-center"
            style={{
              borderColor: isDragActive ? 'var(--color-rose)' : 'var(--color-warm-border)',
              background: isDragActive ? 'var(--color-rose-light)' : 'var(--color-paper)',
              boxShadow: '0 4px 20px rgba(92,51,23,0.05)',
            }}>
            <input {...getInputProps()} />
            <div className="text-5xl mb-4">{isDragActive ? '📂' : '🖼️'}</div>
            <p className="font-semibold mb-1" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>
              {isDragActive ? '여기에 놓아주세요!' : '이미지를 드래그하거나 클릭해서 업로드'}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
              JPG, PNG, WebP 등 지원
            </p>
          </div>

          <div>
            <p className="text-xs text-center mb-3"
              style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}>
              또는 샘플 이미지로 체험
            </p>
            <div className="flex gap-3 justify-center">
              {SAMPLES.map(s => (
                <button key={s.label} onClick={() => load(generateSampleImage(s.type))}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:-translate-y-0.5 active:scale-95"
                  style={{
                    background: 'var(--color-paper)',
                    border: '1.5px solid var(--color-warm-border)',
                    color: 'var(--color-ink)',
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(92,51,23,0.07)',
                  }}>
                  <span className="text-lg">{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
