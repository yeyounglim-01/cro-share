'use client';

import { useEffect, useRef, useState } from 'react';
import { useKnitChartStore } from '@/hooks/useKnitChartState';
import {
  ReplicateClient,
  ReplicateError,
  generatePrompt,
  getNegativePrompt,
  getOptimalParameters,
  generateControlNetMask,
} from '@/lib/ai';

interface ThumbnailSimulatorProps {
  onGenerationStart?: () => void;
  onGenerationComplete?: (imageUrl: string) => void;
  onError?: (error: ReplicateError) => void;
}

export function ThumbnailSimulator({
  onGenerationStart,
  onGenerationComplete,
  onError,
}: ThumbnailSimulatorProps) {
  const chart = useKnitChartStore(s => s.chart);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ReplicateError | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showApiTokenModal, setShowApiTokenModal] = useState(false);
  const [apiToken, setApiToken] = useState('');
  const clientRef = useRef<ReplicateClient | null>(null);

  // localStorage에서 저장된 API 토큰 불러오기
  useEffect(() => {
    const savedToken = localStorage.getItem('replicate_api_token');
    if (savedToken) {
      setApiToken(savedToken);
      clientRef.current = new ReplicateClient(savedToken);
    }
  }, []);

  // 캐시된 썸네일 확인
  useEffect(() => {
    if (chart?.id) {
      const cached = localStorage.getItem(`ai_thumbnail_${chart.id}`);
      if (cached) {
        setGeneratedImage(cached);
      }
    }
  }, [chart?.id]);

  const handleSaveApiToken = () => {
    if (!apiToken.trim()) {
      setError(
        new ReplicateError(
          'INVALID_TOKEN',
          'API 토큰을 입력해주세요.'
        )
      );
      return;
    }

    localStorage.setItem('replicate_api_token', apiToken);
    clientRef.current = new ReplicateClient(apiToken);
    setShowApiTokenModal(false);
    setError(null);
  };

  const generateThumbnail = async () => {
    if (!chart) {
      setError(
        new ReplicateError('UNKNOWN', '도안이 로드되지 않았습니다.')
      );
      return;
    }

    if (!clientRef.current) {
      setShowApiTokenModal(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setProgress(0);
      onGenerationStart?.();

      // 프롬프트 및 파라미터 생성
      const prompt = generatePrompt(chart);
      const negativePrompt = getNegativePrompt();
      const params = getOptimalParameters(chart);

      // ControlNet 마스크 생성
      console.log('[AI] ControlNet 마스크 생성 중...');
      const maskBase64 = await generateControlNetMask(chart);

      // Replicate API 호출
      console.log('[AI] Replicate API 호출...');
      console.log('Prompt:', prompt);
      console.log('Parameters:', params);

      const imageUrl = await clientRef.current.generateThumbnail(
        {
          prompt,
          negative_prompt: negativePrompt,
          control_image: maskBase64,
          ...params,
        },
        prediction => {
          // 진행 상황 업데이트
          if (prediction.status === 'processing') {
            // 대략적인 진행률 (0~90%)
            setProgress(prev => Math.min(prev + 10, 90));
          }
        }
      );

      setProgress(100);
      setGeneratedImage(imageUrl);

      // 캐시에 저장
      localStorage.setItem(`ai_thumbnail_${chart.id}`, imageUrl);

      onGenerationComplete?.(imageUrl);
    } catch (err) {
      const replicateError =
        err instanceof ReplicateError
          ? err
          : new ReplicateError('UNKNOWN', '알 수 없는 오류 발생', err);

      setError(replicateError);
      onError?.(replicateError);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = () => {
    if (chart?.id) {
      localStorage.removeItem(`ai_thumbnail_${chart.id}`);
      setGeneratedImage(null);
    }
  };

  if (!chart) {
    return (
      <div className="p-4 rounded-lg bg-rose-light/50 text-ink text-sm">
        도안을 먼저 선택해주세요.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 에러 표시 */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="font-semibold text-red-800 mb-2">
            {error.code === 'INVALID_TOKEN' && '❌ API 토큰 오류'}
            {error.code === 'RATE_LIMITED' && '⏱️ 호출 제한'}
            {error.code === 'GENERATION_FAILED' && '🎨 생성 실패'}
            {error.code === 'NETWORK_ERROR' && '🌐 네트워크 오류'}
            {error.code === 'TIMEOUT' && '⏳ 시간 초과'}
            {error.code === 'UNKNOWN' && '❓ 오류'}
          </div>
          <p className="text-red-700 text-sm">{error.message}</p>
          {error.code === 'INVALID_TOKEN' && (
            <button
              onClick={() => setShowApiTokenModal(true)}
              className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
            >
              API 토큰 설정
            </button>
          )}
        </div>
      )}

      {/* 생성된 이미지 표시 */}
      {generatedImage && !isLoading && (
        <div>
          <p className="text-sm font-medium text-ink mb-2">🎉 생성된 AI 스와치</p>
          <div className="relative rounded-lg overflow-hidden border-2 border-rose">
            <img
              src={generatedImage}
              alt="AI 생성 니트 스와치"
              className="w-full h-auto"
            />
          </div>
          <button
            onClick={clearCache}
            className="mt-2 text-xs text-ink-light hover:text-ink transition"
          >
            캐시 삭제 및 재생성
          </button>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink">AI 스와치 생성 중...</span>
            <span className="text-ink-light">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-warm-gray rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-light to-rose transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-ink-light">
            ⏱️ 생성 시간: 15~30초 소요됩니다.
          </p>
        </div>
      )}

      {/* 생성 버튼 */}
      {!isLoading && !generatedImage && (
        <button
          onClick={generateThumbnail}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-rose text-cream rounded-lg font-medium hover:bg-rose-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🎨 AI 스와치 생성
        </button>
      )}

      {/* API 토큰 모달 */}
      {showApiTokenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-ink mb-3">
              Replicate API 토큰 설정
            </h3>

            <p className="text-sm text-ink-light mb-4">
              AI 스와치를 생성하려면 Replicate API 토큰이 필요합니다.
            </p>

            <ol className="text-sm text-ink-light space-y-2 mb-4">
              <li>
                1.{' '}
                <a
                  href="https://replicate.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose hover:underline"
                >
                  replicate.com
                </a>
                에서 무료 계정 생성
              </li>
              <li>2. API 토큰 복사</li>
              <li>3. 아래에 붙여넣기</li>
            </ol>

            <input
              type="password"
              placeholder="r8_..."
              value={apiToken}
              onChange={e => setApiToken(e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg text-sm font-mono mb-4 focus:outline-none focus:ring-2 focus:ring-rose"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowApiTokenModal(false)}
                className="flex-1 px-3 py-2 border border-warm-border rounded-lg text-sm hover:bg-warm-gray transition"
              >
                취소
              </button>
              <button
                onClick={handleSaveApiToken}
                className="flex-1 px-3 py-2 bg-rose text-cream rounded-lg text-sm font-medium hover:bg-rose-dark transition"
              >
                저장
              </button>
            </div>

            <p className="text-xs text-ink-light mt-4 p-2 bg-warm-gray rounded">
              💡 토큰은 로컬 저장소(localStorage)에만 저장되며, 서버로 전송되지 않습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
