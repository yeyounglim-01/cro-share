/**
 * AI 썸네일 생성 유틸리티
 * 갤러리 공유 시 자동으로 실행
 */

import { KnitChartData } from '@/types/knit';
import {
  generatePrompt,
  getNegativePrompt,
  getOptimalParameters,
  generateControlNetMask,
} from './index';

/**
 * API 토큰을 안전하게 가져오기
 */
function getStoredApiToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('replicate_api_token');
  } catch {
    return null;
  }
}


/**
 * AI 썸네일 생성 (갤러리 공유 시 호출)
 *
 * @param chartData - 니트 도안 데이터
 * @param onProgress - 진행 상황 콜백 (선택사항)
 * @returns 생성된 이미지 URL 또는 에러 발생 시 null
 */
export async function generateAIThumbnail(
  chartData: KnitChartData,
  onProgress?: (status: string) => void
): Promise<string | null> {
  try {
    // API 토큰 확인
    const apiToken = getStoredApiToken();
    if (!apiToken) {
      console.warn('[AI] Replicate API 토큰이 없어서 AI 썸네일 생성 건너뜀');
      onProgress?.('API 토큰 없음');
      return null;
    }

    onProgress?.('🎨 프롬프트 생성 중...');
    const prompt = generatePrompt(chartData);
    const negativePrompt = getNegativePrompt();

    onProgress?.('🖼️ 도안 이미지 생성 중...');
    const patternImage = await generateControlNetMask(chartData);

    onProgress?.('✨ Stable Diffusion으로 니트 사진 생성 중... (약 30~60초 소요)');

    // API Route로 요청 (img2img - 도안 이미지 + 프롬프트)
    const generateResponse = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-replicate-token': apiToken,
      },
      body: JSON.stringify({
        prompt,
        negative_prompt: negativePrompt,
        patternImage: patternImage, // 도안 이미지 필수!
      }),
    });

    if (!generateResponse.ok) {
      const error = await generateResponse.json();
      throw new Error(error.error || 'AI 생성 요청 실패');
    }

    const result = await generateResponse.json();

    // flux-2-pro는 동기로 실행되므로 바로 결과가 반환됨
    if (!result.output || result.output.length === 0) {
      throw new Error('AI 생성에 실패했습니다.');
    }

    const imageUrl = result.output[0];

    onProgress?.('완료!');
    console.log('[AI] 썸네일 생성 완료:', imageUrl);

    return imageUrl;
  } catch (error) {
    console.error('[AI] 썸네일 생성 실패:', error);
    // 에러는 무시하고 null 반환 (기존 도안 썸네일 사용)
    return null;
  }
}

/**
 * 캐시에서 AI 썸네일 가져오기
 */
export function getCachedThumbnail(chartId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(`ai_thumbnail_${chartId}`);
  } catch {
    return null;
  }
}

/**
 * 캐시에 AI 썸네일 저장
 */
export function cacheThumbnail(chartId: string, imageUrl: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`ai_thumbnail_${chartId}`, imageUrl);
  } catch {
    // 용량 초과 등의 에러 무시
  }
}

/**
 * 캐시 삭제
 */
export function clearCachedThumbnail(chartId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`ai_thumbnail_${chartId}`);
  } catch {
    // 무시
  }
}
