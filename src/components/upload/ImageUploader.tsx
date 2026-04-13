'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';


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
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}>
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

        </>
      )}
    </div>
  );
}
